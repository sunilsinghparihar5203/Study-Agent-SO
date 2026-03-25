// Centralized Firebase service to optimize imports
let firebaseInstance = null

export async function getFirebase() {
  if (!firebaseInstance) {
    firebaseInstance = await import('../../firebase.js')
  }
  return firebaseInstance
}

export async function getAuth() {
  const { auth } = await getFirebase()
  return auth
}

export async function getCurrentUser() {
  const { auth } = await getFirebase()
  return auth.currentUser
}

// Memoized functions to prevent repeated calls
const memoizedFunctions = new Map()

export function memoize(key, fn) {
  if (memoizedFunctions.has(key)) {
    return memoizedFunctions.get(key)
  }
  const result = fn()
  memoizedFunctions.set(key, result)
  return result
}
