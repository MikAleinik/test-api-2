const MessagePool = require('../../../pool/message-pool');
const Message = require('../../../model/message/message-model');
const DefaultHandler = require('../../default-handler');
const { HANDLER_RECEIVER_INVALID, HANDLER_RECEIVER_NOT_FOUND } = require('./handler-messages');
const { PAYLOAD_INVALID, TYPE_INVALID } = require('../../default-messages');
const ConnectionPool = require('../../../pool/connection-pool');
const UserPool = require('../../../pool/user-pool');

module.exports = class MessageSendHandler extends DefaultHandler {
  type = process.env.MSG_SEND;
  /**
   * @param {string} currentUserLogin
   */
  constructor(currentUserLogin) {
    super();
    this.from = currentUserLogin;
  }
  /**
   * @param {import('../../../model/connection-message/connection-message-model').ConnectionMessage} message
   * @returns {boolean}
   */
  handle(message) {
    if (this.type !== message.type && this.nextHandler) {
      return this.nextHandler.handle(message);
    }
    if (this.type !== message.type && !this.nextHandler) {
      return this.getErrorAnswer(TYPE_INVALID);
    }

    if (!message.payload.message || !Message.isCorrectShortPayload(message.payload.message)) {
      return this.getErrorAnswer(PAYLOAD_INVALID);
    }

    if (this.from === message.payload.login) {
      return this.getErrorAnswer(HANDLER_RECEIVER_INVALID);
    }

    const messageModel = new Message(this.from, message.payload.message);
    const userTo = UserPool.getInstance().getUser(message.payload.message.to);
    if (userTo === null) {
      return this.getErrorAnswer(HANDLER_RECEIVER_NOT_FOUND);
    }

    const result = {
      message: null,
    };

    const messagePool = MessagePool.getInstance();
    messagePool.addMessage(messageModel);

    if (userTo.isLogined) {
      const connectionsPool = ConnectionPool.getInstance();
      const userConnection = connectionsPool.getConnectionByLogin(messageModel.to);

      messageModel.isDelivered = true;
      result.message = messageModel.getPayload();
      const messageTo = {
        id: null,
        type: process.env.MSG_RECEIVE,
        payload: {
          message: result.message,
        },
      };
      userConnection.messageHandler(messageTo);
    }

    result.message = messageModel.getPayload();

    return result;
  }
};
