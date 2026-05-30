const { getFriendRequests, handleFriendRequest } = require('../../utils/friend')

Page({
  data: {
    requests: [],
    loading: false
  },
  
  onLoad() {
    this.loadRequests()
  },
  
  onShow() {
    this.loadRequests()
  },
  
  async loadRequests() {
    this.setData({ loading: true })
    
    const result = await getFriendRequests()
    
    this.setData({ loading: false })
    
    if (result.success) {
      this.setData({ requests: result.data })
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },
  
  async handleAccept(e) {
    const { requestId } = e.currentTarget.dataset
    
    const result = await handleFriendRequest(requestId, 'accept')
    
    wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })
    
    if (result.success) {
      this.loadRequests()
    }
  },
  
  async handleReject(e) {
    const { requestId } = e.currentTarget.dataset
    
    const result = await handleFriendRequest(requestId, 'reject')
    
    wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })
    
    if (result.success) {
      this.loadRequests()
    }
  },
  
  goBack() {
    wx.navigateBack()
  }
})