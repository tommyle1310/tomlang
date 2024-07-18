User Management Routes
POST /api/users/register: Register a new user.
POST /api/users/login: User login.
GET /api/users/profile/: Get user profile.
PUT /api/users/profile/: Update user profile.
DELETE /api/users/: Delete user account.



Lesson Content Routes
GET /api/lessons: Get all lessons.
GET /api/lessons/: Get a specific lesson.
POST /api/lessons: Create a new lesson.
PUT /api/lessons/: Update a lesson.
DELETE /api/lessons/: Delete a lesson.
GET /api/lessons/content/: Get lesson content.
POST /api/lessons/exercise/: Submit lesson exercise.
GET /api/lessons/recommendations/: Get lesson recommendations.



Gamification Routes
GET /api/gamification/leaderboard: Get leaderboard.
GET /api/gamification/points/: Get user points.
POST /api/gamification/points: Update user points.
GET /api/gamification/badges/: Get user badges.
POST /api/gamification/badges: Award badge to user.



AI Personalization Routes
GET /api/ai/learning-path/: Get personalized learning path.
POST /api/ai/update-model: Update AI model with user data.


Live Tutoring Routes
POST /api/tutoring/session: Create a new tutoring session.
GET /api/tutoring/session/: Get tutoring session details.
POST /api/tutoring/session/
/join: Join a tutoring session.
POST /api/tutoring/session/
/end: End a tutoring session.



Community Features Routes
GET /api/community/forums: Get all forums.
POST /api/community/forums: Create a new forum.
GET /api/community/forums/: Get a specific forum.
POST /api/community/forums/
/posts: Create a new post in a forum.
GET /api/community/forums/
/posts: Get all posts in a forum.
POST /api/community/chat: Send a message in the chat.
GET /api/community/chat: Get chat messages.




Progress Tracking Routes
GET /api/progress/: Get user progress.
PUT /api/progress/: Update user progress.
GET /api/progress/
/milestones: Get user milestones.
POST /api/progress/
/milestones: Add a new milestone for the user.




Analytics and Reporting Routes
GET /api/analytics/activity/: Get user activity log.
GET /api/analytics/usage: Get platform usage statistics.
GET /api/analytics/reports: Generate reports.




Mobile App Routes
GET /api/mobile/offline-content: Get downloadable content for offline use.
POST /api/mobile/sync: Sync mobile app with web platform.



Miscellaneous Routes
GET /api/settings: Get platform settings.
PUT /api/settings: Update platform settings.
GET /api/languages: Get supported languages.
POST /api/feedback: Submit user feedback.