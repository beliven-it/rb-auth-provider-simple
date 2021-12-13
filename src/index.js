import { RbAuthProvider, errors } from 'rb-core-module'
import { defaultClient, retryCodes } from './http'
import { writeToStorage, readFromStorage, removeFromStorage } from './storage'

class RbSimpleAuthProvider extends RbAuthProvider {
  constructor (
    authURL,
    {
      checkURL = null,
      userKey = 'user',
      tokenKey = 'token',
      tokenCacheKey = 'rb-auth-token',
      userIdentifier = null,
      tenantIdentifier = null,
      acl = null,
      timeout = 5000,
      retries = 3,
      backoff = 300,
      client = null,
      writeToStorage,
      readFromStorage,
      removeFromStorage
    } = {}
  ) {
    super()
    this.authURL = authURL
    this.checkURL = checkURL || authURL
    this.userKey = userKey
    this.tokenKey = tokenKey
    this.tokenCacheKey = tokenCacheKey
    this.userIdentifier = userIdentifier
    this.tenantIdentifier = tenantIdentifier
    this.acl = acl
    this.timeout = timeout || 5000
    this.retries = retries || 3
    this.backoff = backoff || 300
    this.client = client || defaultClient
    this.writeToStorage = writeToStorage
    this.readFromStorage = readFromStorage
    this.removeFromStorage = removeFromStorage
  }

  async login ({ keepLogged = false, ...credentials }) {
    return this._performAuth(this.authURL, keepLogged, credentials)
  }

  async logout () {
    if (this.removeFromStorage) {
      await this.removeFromStorage(this.tokenCacheKey)
    }
  }

  async checkAuth () {
    const { token, keepLogged } = await this._getTokenFromCache()
    return this._performAuth(this.checkURL, keepLogged, token)
  }

  async getIdentity (user = {}) {
    if (this.userIdentifier) {
      return this.userIdentifier(user)
    }
    return user.fullname || user.name || user.username || user.email || ''
  }

  async getTenantIdentity (user = {}) {
    if (this.tenantIdentifier) {
      return this.tenantIdentifier(user)
    }
    return null
  }

  async can (user, action, subject) {
    if (!user) {
      throw new Error(errors.ERR_UNAUTHORIZED)
    }
    if (!action) {
      throw new Error(errors.ERR_INVALID_ACTION)
    }
    if (this.acl) {
      const isAuthorized = await this.acl(user, action, subject)
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
        'Content-Type': 'application/json; charset=UTF-8',
        ...options.headers
      }
    })
    if (!res.ok) {
      if (retries > 1 && retryCodes.includes(res.status)) {
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const res = await this._performRequest(
                url,
                options,
                retries - 1,
                _backoff * 2
              )
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

  async _performAuth (url, keepLogged, tokenOrCredentials = null) {
    if (!tokenOrCredentials) {
      throw new Error(errors.ERR_UNAUTHORIZED)
    }
    const isBearerToken = typeof tokenOrCredentials === 'string'
    const headers = {}
    if (isBearerToken) {
      headers['Authorization'] = `Bearer ${tokenOrCredentials}`
    }
    const body = !isBearerToken && tokenOrCredentials
    const res = await this._performRequest(
      url,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body || {})
      },
      this.retries
    )
    const user = res[this.userKey]
    const token = res[this.tokenKey]
    await this._storeTokenToCache(token, keepLogged)
    return {
      data: user
    }
  }

  async _storeTokenToCache (token, keepLogged) {
    if (this.writeToStorage) {
      await this.writeToStorage(this.tokenCacheKey, token, keepLogged)
    }
  }

  async _getTokenFromCache () {
    if (!this.readFromStorage) {
      return { token: null, keepLogged: false }
    }
    const [token, keepLogged] = await this.readFromStorage(this.tokenCacheKey)
    return { token, keepLogged }
  }
}

function createAuthProvider (authURL, opts) {
  return new RbSimpleAuthProvider(authURL, opts)
}

export default createAuthProvider
