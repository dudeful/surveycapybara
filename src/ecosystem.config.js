module.exports = {
	apps: [
		{
			name: 'Server',
			script: './server.js',
			watch: true,
		},
		{
			name: 'WS',
			script: './services/ws.js',
			watch: true,
		},
	],
};
