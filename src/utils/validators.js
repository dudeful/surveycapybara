const password = (data) => {
	if (data.length < 8) {
		throw new Error('password must be at least 8 characteres long');
	}
	return 'hello friend';
};

const email = (data) => {
	return 'hello friend';
};

const options = (data) => {
	return 'hello friend';
};

module.exports = { password, email, options };
