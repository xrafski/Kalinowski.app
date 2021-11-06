const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = () => {
	process.on('unhandledRejection', (error) => {
		logger.trace('[kalinowski] Unhandled promise rejection:', error);
	});

	process.on('SIGINT', () => {
		logger.log('[kalinowski] Database disconnecting on app termination.');
		if (mongoose.connection.readyState === 1) {
			mongoose.connection.close(() => {
				process.exit(0);
			});
		}
	});

	process.on('exit', (code) => {
		logger.log('[kalinowski] About to exit with code', code);
	});
};