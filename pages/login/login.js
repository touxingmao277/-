const { login, getUserInfo, validateUsername, validatePassword } = require('../../utils/user')
const { getStorage, STORAGE_KEY } = require('../../utils/storage')

Page({
  data: {
    username: '',
    password: '',
    rememberMe: false,
    autoLogin: false,
    errorMsg: ''
  },

  onLoad() {
    const rememberData = getStorage(STORAGE_KEY.REMEMBER_ME)
    const autoLoginData = getStorage(STORAGE_KEY.AUTO_LOGIN)

    if (rememberData) {
      this.setData({
        username: rememberData.username,
        password: rememberData.password,
        rememberMe: true
      })
    }

    if (autoLoginData && getUserInfo()) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  handleUsernameInput(e) {
    this.setData({ username: e.detail.value, errorMsg: '' })
  },

  handlePasswordInput(e) {
    this.setData({ password: e.detail.value, errorMsg: '' })
  },

  toggleRememberMe(e) {
    this.setData({ rememberMe: e.detail.value })
  },

  toggleAutoLogin(e) {
    this.setData({ autoLogin: e.detail.value })
    if (e.detail.value) {
      this.setData({ rememberMe: true })
    }
  },

  async handleLogin() {
    const { username, password, rememberMe, autoLogin } = this.data

    if (!validateUsername(username)) {
      this.setData({ errorMsg: '账号必须是6-16位字母、数字或下划线' })
      return
    }

    if (!validatePassword(password)) {
      this.setData({ errorMsg: '密码必须是6-20位字符' })
      return
    }

    wx.showLoading({ title: '登录中...' })

    const result = await login(username, password, rememberMe, autoLogin)

    wx.hideLoading()

    if (result.success) {
      console.log('登录成功，用户信息:', getUserInfo())
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1000
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index',
          success: () => {
            console.log('switchTab 跳转成功')
          },
          fail: (err) => {
            console.error('switchTab 跳转失败:', err)
            wx.reLaunch({ url: '/pages/index/index' })
          }
        })
      }, 1000)
    } else {
      this.setData({ errorMsg: result.message })
    }
  },

  goToRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  }
})