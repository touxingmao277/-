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

const publishDynamic = async (content, images = [], visibility = 'public') => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }
  if (!content || content.length > 500) return { success: false, message: '内容不能为空且不能超过500字' }
  if (images.length > 9) return { success: false, message: '最多只能上传9张图片' }

  try {
    const db = getLocalDB()
    const dynamic = {
      _id: Date.now().toString(),
      userId: user._id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      content,
      images: images || [],
      visibility,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString()
    }

    db.dynamics.unshift(dynamic)
    saveLocalDB(db)
    return { success: true, message: '发布成功' }
  } catch (e) {
    return { success: false, message: '发布失败，请重试' }
  }
}

const getDynamics = async (page = 0, pageSize = 10) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const friendRecords = db.friends.filter(f => f.userId1 === user._id && f.status === 'friend')
    const friendIds = friendRecords.map(f => f.userId2)
    const blockedRecords = db.blacklist.filter(b => b.userId === user._id)
    const blockedIds = blockedRecords.map(b => b.blockedId)

    const visibleDynamics = db.dynamics.filter(d => {
      if (d.userId === user._id) return true
      if (blockedIds.includes(d.userId)) return false
      if (!friendIds.includes(d.userId)) return false
      if (d.visibility === 'private') return false
      return true
    })

    const dynamics = [...visibleDynamics].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const start = page * pageSize
    const end = start + pageSize
    const paginatedDynamics = dynamics.slice(start, end)

    const dynamicIds = paginatedDynamics.map(d => d._id)
    const userLikes = db.likes.filter(l => l.userId === user._id && dynamicIds.includes(l.dynamicId))

    const likeMap = {}
    userLikes.forEach(l => { likeMap[l.dynamicId] = true })

    const userMap = {}
    db.users.forEach(u => { userMap[u._id] = u })

    const result = paginatedDynamics.map(d => {
      const userData = userMap[d.userId]
      return {
        ...d,
        isLiked: likeMap[d._id] || false,
        avatar: userData?.avatar || d.avatar,
        nickname: userData?.nickname || d.nickname
      }
    })
    return { success: true, data: result }
  } catch (e) {
    return { success: false, message: '获取动态失败' }
  }
}

const getUserDynamics = async (userId, page = 0, pageSize = 10) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const dynamics = db.dynamics
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const start = page * pageSize
    const end = start + pageSize
    return { success: true, data: dynamics.slice(start, end) }
  } catch (e) {
    return { success: false, message: '获取动态失败' }
  }
}

const likeDynamic = async (dynamicId) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }

  try {
    const db = getLocalDB()
    const likeIndex = db.likes.findIndex(l => l.dynamicId === dynamicId && l.userId === user._id)
    const dynamicIndex = db.dynamics.findIndex(d => d._id === dynamicId)

    if (likeIndex !== -1) {
      db.likes.splice(likeIndex, 1)
      if (dynamicIndex !== -1) {
        db.dynamics[dynamicIndex].likes = Math.max(0, db.dynamics[dynamicIndex].likes - 1)
      }
      saveLocalDB(db)
      return { success: true, message: '已取消点赞', data: false }
    } else {
      db.likes.push({
        _id: Date.now().toString(),
        dynamicId,
        userId: user._id,
        createdAt: new Date().toISOString()
      })
      if (dynamicIndex !== -1) {
        db.dynamics[dynamicIndex].likes += 1
      }
      saveLocalDB(db)
      return { success: true, message: '点赞成功', data: true }
    }
  } catch (e) {
    return { success: false, message: '操作失败，请重试' }
  }
}

const getComments = async (dynamicId) => {
  try {
    const db = getLocalDB()
    const comments = db.comments
      .filter(c => c.dynamicId === dynamicId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    const userMap = {}
    db.users.forEach(u => { userMap[u._id] = u })

    const result = comments.map(c => ({ ...c, user: userMap[c.userId] || { nickname: '未知', avatar: '' } }))
    return { success: true, data: result }
  } catch (e) {
    return { success: false, message: '获取评论失败' }
  }
}

const addComment = async (dynamicId, content) => {
  const user = getUserInfo()
  if (!user) return { success: false, message: '请先登录' }
  if (!content || content.length > 100) return { success: false, message: '评论内容不能为空且不能超过100字' }

  try {
    const db = getLocalDB()
    db.comments.push({
      _id: Date.now().toString(),
      dynamicId,
      userId: user._id,
      username: user.username,
      nickname: user.nickname,
      content,
      createdAt: new Date().toISOString()
    })

    const dynamicIndex = db.dynamics.findIndex(d => d._id === dynamicId)
    if (dynamicIndex !== -1) {
      db.dynamics[dynamicIndex].comments += 1
    }

    saveLocalDB(db)
    return { success: true, message: '评论成功' }
  } catch (e) {
    return { success: false, message: '评论失败，请重试' }
  }
}

module.exports = { publishDynamic, getDynamics, getUserDynamics, likeDynamic, getComments, addComment }