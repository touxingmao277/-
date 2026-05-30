const { publishDynamic } = require('../../utils/dynamic')

Page({
  data: {
    content: '',
    images: [],
    visibility: 'public',
    visibilityOptions: [
      { value: 'public', label: '公开' },
      { value: 'friends', label: '仅好友' },
      { value: 'private', label: '仅自己' }
    ],
    errorMsg: ''
  },
  
  handleContentInput(e) {
    this.setData({ content: e.detail.value, errorMsg: '' })
  },
  
  chooseImage() {
    const maxCount = 9 - this.data.images.length
    
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = [...this.data.images, ...res.tempFilePaths]
        this.setData({ images: newImages })
      }
    })
  },
  
  removeImage(e) {
    const { index } = e.currentTarget.dataset
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },
  
  setVisibility(e) {
    this.setData({ visibility: e.detail.value })
  },
  
  async handlePublish() {
    const { content, images, visibility } = this.data
    
    if (!content.trim()) {
      this.setData({ errorMsg: '内容不能为空' })
      return
    }
    
    if (content.length > 500) {
      this.setData({ errorMsg: '内容不能超过500字' })
      return
    }
    
    wx.showLoading({ title: '发布中...' })
    
    const result = await publishDynamic(content.trim(), images, visibility)
    
    wx.hideLoading()
    
    if (result.success) {
      wx.showToast({ title: '发布成功', icon: 'success' })
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