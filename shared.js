// Initialize and export the shared instances
const {WatcherManager } = require('./classes.js');
const watcherManagerInstance = new WatcherManager();

module.exports = {
    watcherManagerInstance,
    // Export other shared instances or functions
};