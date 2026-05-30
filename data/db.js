const db = wx.cloud.database()

const createCollectionIfNotExists = async (collectionName) => {
  try {
    await db.createCollection(collectionName)
    console.log(`Collection ${collectionName} created`)
  } catch (e) {
    console.log(`Collection ${collectionName} already exists or error:`, e)
  }
}

const initDB = async () => {
  const collections = [
    'users',
    'messages',
    'friends',
    'friend_requests',
    'blacklist',
    'dynamics',
    'likes',
    'comments',
    'notifications'
  ]
  
  for (const collection of collections) {
    await createCollectionIfNotExists(collection)
  }
}

module.exports = {
  initDB,
  db
}