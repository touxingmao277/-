Component({
  properties: {
    dynamic: {
      type: Object,
      required: true
    }
  },
  
  methods: {
    handleLike() {
      this.triggerEvent('like', {
        dynamicId: this.properties.dynamic._id
      })
    },
    
    handleComment() {
      this.triggerEvent('comment', {
        dynamicId: this.properties.dynamic._id
      })
    },
    
    previewImage(e) {
      const { src } = e.currentTarget.dataset
      wx.previewImage({
        urls: this.properties.dynamic.images || [src],
        current: src
      })
    }
  }
})