const { setStorage, getStorage, removeStorage, STORAGE_KEY } = require('./storage')

const SHA256 = (str) => {
  let hash = 0
  if (str.length === 0) return hash
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

const validateUsername = (username) => {
  const reg = /^[a-zA-Z0-9_]{6,16}$/
  return reg.test(username)
}

const validatePassword = (password) => {
  return password.length >= 6 && password.length <= 20
}

const getLocalDB = () => {
  const app = typeof getApp === 'function' ? getApp() : null
  if (app && app.localDB) {
    return app.localDB
  }

  try {
    return {
      users: JSON.parse(wx.getStorageSync('local_db_users') || '[]'),
      messages: JSON.parse(wx.getStorageSync('local_db_messages') || '[]'),
      friends: JSON.parse(wx.getStorageSync('local_db_friends') || '[]'),
      friend_requests: JSON.parse(wx.getStorageSync('local_db_friend_requests') || '[]'),
      blacklist: JSON.parse(wx.getStorageSync('local_db_blacklist') || '[]'),
      dynamics: JSON.parse(wx.getStorageSync('local_db_dynamics') || '[]'),
      likes: JSON.parse(wx.getStorageSync('local_db_likes') || '[]'),
      comments: JSON.parse(wx.getStorageSync('local_db_comments') || '[]'),
      notifications: JSON.parse(wx.getStorageSync('local_db_notifications') || '[]')
    }
  } catch (e) {
    return {
      users: [],
      messages: [],
      friends: [],
      friend_requests: [],
      blacklist: [],
      dynamics: [],
      likes: [],
      comments: [],
      notifications: []
    }
  }
}

const saveLocalDB = (db) => {
  try {
    wx.setStorageSync('local_db_users', JSON.stringify(db.users))
    wx.setStorageSync('local_db_messages', JSON.stringify(db.messages))
    wx.setStorageSync('local_db_friends', JSON.stringify(db.friends))
    wx.setStorageSync('local_db_friend_requests', JSON.stringify(db.friend_requests))
    wx.setStorageSync('local_db_blacklist', JSON.stringify(db.blacklist))
    wx.setStorageSync('local_db_dynamics', JSON.stringify(db.dynamics))
    wx.setStorageSync('local_db_likes', JSON.stringify(db.likes))
    wx.setStorageSync('local_db_comments', JSON.stringify(db.comments))
    wx.setStorageSync('local_db_notifications', JSON.stringify(db.notifications))

    const app = typeof getApp === 'function' ? getApp() : null
    if (app && app.saveDB) {
      app.saveDB()
    }
  } catch (e) {
    console.error('saveLocalDB error:', e)
  }
}

const register = async (username, password) => {
  if (!validateUsername(username)) {
    return { success: false, message: '账号必须是6-16位字母、数字或下划线' }
  }

  if (!validatePassword(password)) {
    return { success: false, message: '密码必须是6-20位字符' }
  }

  try {
    const db = getLocalDB()
    const existingUser = db.users.find(u => u.username === username)
    if (existingUser) {
      return { success: false, message: '该账号已被注册' }
    }

    const hashedPassword = SHA256(password)
    const user = {
      _id: Date.now().toString(),
      username,
      password: hashedPassword,
      nickname: username,
      avatar: '',
      signature: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    db.users.push(user)
    saveLocalDB(db)

    return { success: true, message: '注册成功' }
  } catch (e) {
    console.error('Registration error:', e)
    return { success: false, message: '注册失败，请重试' }
  }
}

const login = async (username, password, rememberMe = false, autoLogin = false) => {
  const hashedPassword = SHA256(password)

  try {
    const db = getLocalDB()
    const user = db.users.find(u => u.username === username && u.password === hashedPassword)

    if (!user) {
      return { success: false, message: '账号或密码错误' }
    }

    const userInfo = {
      _id: user._id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      signature: user.signature
    }

    setStorage(STORAGE_KEY.USER_INFO, userInfo)

    if (rememberMe) {
      setStorage(STORAGE_KEY.REMEMBER_ME, { username, password })
    } else {
      removeStorage(STORAGE_KEY.REMEMBER_ME)
    }

    if (autoLogin) {
      setStorage(STORAGE_KEY.AUTO_LOGIN, true)
    } else {
      removeStorage(STORAGE_KEY.AUTO_LOGIN)
    }

    return { success: true, message: '登录成功', data: userInfo }
  } catch (e) {
    console.error('Login error:', e)
    return { success: false, message: '登录失败，请重试' }
  }
}

const logout = () => {
  removeStorage(STORAGE_KEY.USER_INFO)
  removeStorage(STORAGE_KEY.AUTO_LOGIN)
  return { success: true, message: '已退出登录' }
}

const getUserInfo = () => {
  return getStorage(STORAGE_KEY.USER_INFO)
}

const isLogin = () => {
  return !!getUserInfo()
}

const updateUserInfo = async (userId, updateData) => {
  try {
    const db = getLocalDB()
    const userIndex = db.users.findIndex(u => u._id === userId)
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' }
    }

    updateData.updatedAt = new Date().toISOString()
    Object.assign(db.users[userIndex], updateData)
    saveLocalDB(db)

    const userInfo = getUserInfo()
    Object.assign(userInfo, updateData)
    setStorage(STORAGE_KEY.USER_INFO, userInfo)

    return { success: true, message: '更新成功' }
  } catch (e) {
    return { success: false, message: '更新失败，请重试' }
  }
}

const changePassword = async (userId, oldPassword, newPassword) => {
  if (!validatePassword(newPassword)) {
    return { success: false, message: '新密码必须是6-20位字符' }
  }

  try {
    const db = getLocalDB()
    const user = db.users.find(u => u._id === userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    if (user.password !== SHA256(oldPassword)) {
      return { success: false, message: '原密码错误' }
    }

    user.password = SHA256(newPassword)
    user.updatedAt = new Date().toISOString()
    saveLocalDB(db)

    return { success: true, message: '密码修改成功' }
  } catch (e) {
    return { success: false, message: '修改失败，请重试' }
  }
}

const deleteAccount = async (userId, password, confirmText) => {
  if (confirmText !== '确认注销') {
    return { success: false, message: '请输入正确的确认关键词' }
  }

  try {
    const db = getLocalDB()
    const userIndex = db.users.findIndex(u => u._id === userId)
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' }
    }

    if (db.users[userIndex].password !== SHA256(password)) {
      return { success: false, message: '密码错误' }
    }

    db.users.splice(userIndex, 1)
    saveLocalDB(db)
    logout()

    return { success: true, message: '账号已注销' }
  } catch (e) {
    return { success: false, message: '注销失败，请重试' }
  }
}

module.exports = {
  register,
  login,
  logout,
  getUserInfo,
  isLogin,
  updateUserInfo,
  changePassword,
  deleteAccount,
  validateUsername,
  validatePassword,
  SHA256
}