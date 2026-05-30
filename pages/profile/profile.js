const { getUserInfo, logout, updateUserInfo, changePassword, deleteAccount, isLogin } = require('../../utils/user')

Page({
  data: {
    userInfo: null
  },

  onLoad() {
    if (!isLogin()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = getUserInfo() || {}
    this.setData({
      userInfo: {
        nickname: userInfo.nickname || '用户',
        username: userInfo.username || '',
        avatar: userInfo.avatar || '',
        signature: userInfo.signature || '暂无签名',
        _id: userInfo._id || ''
      }
    })
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = logout()
          wx.showToast({ title: result.message, icon: 'success' })
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/login/login' })
          }, 1500)
        }
      }
    })
  },

  editProfile() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})