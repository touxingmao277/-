const { getDynamics, likeDynamic, addComment, getComments } = require('../../utils/dynamic')
const { isLogin } = require('../../utils/user')

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
    dynamics: [],
    loading: false,
    page: 0,
    commentInput: '',
    activeCommentId: null
  },

  onLoad() {
    if (!isLogin()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadDynamics()
  },

  onShow() {
    if (isLogin()) {
      this.loadDynamics()
    }
  },

  async loadDynamics() {
    this.setData({ loading: true })

    const result = await getDynamics(this.data.page)

    this.setData({ loading: false })

    if (result.success) {
      const dynamics = result.data.map(item => ({
        ...item,
        formattedTime: formatTime(item.createdAt)
      }))

      if (this.data.page === 0) {
        this.setData({ dynamics })
      } else {
        this.setData({ dynamics: [...this.data.dynamics, ...dynamics] })
      }
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  goToPublish() {
    wx.navigateTo({ url: '/pages/publish/publish' })
  },

  async handleLike(e) {
    const { dynamicId } = e.currentTarget.dataset

    const result = await likeDynamic(dynamicId)

    if (result.success) {
      const dynamics = this.data.dynamics.map(d => {
        if (d._id === dynamicId) {
          return {
            ...d,
            isLiked: result.data,
            likes: result.data ? d.likes + 1 : d.likes - 1
          }
        }
        return d
      })
      this.setData({ dynamics })
    }
  },

  showCommentInput(e) {
    const { dynamicId } = e.currentTarget.dataset
    this.setData({
      activeCommentId: dynamicId,
      commentInput: ''
    })
  },

  handleCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  async handleSendComment() {
    const { activeCommentId, commentInput } = this.data

    if (!commentInput.trim()) {
      return
    }

    const result = await addComment(activeCommentId, commentInput.trim())

    if (result.success) {
      wx.showToast({ title: '评论成功', icon: 'success' })
      this.setData({
        commentInput: '',
        activeCommentId: null
      })

      const dynamics = this.data.dynamics.map(d => {
        if (d._id === activeCommentId) {
          return { ...d, comments: d.comments + 1 }
        }
        return d
      })
      this.setData({ dynamics })
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  async viewComments(e) {
    const { dynamicId } = e.currentTarget.dataset
    const result = await getComments(dynamicId)

    if (result.success) {
      const comments = result.data.map(c => `${c.user.nickname}: ${c.content}`).join('\n')
      wx.showModal({
        title: '评论',
        content: comments || '暂无评论',
        showCancel: false
      })
    }
  },

  previewImage(e) {
    const { src } = e.currentTarget.dataset
    wx.previewImage({
      urls: [src],
      current: src
    })
  },

  onPullDownRefresh() {
    this.setData({ page: 0 })
    this.loadDynamics()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  loadMore() {
    this.setData({ page: this.data.page + 1 })
    this.loadDynamics()
  }
})