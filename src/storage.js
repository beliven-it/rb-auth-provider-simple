const isBrowserStorageDefined =
  typeof localStorage !== "undefined" && typeof sessionStorage !== "undefined";

// Return the [value, is_persistent] pair
// for the given key in the storage
export async function readFromStorage(key) {
  if (!isBrowserStorageDefined) return [null, false];
  const res = localStorage.getItem(key);
  return res ? [res, true] : [sessionStorage.getItem(key), false];
}

export async function writeToStorage(key, val, persistent) {
  if (!isBrowserStorageDefined) {
    return;
  }
  if (persistent) {
    localStorage.setItem(key, val);
  } else {
    sessionStorage.setItem(key, val);
  }
}

export async function removeFromStorage(key) {
  if (!isBrowserStorageDefined) {
    return;
  }
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export default {
  readFromStorage,
  writeToStorage,
  removeFromStorage,
};
