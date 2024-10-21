# rb-auth-provider-simple

A [Restboard](https://restboard.github.io/) auth provider supporting email/password or bearer token

[![Node.js CI](https://github.com/restboard/rb-auth-provider-simple/actions/workflows/node.js.yml/badge.svg)](https://github.com/restboard/rb-auth-provider-simple/actions/workflows/node.js.yml)

## Getting started

```js
import createAuthProvider from 'rb-auth-provider-simple'

const authProvider = createAuthProvider('https://my.api.url/auth')

authProvider.login({ email: 'a@a.it', password: 'password' })
  .then(res => console.log(`Welcome, ${authProvider.getIdentity(res.data)}`))
  .catch(err => console.error(err))
```

## Schema

Invoking `login` will call the provided authentication API as a `POST` request
with the passed credentials (except for the `keepLogged` attribute which is
used internally):

```js
// e.g. login({ email = '...', password = '...', keepLogged = true })
//      will produce the following request payload:
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
const authProvider = createAuthProvider('https://my.api.url/auth')
```

Additional options can be passed as second argument, e.g.:

```js
const authProvider = createAuthProvider('https://my.api.url/auth', {
  tokenCacheKey: 'my-auth-token-cache-key'
})
```

| Name                  | Description                                                    | Default          |
|-----------------------|----------------------------------------------------------------|------------------|
| `recoverURL`          | The (optional) URL used to send a credentials recovery request | null |
| `activateOrResetURL`  | The (optional) URL used to activate or reset user credentials  | null |
| `checkURL`            | The (optional) URL used to check for active authentication     | null             |
| `parseUserDetails`    | A function used to extract user details from the API response. Should have the following signature: `(res) => object` | `(res) => res.user` |
| `parseError`          | A function used to extract details from an API error response. Should have the following signature: `(res) => object\|string` | `(res) => res?.statusText \|\| res?.status` |
| `parseToken`          | A function used to extract the access token from the API response. Should have the following signature: `(res) => string` | `(res) => res.token` |
| `tokenCacheKey`       | The key used to store the bearer token into the cache storage  | `rb-auth-token`  |
| `userIdentifier`      | A function returning the `user` string representation          | null             |
| `tenantIdentifier`    | A function returning the `user`'s tenant string representation | null             |
| `acl`                 | A function to check if `user` is allowed to perform `action` on `subject`. Should have the following signature: `(user, action, subject) => boolean` | null |
| `timeout`             | The timeout (ms) for each single HTTP request attempt          | 5000             |
| `retries`             | The number of attempts before failing                          | 3                |
| `backoff`             | The incremental delay (ms) between request attempts            | 300              |
| `client`              | The HTTP client used to perform the requests                   | `cross-fetch`    |
| `writeToStorage`      | A function used to store a session value. Should have the following signature: `async (key, val, persistent) => void` | *using `local/sessionStorage`* |
| `readFromStorage`     | A function used to read a session value. Should have the following signature: `async (key) => { value, persistent }` | *using `local/sessionStorage`* |
| `removeFromStorage`   | A function used to remove a session value. Should have the following signature: `async (key) => void` | *using `local/sessionStorage`* |

## CORS issues

If you encounter any CORS issue when using the provider, please keep in mind the default HTTP client is configured to [include credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included) for both same-origin and cross-origin requests.

If the server is configured to allow any origin (`Access-Control-Allow-Origin: *`), a CORS error
will be thrown.

You can solve this issue overriding the default HTTP client adjusting its configuration, e.g.:

```js
const myClient(url, opts) {
  return fetch(url, {
    ...opts,
    headers: {
      Accept: "application/json",
      ...opts.headers,
    },
  });
}

const authProvider = createAuthProvider('https://my.api.url/auth', {
  client: myClient
})
```

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
