const isBrowserStorageDefined =
  typeof localStorage !== "undefined" && typeof sessionStorage !== "undefined";

// Return the { value, persistent} object for the given key in the storage
export async function readFromStorage(key) {
  if (!isBrowserStorageDefined) {
    return { value: null, persistent: false };
  }
  const res = localStorage.getItem(key);
  return {
    value: res || sessionStorage.getItem(key),
    permanent: !!res
  };
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
