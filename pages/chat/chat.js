const { sendMessage, getMessages, revokeMessage, deleteMessage } = require('../../utils/chat')
const { getUserInfo } = require('../../utils/user')

const getLocalDB = () => {
  try {
    return {
      users: JSON.parse(wx.getStorageSync('local_db_users') || '[]'),
    }
  } catch (e) {
    return { users: [] }
  }
}

Page({
  data: {
    userId: '',
    nickname: '',
    avatar: '',
    userAvatar: '',
    messages: [],
    inputText: '',
    scrollTop: 0
  },

  onLoad(options) {
    const { userId, nickname, avatar } = options
    const user = getUserInfo()
    this.setData({
      userId: decodeURIComponent(userId),
      nickname: decodeURIComponent(nickname),
      avatar: avatar || '',
      userAvatar: user?.avatar || ''
    })
    this.loadMessages()
  },

  onShow() {
    this.loadMessages()
  },

  async loadMessages() {
    const user = getUserInfo()
    const db = getLocalDB()
    const userMap = {}
    db.users.forEach(u => { userMap[u._id] = u })

    const result = await getMessages(this.data.userId)
    if (result.success) {
      const messages = result.data.map(msg => {
        const isSelf = msg.fromUserId === user._id
        const otherId = isSelf ? msg.toUserId : msg.fromUserId
        const otherUser = userMap[otherId] || {}
        const otherNickname = otherUser.nickname || '未知'
        return {
          ...msg,
          isSelf,
          otherAvatar: otherUser.avatar || '',
          otherNickname: otherNickname,
          otherInitial: otherNickname.charAt(0)
        }
      })
      this.setData({ messages })
      this.scrollToBottom()
    }
  },

  scrollToBottom() {
    setTimeout(() => {
      this.setData({ scrollTop: 99999 })
    }, 100)
  },

  goBack() {
    wx.navigateBack()
  },

  handleInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  async handleSend() {
    const { inputText, userId } = this.data

    if (!inputText.trim()) {
      return
    }

    const result = await sendMessage(userId, inputText.trim())

    if (result.success) {
      this.setData({ inputText: '' })
      this.loadMessages()
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },

  handleImageSend() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0]
        wx.showLoading({ title: '发送中...' })

        const result = await sendMessage(this.data.userId, tempFilePath, 'image')

        wx.hideLoading()

        if (result.success) {
          this.loadMessages()
        } else {
          wx.showToast({ title: result.message, icon: 'none' })
        }
      }
    })
  },

  previewImage(e) {
    const { src } = e.currentTarget.dataset
    wx.previewImage({
      urls: [src],
      current: src
    })
  },

  async handleLongPress(e) {
    const { messageId, isSelf, isRevoked } = e.currentTarget.dataset

    if (!isSelf || isRevoked) {
      return
    }

    const user = getUserInfo()
    const message = this.data.messages.find(m => m._id === messageId)
    if (!message) return

    const now = new Date()
    const messageTime = new Date(message.createdAt)
    const diffMinutes = (now - messageTime) / (1000 * 60)

    const actions = [{ text: '删除', value: 'delete' }]

    if (diffMinutes <= 2) {
      actions.unshift({ text: '撤回', value: 'revoke' })
    }

    wx.showActionSheet({
      itemList: actions.map(a => a.text),
      success: async (res) => {
        const action = actions[res.tapIndex].value

        if (action === 'revoke') {
          const result = await revokeMessage(messageId)
          wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })
          if (result.success) {
            this.loadMessages()
          }
        } else if (action === 'delete') {
          const result = await deleteMessage(messageId)
          wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })
          if (result.success) {
            this.loadMessages()
          }
        }
      }
    })
  }
})