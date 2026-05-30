# LYHchat - 微信小程序聊天应用

一款基于微信小程序开发的即时通讯应用，提供消息聊天、联系人管理、动态发布等功能。

## 项目结构

```
miniprogram/
├── cloudfunctions/          # 云函数
│   ├── index/               # 入口云函数
│   └── login/               # 登录云函数
├── components/              # 自定义组件
│   ├── contact-item/        # 联系人列表项
│   ├── dynamic-card/        # 动态卡片
│   ├── message-bubble/      # 消息气泡
│   └── notify-badge/        # 通知徽章
├── data/                    # 数据层
│   └── db.js                # 数据库操作
├── pages/                   # 页面
│   ├── login/               # 登录页
│   ├── register/            # 注册页
│   ├── index/               # 首页（消息列表）
│   ├── chat/                # 聊天页
│   ├── contacts/            # 联系人页
│   ├── dynamic/             # 动态页
│   ├── publish/             # 发布动态页
│   ├── search/              # 搜索页
│   ├── settings/            # 设置页
│   ├── add-friend/          # 添加好友页
│   └── friend-request/      # 好友请求页
├── static/                  # 静态资源
│   └── icons/               # 图标文件
├── utils/                   # 工具函数
│   ├── chat.js              # 聊天工具
│   ├── dynamic.js           # 动态工具
│   ├── friend.js            # 好友工具
│   ├── notify.js            # 通知工具
│   ├── storage.js           # 存储工具
│   └── user.js              # 用户工具
├── app.js                   # 应用入口
├── app.json                 # 应用配置
├── app.wxss                 # 全局样式
├── project.config.json      # 项目配置
└── sitemap.json             # 站点地图
```

## 功能特性

### 核心功能
- **即时消息**: 支持好友间的即时消息发送与接收
- **联系人管理**: 添加好友、好友请求处理、黑名单管理
- **动态广场**: 发布动态、点赞、评论互动
- **个人中心**: 个人资料编辑、设置管理

### 技术特性
- 本地数据存储，无需后端服务即可运行
- 响应式设计，适配不同屏幕尺寸
- 支持记住密码和自动登录功能

## 页面说明

| 页面   | 路径                       | 说明         |
| ------ | -------------------------- | ------------ |
| 登录页 | `/pages/login/login`       | 用户登录入口 |
| 注册页 | `/pages/register/register` | 新用户注册   |
| 消息页 | `/pages/index/index`       | 消息列表首页 |
| 聊天页 | `/pages/chat/chat`         | 单聊界面     |
| 联系人 | `/pages/contacts/contacts` | 好友列表     |
| 动态页 | `/pages/dynamic/dynamic`   | 动态广场     |
| 发布页 | `/pages/publish/publish`   | 发布动态     |
| 设置页 | `/pages/settings/settings` | 系统设置     |

## 数据模型

### 用户 (User)
```javascript
{
  _id: string,           // 用户ID
  username: string,      // 账号
  password: string,      // 密码（SHA256加密）
  nickname: string,      // 昵称
  avatar: string,        // 头像URL
  signature: string,     // 个性签名
  createdAt: string,     // 创建时间
  updatedAt: string      // 更新时间
}
```

### 消息 (Message)
```javascript
{
  _id: string,           // 消息ID
  fromId: string,        // 发送者ID
  toId: string,          // 接收者ID
  content: string,       // 消息内容
  type: string,          // 消息类型
  createdAt: string      // 创建时间
}
```

### 动态 (Dynamic)
```javascript
{
  _id: string,           // 动态ID
  userId: string,        // 发布者ID
  content: string,       // 动态内容
  images: array,         // 图片列表
  likes: array,          // 点赞用户ID列表
  comments: array,       // 评论列表
  createdAt: string      // 创建时间
}
```

## 开发环境

### 前置条件
- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序账号，获取 AppID

### 配置说明
1. 在 `project.config.json` 中配置您的小程序 AppID
2. 确保云开发环境已初始化（如需使用云函数）

### 运行项目
1. 使用微信开发者工具打开项目
2. 配置小程序 AppID
3. 点击"编译"按钮启动开发服务器

## 账号规则

- **账号**: 6-16位字母、数字或下划线
- **密码**: 6-20位字符
- 支持记住密码和自动登录

## 许可证

MIT License

## 开发说明

项目采用本地存储模拟数据库，适合学习和演示用途。如需部署到生产环境，建议接入后端服务和真实数据库。