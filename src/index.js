import fetch from "node-fetch";
import { RbAuthProvider, errors } from "rb-core-module";

class RbSimpleAuthProvider extends RbAuthProvider {
  constructor(authURL, {
    jwtCacheKey = 'rb-auth-jwt',
    identifier = null,
    acl = null,
    storage = {
      local: null,
      session: null
    },
    timeout = 5000
  } = {}) {
    super();
    this.authURL = authURL;
    this.jwtCacheKey = jwtCacheKey;
    this.identifier = identifier;
    this.acl = acl;
    this.localStorage = storage.local;
    this.sessionStorage = storage.session;
    this.timeout = timeout
  }

  async login({ email, password, keepLogged = false }) {
    const res = await fetch(this.authURL, {
      method: "POST",
      timeout: this.timeout,
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const { user, token } = await res.json()
    if (keepLogged) {
      this.localStorage && this.localStorage.setItem(this.jwtCacheKey, token)
    } else {
      this.sessionStorage && this.sessionStorage.setItem(this.jwtCacheKey, token)
    }
    return {
      data: user,
    };
  }

  async logout() {
    this.sessionStorage && this.sessionStorage.removeItem(this.jwtCacheKey)
    this.localStorage && this.localStorage.removeItem(this.jwtCacheKey)
  }

  async checkAuth() {
    let jwt = this.localStorage && this.localStorage.getItem(this.jwtCacheKey)
    if (!jwt) {
      jwt = this.sessionStorage && this.sessionStorage.getItem(this.jwtCacheKey)
    }
    if (!jwt) {
      throw new Error(errors.ERR_UNAUTHORIZED)
    }
    return jwt
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
}

function createAuthProvider(authURL, opts) {
  return new RbSimpleAuthProvider(authURL, opts);
}

export default createAuthProvider;
