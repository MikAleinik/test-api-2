const AuthController = require('../controller/auth/auth-controller');
const Logger = require('../logger/logger');
const UserModel = require('../model/user/user-model');
const UserState = require('../pool/user-pool');
const { TYPE_INVALID } = require('../controller/default-messages');
const MessageController = require('../controller/message/message-controller');
const UserController = require('../controller/user/user-controller');

module.exports = class Connection {
  /** @type {WebSocket} */
  #socket = null;
  /** @type {string} */
  #connectionId = null;
  /** @type {UserModel} */
  #user = null;

  #logger = new Logger();
  /**
   * @param {WebSocket} socket
   * @param {string} connectionId
   */
  constructor(socket, connectionId) {
    this.#socket = socket;
    this.#connectionId = connectionId;

    this.#user = new UserModel();

    this.#setEventHandlers();
  }
  getUser() {
    return this.#user;
  }
  getConnectionId() {
    return this.#connectionId;
  }
  /**
   * @param {import('../model/connection-message/connection-message-model').ConnectionMessage} message
   */
  messageHandler(message) {
    this.#logger.log({ header: 'Incoming', connection: this.#connectionId, data: message });

    /** @type {import('../model/connection-message/connection-message-model').ConnectionMessage} */
    const answer = {
      id: message.id,
      type: message.type,
      payload: null,
    };

    switch (message.type) {
      case process.env.USER_LOGIN:
      case process.env.USER_LOGOUT: {
        const authController = new AuthController();
        answer.payload = authController.run(message);

        if (answer.payload.user) {
          const userState = UserState.getInstance();
          this.#user = userState.getUser(message.payload.user.login);

          const messageToAll = Object.create(answer, {});
          messageToAll.id = null;
          messageToAll.type =
            message.type === process.env.USER_LOGIN
              ? process.env.USER_EXTERNAL_LOGIN
              : process.env.USER_EXTERNAL_LOGOUT;
          messageToAll.payload = {
            user: answer.payload.user,
          };
          authController.run(messageToAll);
        }
        break;
      }
      case process.env.USER_ACTIVE:
      case process.env.USER_INACTIVE: {
        const userController = new UserController();
        answer.payload = userController.run(message);
        break;
      }
      case process.env.MSG_RECEIVE:
      case process.env.MSG_DELIVERED:
      case process.env.USER_EXTERNAL_LOGIN:
      case process.env.USER_EXTERNAL_LOGOUT: {
        answer.payload = message.payload;
        break;
      }
      case process.env.MSG_SEND:
      case process.env.MSG_READED:
      case process.env.MSG_EDIT:
      case process.env.MSG_DELETE:
      case process.env.MSG_FROM_USER: {
        const messageController = new MessageController(this.#user);
        answer.payload = messageController.run(message);
        break;
      }
      case process.env.MSG_READED_FROM_SERVER: {
        answer.type = process.env.MSG_READED;
        answer.payload = message.payload;
        break;
      }
      case process.env.MSG_DELETED_FROM_SERVER: {
        answer.type = process.env.MSG_DELETE;
        answer.payload = message.payload;
        break;
      }
      case process.env.MSG_EDITED_FROM_SERVER: {
        answer.type = process.env.MSG_EDIT;
        answer.payload = message.payload;
        break;
      }
      default: {
        answer.type = process.env.ERROR;
        answer.payload = {
          error: TYPE_INVALID,
        };
      }
    }

    if ('error' in answer.payload) {
      answer.type = process.env.ERROR;
    }

    this.#sendMessage(answer);
  }
  #clientMessageHandler(data) {
    const message = JSON.parse(data);

    switch (message.type) {
      case process.env.ERROR:
      case process.env.USER_EXTERNAL_LOGIN:
      case process.env.USER_EXTERNAL_LOGOUT:
      case process.env.MSG_DELIVERED:
      case process.env.MSG_RECEIVE:
      case process.env.MSG_DELETE_FROM_SERVER:
      case process.env.MSG_READED_FROM_SERVER: {
        /** @type {import('../model/connection-message/connection-message-model').ConnectionMessage} */
        const answer = {
          id: message.id,
          type: process.env.ERROR,
          payload: {
            error: TYPE_INVALID,
          },
        };

        this.#sendMessage(answer);
        break;
      }
      default: {
        this.messageHandler(message);
      }
    }
  }
  #closeHandler() {
    this.#socket = null;
    if (this.#user !== null) {
      /** @type {import('../model/connection-message/connection-message-model').ConnectionMessage} */
      const messageToAll = {
        type: process.env.USER_EXTERNAL_LOGOUT,
        payload: {
          login: this.#user.login,
        },
      };
      const authController = new AuthController();
      authController.run(messageToAll);
      this.#user.isLogined = false;
      this.#user = null;
    }
  }
  #errorHandler() {
    this.#closeHandler();
  }
  #setEventHandlers() {
    this.#socket.on('error', this.#errorHandler.bind(this));
    this.#socket.on('close', this.#closeHandler.bind(this));
    this.#socket.on('message', this.#clientMessageHandler.bind(this));
  }
  /**
   * @param {import('../model/connection-message/connection-message-model').ConnectionMessage} answer
   */
  #sendMessage(answer) {
    this.#socket.send(JSON.stringify(answer));

    this.#logger.log({ header: 'Outcoming', connection: this.#connectionId, data: answer });
  }
};
