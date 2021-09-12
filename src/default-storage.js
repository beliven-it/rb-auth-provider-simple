import { RbStorage } from "rb-core-module";

export class DefaultStorage extends RbStorage {
  getItem (key) {
    let res = window.localStorage.getItem(key)
    if (!res) {
      res = window.sessionStorage.getItem(key)
    }
    return res
  }

  setItem (key, val, persistent) {
    if (persistent) {
      window.localStorage.setItem(key, val)
    } else {
      window.sessionStorage.setItem(key, val)
    }
  }

  removeItem (key) {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  }

  isItemPersistent (key) {
    const res = window.localStorage.getItem(key)
    return !!res
  }
}

export default new DefaultStorage()