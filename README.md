# rb-auth-provider-simple

A [Restboard](https://github.com/restboard/restboard) auth provider supporting email/password or bearer token

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
  token: '...'
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
  tokenCacheKey: 'my-auth-token-cache-key'
})
```

| Name               | Description                                                    | Default         |
|--------------------|----------------------------------------------------------------|-----------------|
| `tokenCacheKey`    | The key used to store the bearer token into the cache storage  | `rb-auth-token` |
| `identifier`       | A function returning the `user` string representation          | null            |
| `tenantIdentifier` | A function returning the `user`'s tenant string representation | null            |
| `acl`              | A function checking if `user` is allowed to visit `route`      | null            |
| `storage`          | An object with `local` and `session` storage instances         | {}              |
| `timeout`          | The timeout (ms) for each single HTTP request attempt          | 5000            |
| `retries`          | The number of attempts before failing                          | 3               |
| `backoff`          | The incremental delay (ms) between request attempts            | 300             |
| `client`           | The HTTP client used to perform the requests                   | `fetch`         |

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
