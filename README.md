# rb-auth-provider-simple

A [Restboard](https://github.com/restboard/restboard) auth provider accepting email & password

## Getting started

```js
import simpleAuthProvider from 'rb-auth-provider-simple'

const authProvider = simpleAuthProvider('https://my.api.url/auth')

authProvider.login({ email: 'a@a.it', password: 'password' })
  .then(res => console.log(`Welcome, ${authProvider.getIdentity(res.data)}`))
  .catch(err => console.error(err))
```

## Schema

Calling `login` will call the provided authentication API as a `POST` request
with the following payload:

```js
{
  email: '...',
  password: '...'
}
```

This provder expects the authentication API will return a JSON response
according to the following schema:

```js
{
  user: {
    ...
  },
  jwt: '...'
}
```

## Options

By default, a single string argument containing the URL of the authentication
API to call on login can be passed to the factory function:

```js
const authProvider = simpleAuthProvider('https://my.api.url/auth')
```

Additional options can be passed as second argument, e.g.:

```js
const authProvider = simpleAuthProvider('https://my.api.url/auth', {
  jwtCacheKey: 'my-auth-jwt-cache-key'
})
```


| Name         | Description                                                    |
|--------------|----------------------------------------------------------------|
| `jwtCacheKey`| The key used to store the user JWT into cache storage          |
| `identifier` | A function returning the `user` string representation          |
| `acl`        | A function checking if`user` is allowed to visit `route`       |
| `storage`    | An object with `local` and `session` storage instances         |
| `timeout`    | The timeout (ms) used for each HTTP request (*Default: 5000*)  |

## Test

```bash
npm test
```

## Contribute

If you want, you can also freely donate to fund the project development:

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://paypal.me/EBertoldi)

## Have you found a bug?

Please open a new issue on:

<https://github.com/restboard/rb-auth-provider-simple/issues>

## License

Copyright (c) Emanuele Bertoldi

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
