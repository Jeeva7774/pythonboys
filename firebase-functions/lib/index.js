"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.weeklyLeaderboardRollup = exports.onPostCreate = exports.onFocusSessionCreate = exports.aiChatHandler = exports.healthCheck = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const openai_1 = require("openai");
const cors = require("cors");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Enhanced OpenAI initialization with better error handling
const getOpenAIKey = () => {
    var _a;
    // Try Firebase config first
    const firebaseKey = (_a = functions.config().openai) === null || _a === void 0 ? void 0 : _a.key;
    if (firebaseKey) {
        console.log('✅ OpenAI API key loaded from Firebase config');
        return firebaseKey;
    }
    // Fallback to environment variable
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey) {
        console.log('✅ OpenAI API key loaded from environment');
        return envKey;
    }
    // Log error if no key found
    console.error('❌ OpenAI API key not found in Firebase config or environment');
    console.log('Set it with: firebase functions:config:set openai.key="YOUR_KEY"');
    return null;
};
const openaiKey = getOpenAIKey();
const openai = openaiKey ? new openai_1.OpenAI({ apiKey: openaiKey }) : null;
// CORS middleware
const corsHandler = cors({ origin: true });
// Region configuration for asia-south1
const regionalFunctions = functions.region('asia-south1');
// ============================================================================
// CLOUD FUNCTIONS
// ============================================================================
/**
 * Health Check Function - Test Firebase and API connectivity
 */
exports.healthCheck = regionalFunctions.https.onCall(async (data, context) => {
    var _a;
    console.log('🔍 Health check requested');
    const health = {
        timestamp: admin.firestore.Timestamp.now(),
        firebase: {
            admin: true,
            firestore: false,
            auth: false,
        },
        openai: {
            available: !!openai,
            keyConfigured: !!openaiKey,
        },
        user: {
            authenticated: !!context.auth,
            uid: ((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid) || null,
        },
    };
    try {
        // Test Firestore
        await db.collection('health').doc('test').set({ test: true });
        health.firebase.firestore = true;
        console.log('✅ Firestore connection successful');
    }
    catch (error) {
        console.error('❌ Firestore connection failed:', error);
    }
    try {
        // Test Auth (if user is authenticated)
        if (context.auth) {
            health.firebase.auth = true;
            console.log('✅ User authentication verified');
        }
    }
    catch (error) {
        console.error('❌ Auth verification failed:', error);
    }
    console.log('Health check result:', health);
    return health;
});
/**
 * AI Chat Handler - Processes user messages and returns AI responses
 */
exports.aiChatHandler = regionalFunctions.https.onCall(async (data, context) => {
    var _a, _b;
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { message, conversationHistory = [] } = data;
    const userId = context.auth.uid;
    if (!message || typeof message !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Message is required');
    }
    try {
        // Check if OpenAI is available
        if (!openai) {
            throw new functions.https.HttpsError('failed-precondition', 'AI service is not available. Please contact support.');
        }
        // Rate limiting: Check recent requests
        const recentRequests = await db
            .collection('users')
            .doc(userId)
            .collection('aiRequests')
            .where('timestamp', '>', admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60000))) // Last minute
            .get();
        if (recentRequests.size >= 10) {
            throw new functions.https.HttpsError('resource-exhausted', 'Too many requests. Please wait a minute.');
        }
        // Prepare conversation context
        const messages = [
            {
                role: 'system',
                content: `You are a helpful AI productivity assistant for the Mindful Screen app. 
        Help users with focus techniques, motivation, goal setting, time management, and productivity tips. 
        Keep responses concise, actionable, and encouraging. Use emojis sparingly but effectively.
        Focus on practical advice that can be implemented immediately.`
            },
            ...conversationHistory.slice(-10).map((msg) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            {
                role: 'user',
                content: message
            }
        ];
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 300,
            temperature: 0.7,
        });
        const aiResponse = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'I apologize, but I could not generate a response. Please try again.';
        // Log the request
        await db
            .collection('users')
            .doc(userId)
            .collection('aiRequests')
            .add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            message: message.substring(0, 100), // Store first 100 chars for analytics
        });
        // Store conversation in user's chat history
        const chatRef = db.collection('users').doc(userId).collection('chatHistory').doc();
        await chatRef.set({
            messages: [
                { sender: 'user', text: message, timestamp: admin.firestore.FieldValue.serverTimestamp() },
                { sender: 'ai', text: aiResponse, timestamp: admin.firestore.FieldValue.serverTimestamp() }
            ],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { response: aiResponse };
    }
    catch (error) {
        console.error('AI Chat Error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to process AI request');
    }
});
/**
 * Trigger when a focus session is created - Updates user XP and streak
 */
exports.onFocusSessionCreate = regionalFunctions.firestore
    .document('users/{userId}/focusSessions/{sessionId}')
    .onCreate(async (snap, context) => {
    var _a, _b, _c;
    const sessionData = snap.data();
    const userId = context.params.userId;
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.error('User document not found:', userId);
            return;
        }
        const userData = userDoc.data();
        const currentXP = userData.xp || 0;
        const currentStreak = userData.streak || 0;
        // Calculate points (1 XP per minute + bonuses)
        let pointsEarned = sessionData.duration || 0;
        // Bonus for longer sessions
        if (sessionData.duration >= 45) {
            pointsEarned += 10; // 45+ minute bonus
        }
        else if (sessionData.duration >= 25) {
            pointsEarned += 5; // 25+ minute bonus
        }
        // Calculate streak
        const today = new Date().toDateString();
        const lastSessionDate = (_c = (_b = (_a = userData.lastSessionDate) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        let newStreak = currentStreak;
        if (lastSessionDate === yesterday) {
            newStreak = currentStreak + 1; // Continue streak
        }
        else if (lastSessionDate !== today) {
            newStreak = 1; // Start new streak
        }
        // Update user document
        await userRef.update({
            xp: currentXP + pointsEarned,
            streak: newStreak,
            lastSessionDate: admin.firestore.FieldValue.serverTimestamp(),
            totalSessions: admin.firestore.FieldValue.increment(1),
            totalMinutes: admin.firestore.FieldValue.increment(sessionData.duration || 0),
        });
        // Check for achievements
        await checkAndAwardAchievements(userId, {
            newXP: currentXP + pointsEarned,
            newStreak,
            sessionDuration: sessionData.duration,
        });
        // Update community leaderboards if user is in communities
        await updateCommunityLeaderboards(userId, pointsEarned);
        console.log(`Updated user ${userId}: +${pointsEarned} XP, streak: ${newStreak}`);
    }
    catch (error) {
        console.error('Error processing focus session:', error);
    }
});
/**
 * Trigger when a community post is created
 */
exports.onPostCreate = regionalFunctions.firestore
    .document('communities/{communityId}/posts/{postId}')
    .onCreate(async (snap, context) => {
    const postData = snap.data();
    const communityId = context.params.communityId;
    const authorId = postData.authorId;
    try {
        // Award XP to post author
        if (authorId) {
            const userRef = db.collection('users').doc(authorId);
            await userRef.update({
                xp: admin.firestore.FieldValue.increment(10), // 10 XP for posting
            });
        }
        // Update community stats
        const communityRef = db.collection('communities').doc(communityId);
        await communityRef.update({
            postsCount: admin.firestore.FieldValue.increment(1),
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Post created in community ${communityId} by user ${authorId}`);
    }
    catch (error) {
        console.error('Error processing post creation:', error);
    }
});
/**
 * Scheduled function to compute weekly leaderboards
 */
exports.weeklyLeaderboardRollup = regionalFunctions.pubsub
    .schedule('0 0 * * 1') // Every Monday at midnight
    .timeZone('Asia/Kolkata')
    .onRun(async (context) => {
    try {
        console.log('Starting weekly leaderboard rollup...');
        const now = new Date();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        // Get all communities
        const communitiesSnapshot = await db.collection('communities').get();
        for (const communityDoc of communitiesSnapshot.docs) {
            const communityId = communityDoc.id;
            // Get community members' XP for the week
            const membersSnapshot = await db
                .collection('users')
                .where('communities', 'array-contains', communityId)
                .get();
            const leaderboardEntries = [];
            for (const memberDoc of membersSnapshot.docs) {
                const userId = memberDoc.id;
                const userData = memberDoc.data();
                // Get user's sessions from the past week
                const sessionsSnapshot = await db
                    .collection('users')
                    .doc(userId)
                    .collection('focusSessions')
                    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
                    .get();
                const weeklyXP = sessionsSnapshot.docs.reduce((total, doc) => {
                    return total + (doc.data().pointsEarned || 0);
                }, 0);
                if (weeklyXP > 0) {
                    leaderboardEntries.push({
                        userId,
                        displayName: userData.displayName || 'Anonymous',
                        weeklyXP,
                        totalXP: userData.xp || 0,
                    });
                }
            }
            // Sort by weekly XP
            leaderboardEntries.sort((a, b) => b.weeklyXP - a.weeklyXP);
            // Store leaderboard
            const leaderboardId = `weekly-${communityId}-${now.getFullYear()}-${now.getMonth()}-${Math.floor(now.getDate() / 7)}`;
            await db.collection('leaderboards').doc(leaderboardId).set({
                communityId,
                type: 'weekly',
                periodStart: admin.firestore.Timestamp.fromDate(weekStart),
                periodEnd: admin.firestore.Timestamp.fromDate(now),
                entries: leaderboardEntries.slice(0, 50),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Created weekly leaderboard for community ${communityId}: ${leaderboardEntries.length} entries`);
        }
        // Global leaderboard
        const globalUsersSnapshot = await db.collection('users').orderBy('xp', 'desc').limit(100).get();
        const globalEntries = globalUsersSnapshot.docs.map(doc => ({
            userId: doc.id,
            displayName: doc.data().displayName || 'Anonymous',
            totalXP: doc.data().xp || 0,
        }));
        const globalLeaderboardId = `global-weekly-${now.getFullYear()}-${now.getMonth()}-${Math.floor(now.getDate() / 7)}`;
        await db.collection('leaderboards').doc(globalLeaderboardId).set({
            type: 'global-weekly',
            periodStart: admin.firestore.Timestamp.fromDate(weekStart),
            periodEnd: admin.firestore.Timestamp.fromDate(now),
            entries: globalEntries,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Weekly leaderboard rollup completed successfully');
    }
    catch (error) {
        console.error('Error in weekly leaderboard rollup:', error);
    }
});
/**
 * Send push notifications
 */
exports.sendNotification = regionalFunctions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { userId, title, body, type = 'general' } = data;
    try {
        // Get user's FCM token
        const userDoc = await db.collection('users').doc(userId).get();
        const fcmToken = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.fcmToken;
        if (!fcmToken) {
            throw new functions.https.HttpsError('not-found', 'User FCM token not found');
        }
        // Send notification
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                type,
                timestamp: Date.now().toString(),
            },
            token: fcmToken,
        };
        const response = await admin.messaging().send(message);
        console.log('Notification sent successfully:', response);
        return { success: true, messageId: response };
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
});
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
async function checkAndAwardAchievements(userId, stats) {
    var _a;
    const achievements = [
        { id: 'first_session', name: 'First Steps', condition: () => stats.newXP >= 25, xpReward: 50 },
        { id: 'week_warrior', name: 'Week Warrior', condition: () => stats.newStreak >= 7, xpReward: 100 },
        { id: 'focus_master', name: 'Focus Master', condition: () => stats.newXP >= 1000, xpReward: 200 },
        { id: 'marathon_session', name: 'Marathon Session', condition: () => stats.sessionDuration >= 90, xpReward: 75 },
        { id: 'consistency_king', name: 'Consistency King', condition: () => stats.newStreak >= 30, xpReward: 300 },
    ];
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const earnedAchievements = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.achievements) || [];
    for (const achievement of achievements) {
        if (!earnedAchievements.includes(achievement.id) && achievement.condition()) {
            // Award achievement
            await userRef.update({
                achievements: admin.firestore.FieldValue.arrayUnion(achievement.id),
                xp: admin.firestore.FieldValue.increment(achievement.xpReward),
            });
            // Send notification
            try {
                await (0, exports.sendNotification)({
                    userId,
                    title: '🏆 Achievement Unlocked!',
                    body: `You earned "${achievement.name}" (+${achievement.xpReward} XP)`,
                    type: 'achievement',
                }, { auth: { uid: userId } });
            }
            catch (e) {
                console.warn('Failed to send achievement notification:', e);
            }
            console.log(`Awarded achievement ${achievement.id} to user ${userId}`);
        }
    }
}
async function updateCommunityLeaderboards(userId, pointsEarned) {
    var _a, _b;
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userCommunities = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.communities) || [];
        for (const communityId of userCommunities) {
            const leaderboardRef = db
                .collection('communities')
                .doc(communityId)
                .collection('leaderboard')
                .doc(userId);
            await leaderboardRef.set({
                userId,
                displayName: ((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.displayName) || 'Anonymous',
                xp: admin.firestore.FieldValue.increment(pointsEarned),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
    }
    catch (error) {
        console.error('Error updating community leaderboards:', error);
    }
}
//# sourceMappingURL=index.js.map