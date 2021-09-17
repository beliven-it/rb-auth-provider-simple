import { RbStorage } from "rb-core-module";

export class DefaultStorage extends RbStorage {
  async getItem (key) {
    let res = localStorage.getItem(key)
    if (!res) {
      res = sessionStorage.getItem(key)
    }
    return res
  }

  async setItem (key, val, persistent) {
    if (persistent) {
      localStorage.setItem(key, val)
    } else {
      sessionStorage.setItem(key, val)
    }
  }

  async removeItem (key) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }

  async isItemPersistent (key) {
    const res = localStorage.getItem(key)
    return !!res
  }
}

export default new DefaultStorage()