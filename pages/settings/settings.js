const { getUserInfo, updateUserInfo, changePassword, deleteAccount } = require('../../utils/user')

Page({
  data: {
    userInfo: null,
    avatar: '',
    nickname: '',
    signature: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    deletePassword: '',
    deleteConfirm: '',
    errorMsg: '',
    activeTab: 'profile'
  },

  onLoad() {
    const userInfo = getUserInfo()
    this.setData({
      userInfo,
      avatar: userInfo?.avatar || '',
      nickname: userInfo?.nickname || '',
      signature: userInfo?.signature || ''
    })
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({ avatar: tempFilePath })
      }
    })
  },

  handleNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  handleSignatureInput(e) {
    this.setData({ signature: e.detail.value })
  },

  async handleSaveProfile() {
    const { nickname, signature, avatar } = this.data

    if (!nickname.trim()) {
      this.setData({ errorMsg: '昵称不能为空' })
      return
    }

    const result = await updateUserInfo(this.data.userInfo._id, {
      nickname: nickname.trim(),
      signature: signature.trim(),
      avatar: avatar || ''
    })

    wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })

    if (result.success) {
      this.setData({ errorMsg: '' })
    }
  },

  handleOldPasswordInput(e) {
    this.setData({ oldPassword: e.detail.value })
  },

  handleNewPasswordInput(e) {
    this.setData({ newPassword: e.detail.value })
  },

  handleConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value })
  },

  async handleChangePassword() {
    const { oldPassword, newPassword, confirmPassword } = this.data

    if (!oldPassword || !newPassword || !confirmPassword) {
      this.setData({ errorMsg: '请填写所有字段' })
      return
    }

    if (newPassword !== confirmPassword) {
      this.setData({ errorMsg: '两次输入的新密码不一致' })
      return
    }

    const result = await changePassword(this.data.userInfo._id, oldPassword, newPassword)

    wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })

    if (result.success) {
      this.setData({ oldPassword: '', newPassword: '', confirmPassword: '', errorMsg: '' })
    }
  },

  handleDeletePasswordInput(e) {
    this.setData({ deletePassword: e.detail.value })
  },

  handleDeleteConfirmInput(e) {
    this.setData({ deleteConfirm: e.detail.value })
  },

  async handleDeleteAccount() {
    const { deletePassword, deleteConfirm } = this.data

    if (!deletePassword || !deleteConfirm) {
      this.setData({ errorMsg: '请填写所有字段' })
      return
    }

    wx.showModal({
      title: '确认注销',
      content: '注销后将无法恢复账号，确定继续吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await deleteAccount(this.data.userInfo._id, deletePassword, deleteConfirm)

          wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })

          if (result.success) {
            setTimeout(() => {
              wx.redirectTo({ url: '/pages/login/login' })
            }, 1500)
          }
        }
      }
    })
  },

  setActiveTab(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ activeTab: tab, errorMsg: '' })
  },

  goBack() {
    wx.navigateBack()
  }
})