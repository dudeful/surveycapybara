const { WebSocket, WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 5050 });

const options = {
	list: [
		{ id: 'option_1', votes: 0 },
		{ id: 'option_2', votes: 0 },
		{ id: 'option_3', votes: 0 },
		{ id: 'option_4', votes: 0 },
		{ id: 'option_5', votes: 0 },
		{ id: 'option_6', votes: 0 },
		{ id: 'option_7', votes: 0 },
	],
	total_votes: 0,
};

const message_history = [
	{ id: 1, user: 'test_1', body: 'hello_1' },
	{ id: 2, user: 'test_2', body: 'hello_2' },
	{ id: 3, user: 'test_3', body: 'hello_3' },
	{ id: 4, user: 'test_4', body: 'hello_4' },
	{ id: 5, user: 'test_5', body: 'hello_5' },
];

const castMessage = (parsed_data) => {
	message_history.push({
		id: message_history.length + 1,
		user: parsed_data.user.name,
		body: parsed_data.message,
	});

	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(parsed_data));
		}
	});
};

const castVote = (parsed_data) => {
	const option = options.list.find(
		(op) => op.id === parsed_data.vote
	);
	const optionIndex = options.list.indexOf(option);
	options.list[optionIndex].votes += 1;
	options.total_votes += 1;

	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ options, code: 1 }));
		}
	});
};

wss.on('connection', function connection(ws) {
	ws.on('message', function message(data) {
		try {
			const date = new Date();
			const parsed_data = JSON.parse(data.toString());
			parsed_data.timestamp = date.toISOString();
			parsed_data.user_id = 'tbd';

			switch (parsed_data.code) {
				case 1:
					castVote(parsed_data);
					break;
				case 2:
					castMessage(parsed_data);
					break;
				case 3:
					ws.send(
						JSON.stringify({ code: 3, options, message_history })
					);
					break;
				default:
					break;
			}
		} catch (error) {
			console.error(error);
			const msg = {
				error: true,
				message: 'something weird happened :S',
			};
			ws.send(JSON.stringify(msg));
		}
	});
});
