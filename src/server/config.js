const process = require('process');
const path = require('path');

var rootProjectDir = path.join(__dirname, '..', '..');
module.exports = {
	PORT: process.env.HIKU_PORT || 8080,
	DB_PATH: process.env.HIKU_DB_PATH || path.join(rootProjectDir, 'src', 'db', 'dev.db'),
	STATIC_ROOT: process.env.HIKU_STATIC_ROOT || path.join(rootProjectDir, 'src', 'client')
};