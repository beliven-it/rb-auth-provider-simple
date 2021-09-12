import { RbStorage } from "rb-core-module";

export class DefaultStorage extends RbStorage {
  getItem (key) {
    let res = localStorage.getItem(key)
    if (!res) {
      res = sessionStorage.getItem(key)
    }
    return res
  }

  setItem (key, val, persistent) {
    if (persistent) {
      localStorage.setItem(key, val)
    } else {
      sessionStorage.setItem(key, val)
    }
  }

  removeItem (key) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }

  isItemPersistent (key) {
    const res = localStorage.getItem(key)
    return !!res
  }
}

export default new DefaultStorage()