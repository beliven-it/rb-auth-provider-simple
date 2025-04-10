import { errors, RbAuthProvider } from "@beliven/rb-core-module";
import { defaultClient, retryCodes } from "./http.js";
import storage from "./storage.js";

class RbSimpleAuthProvider extends RbAuthProvider {
  constructor(
    authURL,
    {
      recoverURL,
      activateOrResetURL,
      checkURL,
      parseUserDetails,
      parseError,
      parseToken,
      tokenCacheKey,
      userIdentifier,
      tenantIdentifier,
      acl,
      timeout,
      retries,
      backoff,
      client,
      writeToStorage,
      readFromStorage,
      removeFromStorage,
    } = {}
  ) {
    super();
    this.authURL = authURL;
    this.recoverURL = recoverURL || authURL;
    this.activateOrResetURL = activateOrResetURL || authURL;
    this.checkURL = checkURL || authURL;
    this.parseUserDetails = parseUserDetails || ((res) => res.user);
    this.parseError = parseError || ((res) => res?.statusText || res?.status);
    this.parseToken = parseToken || ((res) => res.token);
    this.tokenCacheKey = tokenCacheKey || "rb-auth-token";
    this.userIdentifier = userIdentifier;
    this.tenantIdentifier = tenantIdentifier;
    this.acl = acl;
    this.timeout = timeout || 5000;
    this.retries = retries || 3;
    this.backoff = backoff || 300;
    this.client = client || defaultClient;
    this.writeToStorage = writeToStorage || storage.writeToStorage;
    this.readFromStorage = readFromStorage || storage.readFromStorage;
    this.removeFromStorage = removeFromStorage || storage.removeFromStorage;
  }

  async login({ keepLogged = false, ...credentials }) {
    return this._performAuth(this.authURL, keepLogged, credentials);
  }

  async logout() {
    if (this.removeFromStorage) {
      await this.removeFromStorage(this.tokenCacheKey);
    }
  }

  async recoverCredentials(challenge) {
    await this._performRequest(
      this.recoverURL,
      {
        method: "POST",
        body: JSON.stringify(challenge || {}),
      },
      this.retries
    );
  }

  async activateOrResetCredentials(payload) {
    await this._performRequest(
      this.activateOrResetURL,
      {
        method: "POST",
        body: JSON.stringify(payload || {}),
      },
      this.retries
    );
  }

  async checkAuth() {
    const { token, keepLogged } = await this._getTokenFromCache();
    return this._performAuth(this.checkURL, keepLogged, token);
  }

  async getIdentity(user = {}) {
    if (this.userIdentifier) {
      return this.userIdentifier(user);
    }
    return user.fullname || user.name || user.username || user.email || "";
  }

  async getTenantIdentity(user = {}) {
    if (this.tenantIdentifier) {
      return this.tenantIdentifier(user);
    }
    return null;
  }

  can(user, action, subject) {
    if (!user) {
      throw new Error(errors.ERR_UNAUTHORIZED);
    }
    if (!action) {
      throw new Error(errors.ERR_INVALID_ACTION);
    }
    if (this.acl && !this.acl(user, action, subject)) {
      throw new Error(errors.ERR_FORBIDDEN);
    }
    return true;
  }

  async _performRequest(url, options, retries, backoff) {
    const _backoff = backoff || this.backoff;
    const _reqOpts = {
      timeout: this.timeout,
      ...options,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        ...options.headers,
      },
    };

    const req = this.client(url, _reqOpts).then((res) => {
      if (res.ok) {
        return res.json();
      }
      return new Promise((resolve, reject) => {
        if (retries > 1 && retryCodes.includes(res.status)) {
          // Retry on failure
          const retryRequest = () => {
            this._performRequest(url, options, retries - 1, _backoff * 2)
              .then(resolve)
              .catch(reject);
          };
          setTimeout(retryRequest, _backoff);
        } else {
          // Handle final error
          const err = this.parseError(res);
          return !err?.then ? reject(err) : err.then(reject).catch(reject);
        }
      });
    });

    return req;
  }

  async _performAuth(url, keepLogged, tokenOrCredentials = null) {
    if (!tokenOrCredentials) {
      throw new Error(errors.ERR_UNAUTHORIZED);
    }
    const isBearerToken = typeof tokenOrCredentials === "string";
    const headers = {};
    if (isBearerToken) {
      headers["Authorization"] = `Bearer ${tokenOrCredentials}`;
    }
    const body = !isBearerToken && tokenOrCredentials;
    const res = await this._performRequest(
      url,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body || {}),
      },
      this.retries
    );
    const user = this.parseUserDetails(res);
    const token = this.parseToken(res);
    await this._storeTokenToCache(token, keepLogged);
    return {
      data: user,
    };
  }

  async _storeTokenToCache(token, keepLogged) {
    if (this.writeToStorage) {
      await this.writeToStorage(this.tokenCacheKey, token, keepLogged);
    }
  }

  async _getTokenFromCache() {
    if (!this.readFromStorage) {
      return { token: null, keepLogged: false };
    }
    const { value: token, persistent: keepLogged } = await this.readFromStorage(
      this.tokenCacheKey
    );
    return { token, keepLogged };
  }
}

function createAuthProvider(authURL, opts) {
  return new RbSimpleAuthProvider(authURL, opts);
}

export default createAuthProvider;
