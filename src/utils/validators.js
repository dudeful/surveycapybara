const options = (data) => {
  return 'hello friend';
};

const user = (data) => {
  const { username, email, password } = data;

  const regex = {
    username: /^[a-zA-Z\xC0-\uFFFF]{3,20}$/,
    email: /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,4})+$/,
    password: /(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*/,
  };

  if (
    !regex.username.test(username) ||
    !regex.email.test(email) ||
    !regex.password.test(password)
  ) {
    throw new Error('some inputs provided are not valid!');
  }

  return { username, email, password };
};

module.exports = { user, options };
