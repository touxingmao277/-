const { register, validateUsername, validatePassword } = require('../../utils/user')

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    errorMsg: '',
    usernameError: '',
    passwordError: '',
    confirmError: ''
  },
  
  handleUsernameInput(e) {
    const value = e.detail.value
    this.setData({ username: value, usernameError: '' })
    
    if (value.length > 0) {
      if (!validateUsername(value)) {
        this.setData({ usernameError: '账号必须是6-16位字母、数字或下划线' })
      }
    }
  },
  
  handlePasswordInput(e) {
    const value = e.detail.value
    this.setData({ password: value, passwordError: '' })
    
    if (value.length > 0) {
      if (!validatePassword(value)) {
        this.setData({ passwordError: '密码必须是6-20位字符' })
      }
    }
  },
  
  handleConfirmPasswordInput(e) {
    const value = e.detail.value
    this.setData({ confirmPassword: value, confirmError: '' })
    
    if (value.length > 0 && value !== this.data.password) {
      this.setData({ confirmError: '两次输入的密码不一致' })
    }
  },
  
  async handleRegister() {
    const { username, password, confirmPassword } = this.data
    
    if (!validateUsername(username)) {
      this.setData({ usernameError: '账号必须是6-16位字母、数字或下划线' })
      return
    }
    
    if (!validatePassword(password)) {
      this.setData({ passwordError: '密码必须是6-20位字符' })
      return
    }
    
    if (password !== confirmPassword) {
      this.setData({ confirmError: '两次输入的密码不一致' })
      return
    }
    
    wx.showLoading({ title: '注册中...' })
    
    const result = await register(username, password)
    
    wx.hideLoading()
    
    if (result.success) {
      wx.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } else {
      this.setData({ errorMsg: result.message })
    }
  },
  
  goBack() {
    wx.navigateBack()
  }
})