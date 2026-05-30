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

const sendMessage = async (toUserId, content, type = 'text') => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }
  if (type === 'text' && (!content || content.length > 500)) return { success: false, message: '消息内容不能为空且不能超过500字' }

  try {
    const db = getLocalDB()
    const message = {
      _id: Date.now().toString(),
      fromUserId: user._id,
      toUserId,
      content,
      type,
      status: 'sent',
      createdAt: new Date().toISOString(),
      isRevoked: false
    }

    db.messages.push(message)
    saveLocalDB(db)
    return { success: true, message: '发送成功', data: message }
  } catch (e) {
    return { success: false, message: '发送失败，请重试' }
  }
}

const getMessages = async (otherUserId, page = 0, pageSize = 20) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const messages = db.messages
      .filter(msg =>
        (msg.fromUserId === user._id && msg.toUserId === otherUserId) ||
        (msg.fromUserId === otherUserId && msg.toUserId === user._id)
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    const start = page * pageSize
    const end = start + pageSize
    return { success: true, data: messages.slice(start, end) }
  } catch (e) {
    return { success: false, message: '获取消息失败' }
  }
}

const getConversations = async () => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const friendRecords = db.friends.filter(f => f.userId1 === user._id && f.status === 'friend')
    const friendIds = friendRecords.map(f => f.userId2)
    const blockedRecords = db.blacklist.filter(b => b.userId === user._id)
    const blockedIds = blockedRecords.map(b => b.blockedId)

    const validMessages = db.messages.filter(msg =>
      !msg.isRevoked &&
      !blockedIds.includes(msg.fromUserId === user._id ? msg.toUserId : msg.fromUserId)
    )

    const conversations = {}
    validMessages.forEach(msg => {
      const otherId = msg.fromUserId === user._id ? msg.toUserId : msg.fromUserId
      if (!friendIds.includes(otherId)) return
      if (!conversations[otherId] || new Date(msg.createdAt) > new Date(conversations[otherId].createdAt)) {
        conversations[otherId] = msg
      }
    })

    const userMap = {}
    db.users.forEach(u => { userMap[u._id] = u })

    const result = Object.values(conversations).map(msg => {
      const otherId = msg.fromUserId === user._id ? msg.toUserId : msg.fromUserId
      return { ...msg, otherUser: userMap[otherId] || { nickname: '未知', avatar: '' } }
    })

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { success: true, data: result }
  } catch (e) {
    return { success: false, message: '获取会话失败' }
  }
}

const revokeMessage = async (messageId) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const messageIndex = db.messages.findIndex(m => m._id === messageId)
    if (messageIndex === -1) return { success: false, message: '消息不存在' }

    const message = db.messages[messageIndex]
    if (message.fromUserId !== user._id) return { success: false, message: '只能撤回自己发送的消息' }

    const diffMinutes = (new Date() - new Date(message.createdAt)) / (1000 * 60)
    if (diffMinutes > 2) return { success: false, message: '只能撤回2分钟内的消息' }

    db.messages[messageIndex].isRevoked = true
    db.messages[messageIndex].content = '已撤回'
    saveLocalDB(db)

    return { success: true, message: '撤回成功' }
  } catch (e) {
    return { success: false, message: '撤回失败，请重试' }
  }
}

const deleteMessage = async (messageId) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const messageIndex = db.messages.findIndex(m => m._id === messageId)
    if (messageIndex !== -1) {
      db.messages.splice(messageIndex, 1)
      saveLocalDB(db)
    }
    return { success: true, message: '删除成功' }
  } catch (e) {
    return { success: false, message: '删除失败，请重试' }
  }
}

module.exports = { sendMessage, getMessages, getConversations, revokeMessage, deleteMessage }