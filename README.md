## Серверное приложение для чата. API

### Общая информация

Инициатором запроса может выступать клиентское (клиент) или серверное (сервер) приложение.
При запросе на сервер клиенту будет отправлен ответ содержащий информацию о результате обработки запроса. Отдельные запросы клиента могут инициировать на сервере отправку дополнительных запросов другим клиентам - подобные ситуации указаны в описании запроса.

<details>
<summary markdown="span">Общий вид запроса</summary>

```javascript
{
  id: string | null
  type: string,
  payload: {
    //полезная нагрузка запроса
  },
}
```

где:

- `id` - идентификатор запроса, формируется клиентским приложением, значение будет возвращено сервером в ответе в поле `id`
- `type` - название запроса
- `payload` - полезная нагрузка запроса
</details>

### Авторизация пользователя

Инициатор - клиентское приложение

Описание - используется для выполнения авторизации текущего пользователя или создания нового пользователя, при успешном завершении сервер выполняет всем авторизованным пользователям отправку запроса в соответствии с пунктом ["Авторизация стороннего пользователя"](#Авторизация-стороннего-пользователя)

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string
type: "USER_LOGIN"
payload: {
  user: {
    login: string,
    password: string,
  }
}
```

где:

- `id` - идентификатор запроса
- `login` - логин пользователя
- `password` - пароль пользователя
</details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string
type: "USER_LOGIN"
payload: {
  user: {
    login: string,
    isLogined: boolean,
  }
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `login` - логин пользователя
- `isLogined` - текущий статус авторизации пользователя
</details>

<details>
<summary markdown="span">Ответы от сервера при ошибках</summary>

- пользователь с указанным логином уже авторизован

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: "a user with this login is already authorized",
  }
  ```

- переданный пароль не соответствует переданному логину

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: "incorrect password",
  }
  ```

  где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание причины ошибки
</details>

### Выход пользователя

Инициатор - клиентское приложение для завершения сеанса у авторизованного пользователя

Описание - используется для завершения сеанса у текущего пользователя, при успешном завершении сервер выполняет всем авторизованным пользователям отправку сообщения в соответствии с пунктом ["Выход стороннего пользователя"](#Выход-стороннего-пользователя)

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string,
type: "USER_LOGOUT"
payload: {
  user: {
    login: string,
    password: string,
  }
}
```

где:

- `id` - идентификатор запроса
- `login` - логин пользователя
- `password` - пароль пользователя
</details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string,
type: "USER_LOGOUT"
payload: {
  user {
    login: string,
    isLogined: boolean,
  }
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `login` - логин пользователя
- `isLogined` - текущий статус авторизации пользователя
</details>

<details>
<summary markdown="span">Ответы от сервера при ошибках</summary>

- пользователь с указанным логином не существует

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: "there is no user with this login",
  }
  ```

- переданный пароль не соответствует переданному логину

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: "incorrect password",
  }
  ```

- пользователь с указанным логином не авторизован

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: "the user was not authorized",
  }
  ```

  где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание причины ошибки
</details>

### Авторизация стороннего пользователя

Инициатор - серверное приложение

Описание - сервер отправляет всем авторизованным пользователям после полученного сообщения в соответствии с ["Авторизация текущего пользователя"](#Авторизация-текущего-пользователя) по результату обработки которого пользователь был успешно авторизован

<details>
<summary markdown="span">Запрос от сервера</summary>

```javascript
id: null,
type: "USER_EXTERNAL_LOGIN"
payload: {
  user: {
    login: string,
    isLogined: boolean,
  }
}
```

где:

- `id` - идентификатор запроса сформированный сервером
- `login` - логин пользователя который авторизовался
- `isLogined` - текущий статус авторизации пользователя
</details>

### Выход стороннего пользователя

Инициатор - серверное приложение

Описание - сервер отправляет всем авторизованным пользователям после полученного сообщения в соответствии с ["Выход текущего пользователя"](#Выход-текущего-пользователя) по результату обработки которого пользователь завершил сеанс

<details>
<summary markdown="span">Запрос от сервера</summary>

```javascript
id: null,
type: "USER_EXTERNAL_LOGOUT"
payload: {
  user: {
    login: string,
    isLogined: boolean,
  }
}
```

где:

- `id` - идентификатор запроса сформированный сервером
- `login` - логин пользователя который вышел из приложения
- `isLogined` - текущий статус авторизации пользователя
</details>

### Получение всех авторизованных пользователей

Инициатор - клиентское приложение

Описание - используется для получения списка всех авторизованных пользователей

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string,
type: "USER_ACTIVE",
payload: null,
```

где:

- `id` - идентификатор запроса
</details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string,
type: "USER_ACTIVE"
payload: {
  users: [],
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `users` - массив авторизованных пользователей структурно соответствующий полю `user` в ["Авторизация стороннего пользователя"](#Авторизация-стороннего-пользователя), пустой массив не является ошибкой
</details>

### Получение всех не авторизованных пользователей

Инициатор - клиентское приложение

Описание - используется для получения списка всех не авторизованных пользователей

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string,
type: "USER_INACTIVE",
payload: null,
```

где:

- `id` - идентификатор запроса
</details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string,
type: "USER_INACTIVE"
payload: {
  users: [],
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `users` - массив не авторизованных пользователей структурно соответствующий полю `user` в ["Авторизация стороннего пользователя"](#Авторизация-стороннего-пользователя), пустой массив не является ошибкой
</details>

### Отправление сообщения пользователю

Инициатор - клиентское приложение

Описание - используется для отправки сообщения другому пользователю и если получатель сообщения авторизован, то сообщение сразу ему направляется в соответствии с ["Получение сообщения от пользователя"](#Получение-сообщения-от-пользователя), если получатель не авторизован, то сообщение будет получено вместе со всеми сообщениями при запросе в соответствии с ["Получение истории сообщений с пользователем"](#Получение-истории-сообщений-с-пользователем)

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string,
type: "MSG_SEND"
payload: {
  message: {
    to: string,
    text: string,
  }
}
```

где:

- `id` - идентификатор запроса
- `login` - логин пользователя которому отправляется сообщение
- `text` - текст сообщения
</details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string,
type: "MSG_SEND"
payload: {
  message: {
    id: string,
    from: string,
    to: string,
    text: string,
    datetime: number,
    status: {
      isDelivered: boolean,
      isReaded: boolean,
      isEdited: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `message` - созданное сообщение, в котором:
  - `id` - идентификатор сообщения, формируется сервером
  - `from` - отправитель сообщения
  - `to` - получатель сообщения
  - `text` - текст сообщения
  - `datetime` - дата и время отправления сообщения
  - `isDelivered` - статус доставлено ли сообщение получателю
  - `isReaded` - статус прочитано ли сообщение получателем
  - `isEdited` - статус изменялось ли сообщение отправителем
  </details>

<details>
<summary markdown="span">Ответы от сервера при ошибках</summary>

- логин отправителя совпадает с логином получателя

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: 'sender and recipient logins are the same',
  }
  ```

- пользователя с указанным логином не существует

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: 'the user with the specified login does not exist',
  }
  ```

  где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание причины ошибки
</details>

### Получение сообщения от пользователя

Инициатор - серверное приложение

Описание - отправляется сервером пользователю указанному как получатель при запросе в соответствии с ["Отправление сообщения пользователю"](#Отправление-сообщения-пользователю), сообщение направляется если пользователь получатель авторизован

<details>
<summary markdown="span">Запрос от сервера</summary>

```javascript
id: null,
type: "MSG_RECEIVE"
payload: {
  message: {
    id: string,
    from: string,
    to: string,
    text: string,
    datetime: number,
    status: {
      isDelivered: boolean,
      isReaded: boolean,
      isEdited: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса сформированный сервером
- `message` - поле сообщения пользователя в котором:
  - `id` - идентификатор сообщения
  - `from` - отправитель сообщения
  - `to` - получатель сообщения
  - `text` - текст сообщения
  - `datetime` - дата и время отправления сообщения
  - `isDelivered` - статус доставлено ли сообщение получателю
  - `isReaded` - статус прочитано ли сообщение получателем
  - `isEdited` - статус изменялось ли сообщение отправителем
  </details>

### Получение истории сообщений с пользователем

Инициатор - клиентское приложение

Описание - используется для получения списка всех сообщений с определенным пользователем, во всех сообщениях имеющих статус `isDelivered` со значением `false` значение изменяется на `true` и для каждого сообщения сервером выполнится запрос к пользователю отправителю в соответствии с ["Уведомление об изменении у сообщения статуса доставлено"](#Уведомление-об-изменении-у-сообщения-статуса-доставлено)

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string,
type: "MSG_FROM_USER"
payload: {
  user: {
    login: string,
  }
}
```

где:

- `id` - идентификатор запроса
- `login` - логин пользователя с которым требуется история сообщений
</details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string,
type: "MSG_FROM_USER"
payload: {
  messages: [],
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `messages` - отсортированный по возрастанию по дате и времени массив сообщений структурно соответствующих полю `message` в ["Получение сообщения от пользователя"](#Получение-сообщения-от-пользователя), пустой массив не является ошибкой

</details>

<details>
<summary markdown="span">Ответы от сервера при ошибках</summary>

- логин отправителя совпадает с логином получателя

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: 'sender and recipient logins are the same',
  }
  ```

- пользователя с указанным логином не существует

  ```javascript
  id: string,
  type: "ERROR"
  payload: {
    error: 'the user with the specified login does not exist',
  }
  ```

  где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание причины ошибки
</details>

### Уведомление об изменении у сообщения статуса доставлено

Инициатор - серверное приложение

Описание - запрос направляется отправителю сообщения при получении сервером запроса в соответствии с пунктом ["Получение истории сообщений с пользователем"](#Получение-истории-сообщений-с-пользователем) от пользователя получателя сообщения и текущем статусе `isDelivered` равныv `false`, при этом статус `isDelivered` устанавливается сервером в значение `true` до пересылки сообщения пользователю отправителю

<details>
<summary markdown="span">Запрос от сервера</summary>

```javascript
id: null,
type: "MSG_DELIVERED"
payload: {
  message: {
    id: string,
    status: {
      isDelivered: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса сформированный сервером
- `message` - поле сообщения пользователя в котором:
  - `id` - идентификатор сообщения
  - `isDelivered` - статус доставлено ли сообщение получателю
  </details>

### Изменение у сообщения статуса прочитано

Инициатор - клиентское приложение

Описание - используется для изменения статуса `isReaded` в значение `true`, при успешной обработке запроса сервер направляет отправителю запрос в соответствии с ["Уведомление об изменении у сообщения статуса прочитано"](#Уведомление-об-изменении-у-сообщения-статуса-прочитано)

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string,
type: "MSG_READED"
payload: {
  message: {
    id: string,
  }
}
```

где:

- `id` - идентификатор запроса
- `message` - поле сообщения пользователя в котором:
  - `id` - идентификатор сообщения
  </details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string,
type: "MSG_READED"
payload: {
  message: {
    id: string,
    status: {
      isReaded: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `message` - поле сообщения пользователя в котором:
  - `id` - идентификатор сообщения
  - `isReaded` - текущее состояние прочитано у сообщения
  </details>

<details>
<summary markdown="span">Ответы от сервера при ошибках</summary>

- сообщения с переданным `id` не существует

```javascript
id: string,
type: "ERROR"
payload: {
  error: 'incorrect message id',
}
```

- пользователь не является получателем сообщения

```javascript
id: string,
type: "ERROR"
payload: {
  error: 'user not recipient cannot be executed',
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание причины ошибки
</details>

### Уведомление об изменении у сообщения статуса прочитано

Инициатор - серверное приложение

Описание - запрос направляется пользователю отправителю сообщения после успешной обработки сервером запроса изменения статуса `isReaded` в соответствии с ["Изменение у сообщения статуса прочитано"](#Изменение-у-сообщения-статуса-прочитано) при условии что пользователь отправитель авторизован

<details>
<summary markdown="span">Запрос от сервера</summary>

```javascript
id: null,
type: "MSG_READED"
payload: {
  message: {
    id: string,
    status: {
      isReaded: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса сформированный сервером
- `message` - поле сообщения пользователя в котором:
  - `id` - идентификатор сообщения
  - `isReaded` - текущее состояние прочитано у сообщения
  </details>

### Удаление сообщения

Инициатор - клиентское приложение

Описание - используется для удаления сообщения отправленного другому пользователю и если получатель сообщения авторизован, то ему направляется уведомление в соответствии с ["Уведомление об удалении сообщения"](#Уведомление-об-удалении-сообщения)

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string,
type: "MSG_DELETE"
payload: {
  message: {
    id: string,
  }
}
```

где:

- `id` - идентификатор запроса
- `message` - поле сообщения пользователя в котором:
  - `id` - идентификатор сообщения
  </details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string,
type: "MSG_DELETE"
payload: {
  message: {
    id: string,
    status: {
      isDeleted: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `message` - созданное сообщение, в котором:
  - `id` - идентификатор сообщения
  - `isDeleted` - статус удалено ли сообщение
  </details>

<details>
<summary markdown="span">Ответы от сервера при ошибках</summary>

- сообщения с переданным `id` не существует

```javascript
id: string,
type: "ERROR"
payload: {
  error: 'incorrect message id',
}
```

- отправителем сообщения является другой пользователь

```javascript
id: string,
type: "ERROR"
payload: {
  error: 'user not sender cannot be executed',
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание причины ошибки
</details>

### Уведомление об удалении сообщения

Инициатор - серверное приложение

Описание - запрос направляется пользователю получателю сообщения после успешной обработки сервером запроса удаления сообщения в соответствии с ["Удаление сообщения"](#Удаление-сообщения) и при условии что пользователь получатель авторизован

<details>
<summary markdown="span">Запрос от сервера</summary>

```javascript
id: string,
type: "MSG_DELETE"
payload: {
  message: {
    id: string,
    status: {
      isDeleted: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `message` - созданное сообщение, в котором:
  - `id` - идентификатор сообщения
  - `isDeleted` - статус удалено ли сообщение
  </details>

### Редактирование текста сообщения

Инициатор - клиентское приложение

Описание - используется для редактирования текста сообщения отправленного другому пользователю и если получатель сообщения авторизован, то ему направляется уведомление в соответствии с ["Уведомление об редактировании текста сообщения"](#Уведомление-об-редактировании-текста-сообщения)

<details>
<summary markdown="span">Запрос к серверу</summary>

```javascript
id: string,
type: "MSG_EDIT"
payload: {
  message: {
    id: string,
    text: string
  }
}
```

где:

- `id` - идентификатор запроса
- `message` - поле сообщения пользователя в котором:
  - `id` - идентификатор сообщения
  - `text` - текст сообщения
  </details>

<details>
<summary markdown="span">Ответ от сервера</summary>

```javascript
id: string,
type: "MSG_EDIT"
payload: {
  message: {
    id: string,
    text: string,
    status: {
      isEdited: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `message` - созданное сообщение, в котором:
  - `id` - идентификатор сообщения
  - `text` - измененный текст сообщения
  - `isEdited` - статус редактированлось ли сообщение
  </details>

<details>
<summary markdown="span">Ответы от сервера при ошибках</summary>

- сообщения с переданным `id` не существует

```javascript
id: string,
type: "ERROR"
payload: {
  error: 'incorrect message id',
}
```

- отправителем сообщения является другой пользователь

```javascript
id: string,
type: "ERROR"
payload: {
  error: 'user not sender cannot be executed',
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание причины ошибки
</details>

### Уведомление об редактировании текста сообщения

Инициатор - серверное приложение

Описание - запрос направляется пользователю получателю сообщения после успешной обработки сервером запроса редактирования сообщения в соответствии с ["Редактирование текста сообщения"](#Редактирование-текста-сообщения) и при условии что пользователь получатель авторизован

<details>
<summary markdown="span">Запрос от сервера</summary>

```javascript
id: string,
type: "MSG_EDIT"
payload: {
  message: {
    id: string,
    text: string,
    status: {
      isEdited: boolean,
    }
  }
}
```

где:

- `id` - идентификатор запроса полученный в запросе клиента
- `message` - созданное сообщение, в котором:
  - `id` - идентификатор сообщения
  - `text` - измененный текст сообщения
  - `isEdited` - статус редактировалось ли сообщение
  </details>

### Ответы сервера при ошибках в запросе

При ошибке в запросе сервер возвращает сообщение с указанием причины ошибки.

<details>
<summary markdown="span">Общий вид ответа на запрос с ошибкой</summary>

- детальное описание ошибок и причин их возникновения приведено в описании запросов

  ```javascript
  id: string,
  type: "ERROR",
  payload: {
    error: string,
  }
  ```

  где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание ошибки
</details>

Ответы сервера в случае общих ошибок

<details>
<summary markdown="span">Не корректная структура запроса</summary>

- отправляется сервером в ответ на запрос в котором не содержится одно из обязятельных полей (`id`, `type`, `payload`) или тип полей не соответствует данному описанию

  ```javascript
  id: string,
  type: "ERROR",
  payload: {
    error: "incorrect request structure",
  }
  ```

  где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание ошибки
</details>

<details>
<summary markdown="span">Тип запроса не поддерживается сервером</summary>

- отправляется сервером в ответ на запрос с параметром `type` не поддерживаемым сервером

  ```javascript
  id: string,
  type: "ERROR",
  payload: {
    error: "incorrect type parameters",
  }
  ```

  где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание ошибки
</details>

<details>
<summary markdown="span">Содержимое запроса не поддерживается сервером</summary>

- отправляется сервером в ответ на запрос с параметром `payload` не поддерживаемым сервером
  ```javascript
  id: string,
  type: "ERROR",
  payload: {
    error: "incorrect payload parameters",
  }
  ```
  где:
- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание ошибки
</details>

<details>
<summary markdown="span">Внутренняя ошибка сервера</summary>

- отправляется сервером в ответ на запрос в результате которого случилась не предвиденная ошибка

  ```javascript
  id: string,
  type: "ERROR",
  payload: {
    error: "internal server error",
  }
  ```

  где:

- `id` - идентификатор запроса полученный в запросе клиента
- `error` - описание ошибки
</details>

### Лог событий сервера

Лог событий сервера позволяет в текущем режиме отследить получение сервером запросов и отправку сервером ответов.

Изменение параметров отображения необходимо в файле `.env` изменить значение поля `LOG`

<details>
<summary markdown="span">Варианты отображения лога сервера</summary>

- `ALL` - все входящие и исходящие запросы
- `ERROR` - только ошибочные запросы
- `INCOMING` - все входящие запросы
- `OUTCOMING` - все исходящие запросы

</details>
