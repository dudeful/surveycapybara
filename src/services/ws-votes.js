const { WebSocket, WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 5005 });

let options = {
	option_1: 0,
	option_2: 0,
	option_3: 0,
	option_4: 0,
	total: 0,
};

wss.on('connection', function connection(ws) {
	ws.on('message', function message(data) {
		try {
			const date = new Date();
			let parsed_options = data.toString();
			parsed_options = JSON.parse(parsed_options);

			parsed_options.timestamp = date.toISOString();
			parsed_options.user_id = 'tbd';

			console.log(parsed_options);
			console.log(options);

			if (parsed_options.code === 1) {
				options[parsed_options.message] += 1;
				options.total += 1;
			}

			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(options));
				}
			});
		} catch (error) {
			console.error(error);
			ws.send('something weird happened');
		}
	});
});
