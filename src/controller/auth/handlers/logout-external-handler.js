const LoginExternalHandler = require('./login-external-handler');

module.exports = class LogoutExternalHandler extends LoginExternalHandler {
  type = process.env.USER_EXTERNAL_LOGOUT;
};
