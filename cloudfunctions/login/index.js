const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { username, password } = event
  
  try {
    const res = await db.collection('users')
      .where({ username, password })
      .get()
    
    if (res.data.length === 0) {
      return { success: false, message: '账号或密码错误' }
    }
    
    return { 
      success: true, 
      message: '登录成功',
      data: res.data[0]
    }
  } catch (e) {
    return { success: false, message: '登录失败' }
  }
}