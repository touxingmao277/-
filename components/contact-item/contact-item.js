Component({
  properties: {
    contact: {
      type: Object,
      required: true
    }
  },
  
  methods: {
    handleTap() {
      this.triggerEvent('tap', {
        userId: this.properties.contact._id,
        nickname: this.properties.contact.nickname,
        avatar: this.properties.contact.avatar
      })
    }
  }
})