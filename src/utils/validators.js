const options = (data) => {
  return 'hello friend';
};

const email = (email) => {
  const regex = { email: /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,4})+$/ };

  if (!regex.email.test(email)) {
    throw new Error('the email provided is not valid!');
  }

  return email;
};

const password = (password) => {
  const regex = { password: /(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*/ };

  if (!regex.password.test(password)) {
    throw new Error('the password provided is not valid!');
  }

  return password;
};

const username = (username) => {
  const regex = { username: /^[a-zA-Z\xC0-\uFFFF]{3,20}$/ };

  if (!regex.username.test(username)) {
    throw new Error('the username provided is not valid!');
  }

  return username;
};

module.exports = { email, password, username, options };
