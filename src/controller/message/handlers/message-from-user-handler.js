const MessagePool = require('../../../pool/message-pool');
const DefaultHandler = require('../../default-handler');
const ConnectionPool = require('../../../pool/connection-pool');
const { HANDLER_RECEIVER_INVALID } = require('./handler-messages');
const { PAYLOAD_INVALID, TYPE_INVALID } = require('../../default-messages');

module.exports = class MessageFromUserHandler extends DefaultHandler {
  type = process.env.MSG_FROM_USER;
  /**
   * @param {string} currentUserLogin
   */
  constructor(currentUserLogin) {
    super();
    this.currentUserLogin = currentUserLogin;
  }
  /**
   * @param {import('../../../model/connection-message/connection-message-model').ConnectionMessage} message
   * @returns {import('../../../model/message/message-model')}
   */
  handle(message) {
    if (this.type !== message.type && this.nextHandler) {
      return this.nextHandler.handle(message);
    }
    if (this.type !== message.type && !this.nextHandler) {
      return this.getErrorAnswer(TYPE_INVALID);
    }

    if (!message.payload.user || !message.payload.user.login) {
      return this.getErrorAnswer(PAYLOAD_INVALID);
    }

    if (this.currentUserLogin === message.payload.user.login) {
      return this.getErrorAnswer(HANDLER_RECEIVER_INVALID);
    }

    const result = {
      messages: [],
    };

    const messagePool = MessagePool.getInstance();
    const messagesCurrentFrom = messagePool.getMessageByUserFromTo(this.currentUserLogin, message.payload.user.login);
    const messagesCurrentTo = messagePool.getMessageByUserFromTo(message.payload.user.login, this.currentUserLogin);
    messagesCurrentTo.forEach((msg) => {
      if (!msg.status.isDelivered) {
        // eslint-disable-next-line no-param-reassign
        msg.isDelivered = true;
        this.#sendDeliveredNotify(msg);
      }
    });
    result.messages = [
      ...messagesCurrentFrom.map((msg) => msg.getPayload()),
      ...messagesCurrentTo.map((msg) => msg.getPayload()),
    ].sort((msgA, msgB) => msgA.datetime - msgB.datetime);

    return result;
  }
  /**
   * @param {Message} message
   */
  #sendDeliveredNotify(message) {
    const connectionsPool = ConnectionPool.getInstance();
    const userConnection = connectionsPool.getConnectionByLogin(message.from);
    const userFrom = userConnection.getUser();
    if (userFrom.isLogined) {
      const messageFrom = {
        id: null,
        type: process.env.MSG_DELIVERED,
        payload: {
          message: {
            id: message.id,
            status: {
              isDelivered: message.status.isDelivered,
            },
          },
        },
      };
      userConnection.messageHandler(messageFrom);
      return true;
    }
    return false;
  }
};
