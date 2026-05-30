const { searchUser, addFriend } = require('../../utils/friend')

Page({
  data: {
    username: '',
    searchResult: null,
    verifyMessage: '',
    errorMsg: ''
  },
  
  handleUsernameInput(e) {
    this.setData({ username: e.detail.value, searchResult: null })
  },
  
  async handleSearch() {
    if (!this.data.username.trim()) {
      this.setData({ errorMsg: '请输入账号' })
      return
    }
    
    const result = await searchUser(this.data.username.trim())
    
    if (result.success) {
      this.setData({ searchResult: result.data, errorMsg: '' })
    } else {
      this.setData({ searchResult: null, errorMsg: result.message })
    }
  },
  
  handleVerifyMessageInput(e) {
    this.setData({ verifyMessage: e.detail.value })
  },
  
  async handleAddFriend() {
    if (!this.data.searchResult) {
      return
    }
    
    if (this.data.verifyMessage.length > 50) {
      this.setData({ errorMsg: '验证消息不能超过50字' })
      return
    }
    
    const result = await addFriend(this.data.searchResult.username, this.data.verifyMessage)
    
    wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })
    
    if (result.success) {
      this.setData({ 
        username: '', 
        searchResult: null, 
        verifyMessage: '',
        errorMsg: ''
      })
    }
  },
  
  goBack() {
    wx.navigateBack()
  }
})