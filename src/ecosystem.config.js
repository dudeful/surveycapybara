module.exports = {
	apps: [
		{
			name: 'Server',
			script: './server.js',
			watch: true,
		},
		{
			name: 'Chat',
			script: './services/ws-chat.js',
			watch: true,
		},
		{
			name: 'Votes',
			script: './services/ws-votes.js',
			watch: true,
		},
	],
};
