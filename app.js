App({
  onLaunch() {
    this.initLocalDB()
  },

  initLocalDB() {
    try {
      this.localDB = {
        users: this.getStoredData('users') || [],
        messages: this.getStoredData('messages') || [],
        friends: this.getStoredData('friends') || [],
        friend_requests: this.getStoredData('friend_requests') || [],
        blacklist: this.getStoredData('blacklist') || [],
        dynamics: this.getStoredData('dynamics') || [],
        likes: this.getStoredData('likes') || [],
        comments: this.getStoredData('comments') || [],
        notifications: this.getStoredData('notifications') || []
      }
    } catch (e) {
      this.localDB = {
        users: [],
        messages: [],
        friends: [],
        friend_requests: [],
        blacklist: [],
        dynamics: [],
        likes: [],
        comments: [],
        notifications: []
      }
    }
  },

  getStoredData(key) {
    try {
      const data = wx.getStorageSync('local_db_' + key)
      return data ? JSON.parse(data) : null
    } catch (e) {
      return null
    }
  },

  setStoredData(key, data) {
    try {
      wx.setStorageSync('local_db_' + key, JSON.stringify(data))
      return true
    } catch (e) {
      return false
    }
  },

  saveDB() {
    try {
      Object.keys(this.localDB).forEach(key => {
        this.setStoredData(key, this.localDB[key])
      })
    } catch (e) {
      console.error('saveDB error:', e)
    }
  },

  globalData: {
    userInfo: null,
    isLogin: false
  }
})