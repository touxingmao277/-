const STORAGE_KEY = {
  USER_INFO: 'vibe_chat_user_info',
  REMEMBER_ME: 'vibe_chat_remember_me',
  AUTO_LOGIN: 'vibe_chat_auto_login'
}

const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('setStorage error:', e)
    return false
  }
}

const getStorage = (key) => {
  try {
    const data = wx.getStorageSync(key)
    if (data) {
      return typeof data === 'string' ? JSON.parse(data) : data
    }
    return null
  } catch (e) {
    console.error('getStorage error:', e)
    return null
  }
}

const removeStorage = (key) => {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    return false
  }
}

const clearStorage = () => {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    return false
  }
}

module.exports = {
  STORAGE_KEY,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage
}