const { searchUser } = require('../../utils/friend')

Page({
  data: {
    searchText: '',
    searchResult: null
  },
  
  handleInput(e) {
    this.setData({ searchText: e.detail.value })
  },
  
  async handleSearch() {
    if (!this.data.searchText.trim()) {
      return
    }
    
    const result = await searchUser(this.data.searchText.trim())
    if (result.success) {
      this.setData({ searchResult: result.data })
    } else {
      this.setData({ searchResult: null })
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },
  
  goBack() {
    wx.navigateBack()
  },
  
  goToChat() {
    if (!this.data.searchResult) return
    const { _id, nickname, avatar } = this.data.searchResult
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${_id}&nickname=${encodeURIComponent(nickname)}&avatar=${avatar || ''}`
    })
  }
})