const MessagePool = require('../../../pool/message-pool');
const DefaultHandler = require('../../default-handler');
const ConnectionPool = require('../../../pool/connection-pool');
const { HANDLER_ID_MESSAGE_INVALID, HANDLER_USER_NOT_SENDER } = require('./handler-messages');
const { PAYLOAD_INVALID, TYPE_INVALID } = require('../../default-messages');

module.exports = class MessageDeleteHandler extends DefaultHandler {
  type = process.env.MSG_DELETE;
  /**
   * @param {string} currentUserLogin
   */
  constructor(currentUserLogin) {
    super();
    this.currentUserLogin = currentUserLogin;
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

    if (typeof message.payload.message.id !== 'string') {
      return this.getErrorAnswer(PAYLOAD_INVALID);
    }

    const messagePool = MessagePool.getInstance();

    const msg = messagePool.getMessageById(message.payload.message.id);
    if (msg === null) {
      return this.getErrorAnswer(HANDLER_ID_MESSAGE_INVALID);
    }

    const sender = msg.from;
    const receiver = msg.to;
    if (this.currentUserLogin !== sender) {
      return this.getErrorAnswer(HANDLER_USER_NOT_SENDER);
    }

    const isDeleted = messagePool.deleteMessage(message.payload.message.id);
    if (!isDeleted) {
      return this.getErrorAnswer(HANDLER_ID_MESSAGE_INVALID);
    }

    const result = {
      message: {
        id: message.payload.message.id,
        status: {
          isDeleted,
        },
      },
    };

    const connectionsPool = ConnectionPool.getInstance();
    const userConnection = connectionsPool.getConnectionByLogin(receiver);
    if (userConnection) {
      const messageFrom = {
        id: null,
        type: process.env.MSG_DELETED_FROM_SERVER,
        payload: result,
      };
      userConnection.messageHandler(messageFrom);
    }

    return result;
  }
};
