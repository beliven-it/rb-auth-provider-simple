// Return the [value, is_persistent] pair
// for the given key in the storage
export async function readFromStorage (key) {
  const res = localStorage.getItem(key)
  if (res) {
    return [res, true]
  }
  return [sessionStorage.getItem(key), false]
}

export async function writeToStorage (key, val, persistent) {
  if (persistent) {
    localStorage.setItem(key, val)
  } else {
    sessionStorage.setItem(key, val)
  }
}

export async function removeFromStorage (key) {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

export default {
  readFromStorage,
  writeToStorage,
  removeFromStorage
}
