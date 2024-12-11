const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Cloud function to update completed tasks count per week
exports.updateCompletedTasksAnalytics = functions.firestore
    .document('tasks/{taskId}')
    .onUpdate(async (change, context) => {
        const taskBefore = change.before.data();
        const taskAfter = change.after.data();

        // Check if the task completion status has changed
        if (taskBefore.completed !== taskAfter.completed) {
            const completed = taskAfter.completed;
            const completedAt = taskAfter.completed ? admin.firestore.FieldValue.serverTimestamp() : null;

            if (completed) {
                // Update completed tasks in Firestore
                const analyticsRef = admin.firestore().collection('analytics').doc('tasks');
                const analyticsDoc = await analyticsRef.get();

                const analyticsData = analyticsDoc.exists ? analyticsDoc.data() : { completedTasksPerWeek: {} };

                const currentDate = new Date();
                const currentWeek = getWeekNumber(currentDate); // Function to calculate current week number

                if (!analyticsData.completedTasksPerWeek[currentWeek]) {
                    analyticsData.completedTasksPerWeek[currentWeek] = 0;
                }

                // Increment the count of completed tasks for the current week
                analyticsData.completedTasksPerWeek[currentWeek] += 1;

                await analyticsRef.set(analyticsData);
            }
        }
    });

// Helper function to calculate the week number for a given date
function getWeekNumber(date) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
}
