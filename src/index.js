import fetch from "node-fetch";
import { RbAuthProvider, errors } from "rb-core-module";

class RbSimpleAuthProvider extends RbAuthProvider {
  constructor(authURL, {
    tokenCacheKey = 'rb-auth-token',
    identifier = null,
    acl = null,
    storage = {
      local: null,
      session: null
    },
    timeout = 5000,
    retries = 3,
    backoff = 300,
    client = null
  } = {}) {
    super();
    this.authURL = authURL
    this.tokenCacheKey = tokenCacheKey
    this.identifier = identifier
    this.acl = acl
    this.localStorage = storage.local
    this.sessionStorage = storage.session
    this.timeout = timeout || 5000
    this.retries = retries || 3
    this.backoff = backoff || 300
    this.client = client || ((...args) => fetch(...args))
  }

  async login({ email, password, keepLogged = false }) {
    const url = this.authURL
    const { user, token } = await this._performRequest(url, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }, this.retries)
    if (keepLogged) {
      this.localStorage && this.localStorage.setItem(this.tokenCacheKey, token)
    } else {
      this.sessionStorage && this.sessionStorage.setItem(this.tokenCacheKey, token)
    }
    return {
      data: user
    }
  }

  async logout() {
    this.sessionStorage && this.sessionStorage.removeItem(this.tokenCacheKey)
    this.localStorage && this.localStorage.removeItem(this.tokenCacheKey)
  }

  async checkAuth() {
    const url = this.authURL
    let currToken = this.localStorage && this.localStorage.getItem(this.tokenCacheKey)
    const keepLogged = !!currToken
    if (!currToken) {
      currToken = this.sessionStorage && this.sessionStorage.getItem(this.tokenCacheKey)
    }
    if (!currToken) {
      throw new Error(errors.ERR_UNAUTHORIZED)
    }
    const { user, token } = await this._performRequest(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${currToken}`
      },
      body: '{}'
    }, this.retries)
    if (keepLogged) {
      this.localStorage && this.localStorage.setItem(this.tokenCacheKey, token)
    } else {
      this.sessionStorage && this.sessionStorage.setItem(this.tokenCacheKey, token)
    }
    return {
      data: user
    }
  }

  async getIdentity(user = {}) {
    if (this.identifier) {
      return this.identifier(user)
    }
    return user.email || ''
  }

  async can(user, route) {
    if (!user) {
      throw new Error(errors.ERR_UNAUTHORIZED)
    }
    if (!route) {
      throw new Error(errors.ERR_INVALID_ROUTE)
    }
    if (this.acl) {
      const isAuthorized = await this.acl(user, route)
      if (!isAuthorized) {
        throw new Error(errors.ERR_FORBIDDEN)
      }
    }
  }

  async _performRequest (url, options, retries, backoff) {
    const _backoff = backoff || this.backoff
    const res = await this.client(url, {
      timeout: this.timeout,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    if (!res.ok) {
      if (retries > 1 && retryCodes.includes(res.status)) {
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const res = await this._performRequest(url, options, retries - 1, _backoff * 2)
              resolve(res)
            } catch (err) {
              reject(err)
            }
          }, _backoff)
        })
      } else {
        throw new Error(res.statusText)
      }
    }
    return res.json()
  }
}

function createAuthProvider(authURL, opts) {
  return new RbSimpleAuthProvider(authURL, opts);
}

export default createAuthProvider;
