const { getConversations } = require('../../utils/chat')
const { isLogin, getUserInfo } = require('../../utils/user')

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

  return `${date.getMonth() + 1}/${date.getDate()}`
}

Page({
  data: {
    conversations: [],
    loading: false
  },

  onLoad() {
    console.log('首页 onLoad, isLogin:', isLogin())
    console.log('首页 onLoad, getUserInfo:', getUserInfo())
    if (!isLogin()) {
      console.log('未登录，跳转登录页')
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadConversations()
  },

  onShow() {
    if (isLogin()) {
      this.loadConversations()
    }
  },

  async loadConversations() {
    this.setData({ loading: true })

    const result = await getConversations()

    this.setData({ loading: false })

    if (result.success) {
      const conversations = result.data.map(item => ({
        ...item,
        formattedTime: formatTime(item.createdAt)
      }))
      this.setData({ conversations })
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  goToChat(e) {
    const { userId, nickname, avatar } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${userId}&nickname=${encodeURIComponent(nickname)}&avatar=${avatar || ''}`
    })
  },

  onPullDownRefresh() {
    this.loadConversations()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  loadMore() {
    this.loadConversations()
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  }
})