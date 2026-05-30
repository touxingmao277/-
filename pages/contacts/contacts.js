const { getFriends, addFriend, searchUser } = require('../../utils/friend')
const { isLogin } = require('../../utils/user')

Page({
  data: {
    friends: [],
    searchText: '',
    showSearch: false,
    searchResult: null
  },
  
  onLoad() {
    if (!isLogin()) {
      wx.redirectTo({ url: '/pages/login/login' })
      return
    }
    this.loadFriends()
  },
  
  onShow() {
    if (isLogin()) {
      this.loadFriends()
    }
  },
  
  async loadFriends() {
    const result = await getFriends()
    if (result.success) {
      this.setData({ friends: result.data })
    } else {
      wx.showToast({ title: result.message, icon: 'none' })
    }
  },
  
  goToAddFriend() {
    wx.navigateTo({ url: '/pages/add-friend/add-friend' })
  },
  
  goToFriendRequest() {
    wx.navigateTo({ url: '/pages/friend-request/friend-request' })
  },
  
  goToChat(e) {
    const { userId, nickname, avatar } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/chat/chat?userId=${userId}&nickname=${encodeURIComponent(nickname)}&avatar=${avatar || ''}`
    })
  },
  
  toggleSearch() {
    this.setData({ 
      showSearch: !this.data.showSearch,
      searchText: '',
      searchResult: null
    })
  },
  
  handleSearchInput(e) {
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
  
  async handleAddFriend() {
    if (!this.data.searchResult) return
    
    const result = await addFriend(this.data.searchResult.username)
    wx.showToast({ title: result.message, icon: result.success ? 'success' : 'none' })
    
    if (result.success) {
      this.setData({ searchText: '', searchResult: null })
    }
  }
})