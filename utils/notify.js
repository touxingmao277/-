const { getUserInfo } = require('./user')

const addNotification = async (type, targetId, content) => {
  const db = wx.cloud.database()
  const notifications = db.collection('notifications')
  const user = getUserInfo()
  
  if (!user) {
    return { success: false, message: '请先登录' }
  }
  
  try {
    await notifications.add({
      data: {
        userId: user._id,
        type,
        targetId,
        content,
        isRead: false,
        createdAt: new Date()
      }
    })
    
    return { success: true, message: '通知已添加' }
  } catch (e) {
    return { success: false, message: '添加失败' }
  }
}

const getNotifications = async () => {
  const db = wx.cloud.database()
  const notifications = db.collection('notifications')
  const user = getUserInfo()
  
  if (!user) {
    return { success: false, message: '请先登录' }
  }
  
  try {
    const res = await notifications
      .where({ userId: user._id })
      .orderBy('createdAt', 'desc')
      .get()
    
    return { success: true, data: res.data }
  } catch (e) {
    return { success: false, message: '获取通知失败' }
  }
}

const getUnreadCount = async () => {
  const db = wx.cloud.database()
  const notifications = db.collection('notifications')
  const user = getUserInfo()
  
  if (!user) {
    return 0
  }
  
  try {
    const res = await notifications
      .where({ userId: user._id, isRead: false })
      .count()
    
    return res.total || 0
  } catch (e) {
    return 0
  }
}

const markAsRead = async (notificationId) => {
  const db = wx.cloud.database()
  const notifications = db.collection('notifications')
  
  try {
    await notifications.doc(notificationId).update({
      data: { isRead: true }
    })
    
    return { success: true, message: '已标记为已读' }
  } catch (e) {
    return { success: false, message: '操作失败' }
  }
}

const markAllAsRead = async () => {
  const db = wx.cloud.database()
  const notifications = db.collection('notifications')
  const user = getUserInfo()
  
  if (!user) {
    return { success: false, message: '请先登录' }
  }
  
  try {
    await notifications.where({ userId: user._id, isRead: false }).update({
      data: { isRead: true }
    })
    
    return { success: true, message: '已全部标记为已读' }
  } catch (e) {
    return { success: false, message: '操作失败' }
  }
}

const deleteNotification = async (notificationId) => {
  const db = wx.cloud.database()
  const notifications = db.collection('notifications')
  
  try {
    await notifications.doc(notificationId).remove()
    return { success: true, message: '已删除' }
  } catch (e) {
    return { success: false, message: '删除失败' }
  }
}

module.exports = {
  addNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
}