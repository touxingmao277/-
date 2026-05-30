const { getUserInfo } = require('./user')

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
    return { users: [], messages: [], friends: [], friend_requests: [], blacklist: [], dynamics: [], likes: [], comments: [], notifications: [] }
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

const addFriend = async (username, verifyMessage = '') => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }
  if (!username) return { success: false, message: '请输入账号' }
  if (verifyMessage.length > 50) return { success: false, message: '验证消息不能超过50字' }

  try {
    const db = getLocalDB()
    const targetUser = db.users.find(u => u.username === username)
    if (!targetUser) return { success: false, message: '用户不存在' }
    if (targetUser._id === user._id) return { success: false, message: '不能添加自己为好友' }

    const existingRequest = db.friend_requests.find(
      r => r.fromUserId === user._id && r.toUserId === targetUser._id && r.status === 'pending'
    )
    if (existingRequest) return { success: false, message: '已发送过好友请求' }

    db.friend_requests.push({
      _id: Date.now().toString(),
      fromUserId: user._id,
      toUserId: targetUser._id,
      fromUsername: user.username,
      toUsername: targetUser.username,
      verifyMessage,
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    saveLocalDB(db)

    return { success: true, message: '好友请求已发送' }
  } catch (e) {
    return { success: false, message: '发送失败，请重试' }
  }
}

const searchUser = async (username) => {
  if (!username) return { success: false, message: '请输入账号' }

  try {
    const db = getLocalDB()
    const user = db.users.find(u => u.username === username)
    if (!user) return { success: false, message: '用户不存在' }
    return { success: true, data: user }
  } catch (e) {
    return { success: false, message: '搜索失败，请重试' }
  }
}

const getFriendRequests = async () => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const requests = db.friend_requests.filter(r => r.toUserId === user._id && r.status === 'pending')

    const userMap = {}
    db.users.forEach(u => { userMap[u._id] = u })

    const result = requests.map(r => ({ ...r, fromUser: userMap[r.fromUserId] || { nickname: '未知', avatar: '' } }))
    return { success: true, data: result }
  } catch (e) {
    return { success: false, message: '获取好友请求失败' }
  }
}

const handleFriendRequest = async (requestId, action) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const requestIndex = db.friend_requests.findIndex(r => r._id === requestId)
    if (requestIndex === -1) return { success: false, message: '请求不存在' }

    const request = db.friend_requests[requestIndex]

    if (action === 'accept') {
      db.friends.push({
        _id: Date.now().toString() + '_1',
        userId1: user._id,
        userId2: request.fromUserId,
        status: 'friend',
        createdAt: new Date().toISOString()
      })
      db.friends.push({
        _id: Date.now().toString() + '_2',
        userId1: request.fromUserId,
        userId2: user._id,
        status: 'friend',
        createdAt: new Date().toISOString()
      })
    }

    db.friend_requests[requestIndex].status = action === 'accept' ? 'accepted' : 'rejected'
    saveLocalDB(db)

    return { success: true, message: action === 'accept' ? '已添加好友' : '已拒绝请求' }
  } catch (e) {
    return { success: false, message: '操作失败，请重试' }
  }
}

const getFriends = async () => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const friendRecords = db.friends.filter(f => f.userId1 === user._id && f.status === 'friend')
    const friendIds = friendRecords.map(f => f.userId2)
    const friends = db.users.filter(u => friendIds.includes(u._id))
    return { success: true, data: friends }
  } catch (e) {
    return { success: false, message: '获取好友列表失败' }
  }
}

const deleteFriend = async (friendId) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    db.friends = db.friends.filter(
      f => !((f.userId1 === user._id && f.userId2 === friendId) || (f.userId1 === friendId && f.userId2 === user._id))
    )
    saveLocalDB(db)
    return { success: true, message: '已删除好友' }
  } catch (e) {
    return { success: false, message: '删除失败，请重试' }
  }
}

const blockUser = async (userId) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const existingBlock = db.blacklist.find(b => b.userId === user._id && b.blockedId === userId)
    if (existingBlock) return { success: false, message: '已在黑名单中' }

    db.blacklist.push({
      _id: Date.now().toString(),
      userId: user._id,
      blockedId: userId,
      createdAt: new Date().toISOString()
    })
    saveLocalDB(db)
    return { success: true, message: '已加入黑名单' }
  } catch (e) {
    return { success: false, message: '操作失败，请重试' }
  }
}

const unblockUser = async (userId) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    db.blacklist = db.blacklist.filter(b => !(b.userId === user._id && b.blockedId === userId))
    saveLocalDB(db)
    return { success: true, message: '已移出黑名单' }
  } catch (e) {
    return { success: false, message: '操作失败，请重试' }
  }
}

const isBlocked = async (userId) => {
  const user = getUserInfo()
  if (!user) return false

  try {
    const db = getLocalDB()
    return db.blacklist.some(b => b.userId === user._id && b.blockedId === userId)
  } catch (e) {
    return false
  }
}

module.exports = { addFriend, searchUser, getFriendRequests, handleFriendRequest, getFriends, deleteFriend, blockUser, unblockUser, isBlocked }