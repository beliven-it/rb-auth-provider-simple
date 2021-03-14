import fetch from "node-fetch";
import { RbAuthProvider, errors } from "rb-core-module";

class RbSimpleAuthProvider extends RbAuthProvider {
  constructor(authURL, {
    jwtKey = 'rb-auth-jwt',
    identifier = null,
    acl = null,
    storage = {
      local: null,
      session: null
    },
  } = {}) {
    super();
    this.authURL = authURL;
    this.jwtKey = jwtKey;
    this.identifier = identifier;
    this.acl = acl;
    this.localStorage = storage.local;
    this.sessionStorage = storage.session;
  }

  async login({ email, password, keepLogged = false }) {
    const res = await fetch(this.authURL, {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const { user, jwt } = await res.json()
    if (keepLogged) {
      this.localStorage && this.localStorage.setItem(this.jwtKey, jwt)
    } else {
      this.sessionStorage && this.sessionStorage.setItem(this.jwtKey, jwt)
    }
    return {
      data: user,
    };
  }

  async logout() {
    this.sessionStorage && this.sessionStorage.removeItem(this.jwtKey)
    this.localStorage && this.localStorage.removeItem(this.jwtKey)
  }

  async checkAuth() {
    let jwt = this.localStorage && this.localStorage.getItem(this.jwtKey)
    if (!jwt) {
      jwt = this.sessionStorage && this.sessionStorage.getItem(this.jwtKey)
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
