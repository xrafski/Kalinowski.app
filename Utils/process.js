const mongoose = require('mongoose');

module.exports = async () => {
	process.on('unhandledRejection', (error) => {
		console.warn('[kalinowski] Unhandled promise rejection:', error);
	});

	process.on('SIGINT', () => {
		console.log('[kalinowski] Database disconnecting on app termination.');
		if (mongoose.connection.readyState === 1) {
			mongoose.connection.close(() => {
				process.exit(0);
			});
		}
	});

	process.on('exit', (code) => {
		console.warn(`[kalinowski] About to exit with code: ${code}`);
	});
};