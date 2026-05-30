Component({
  properties: {
    message: {
      type: Object,
      required: true
    },
    isSelf: {
      type: Boolean,
      required: true
    }
  },
  
  methods: {
    previewImage(e) {
      const { src } = e.currentTarget.dataset
      wx.previewImage({
        urls: [src],
        current: src
      })
    },
    
    handleLongPress() {
      this.triggerEvent('longpress', {
        messageId: this.properties.message._id,
        isSelf: this.properties.isSelf,
        isRevoked: this.properties.message.isRevoked
      })
    }
  }
})