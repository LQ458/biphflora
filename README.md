# BIPH FLORA 🌿

A modern full-stack plant identification web application dedicated to providing users with a comprehensive platform for plant identification, sharing, and learning.

**⚠️ Important Notice: This project is for personal and private use only. Commercial use is prohibited. For commercial licensing, please contact the project maintainers.**

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Deployment](#installation--deployment)
- [API Documentation](#api-documentation)
- [Technical Implementation](#technical-implementation)
- [Development Guide](#development-guide)
- [Performance Optimization](#performance-optimization)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Project Overview

BIPH FLORA is a modern plant identification platform built with React and Node.js, offering plant search, image upload, and community sharing features. The project uses a frontend-backend separation architecture, supporting user registration/login, plant data management, image compression processing, and other advanced features.

### 🎯 Core Features

- **Smart Search**: Fuzzy search algorithm based on Fuse.js, supporting multi-language search in Latin, Chinese, and English names
- **Image Management**: Integrated Sharp image processing with automatic compression and format optimization
- **User System**: Secure user management system with JWT authentication + Redis caching
- **Content Management**: Complete CRUD operations with administrator review mechanism
- **Responsive Design**: Modern UI based on PrimeReact + Tailwind CSS

## 🏗️ Technology Stack

### Frontend Technologies

- **Framework**: React 18.3.1 + React Router DOM v6
- **UI Library**: PrimeReact 10.8.4 + PrimeFlex
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Image Processing**: browser-image-compression

### Backend Technologies

- **Runtime**: Node.js
- **Web Framework**: Express 4.21.1
- **Database**: MongoDB (Mongoose ODM)
- **Caching**: Redis
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Compression**: gzip compression

### Database Design

```
MongoDB Collections:
├── users (user information)
├── posts (plant articles)
├── pics (plant images)
├── arts (artwork)
├── activities (activity information)
├── editTextRequests (edit requests)
├── featureHomes (featured homepage content)
└── codes (flora/fauna codes)
```

## ✨ Features

### 🔍 Search Functionality
- Support for fuzzy search of plant Latin names, Chinese names, and English names
- Real-time search suggestions
- URL parameterized search results

### 👤 User Management
- Secure user registration/login system
- JWT Token authentication + Redis caching
- Administrator permission control
- Encrypted password storage

### 📸 Image Processing
- Automatic image compression and format optimization
- Support for multiple image format uploads
- Image caching and CDN acceleration
- Responsive image display

### 📝 Content Management
- CRUD operations for plant information
- Rich text editor support
- Administrator review mechanism
- Version control and history tracking

### 🏠 Homepage Display
- Carousel display of featured plants
- Dynamic content loading
- Quick search access
- Responsive layout

## 📁 Project Structure

```
biphflora/
├── client/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # Style files
│   │   ├── tools/         # Utility functions
│   │   ├── App.js         # Main application component
│   │   ├── UserContext.js # User state management
│   │   └── index.js       # Application entry point
│   ├── package.json
│   └── tailwind.config.js
├── models/                 # Data models
│   ├── user.js           # User model
│   ├── post.js           # Article model
│   ├── pic.js            # Image model
│   ├── uploadfile.js     # File upload
│   └── compression.js    # Image compression
├── public/                # Static resources
│   ├── plantspic/        # Plant images
│   └── uploads/          # Uploaded files
├── app.js                 # Express server main file
├── package.json
└── README.md
```

## 🛠️ Installation & Deployment

### System Requirements

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Redis >= 6.0
- npm or pnpm

### Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

### Environment Configuration

Create a `.env` file:

```env
# Server configuration
PORT=3001

# Database configuration
MONGODB_URL=mongodb://localhost:27017/biphflora

# Redis configuration
REDIS_URL=redis://localhost:6379

# JWT secret key
SECRET=your-jwt-secret-key

# Other configurations
REACT_APP_Source_URL=http://localhost:3001
```

### Development Environment

```bash
# Start backend service (port 3001)
npm start

# Start frontend service (port 3000)
cd client
npm start
```

### Production Deployment

```bash
# Build frontend
cd client
npm run build

# Start production server
npm run start
```

## 📖 API Documentation

### Authentication

```http
POST /login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

```http
POST /register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

### Plant Data

```http
GET /searchNames
# Get list of all plant names

GET /search?query=plantname
# Search plant information

POST /upload
Content-Type: multipart/form-data
# Upload plant images and information
```

### User Information

```http
GET /userInfo
Authorization: Bearer <token>
# Get user information and featured content

GET /refresh
Authorization: Bearer <token>
# Refresh user token
```

## 🔧 Technical Implementation

### Authentication System

```javascript
// JWT + Redis dual authentication
async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  
  // JWT verification
  const decoded = jwt.verify(token, process.env.secret);
  
  // Redis cache verification
  const redisToken = await redisClient.get(decoded.username);
  
  if (redisToken === token) {
    req.user = decoded;
    next();
  }
}
```

### Image Compression Processing

```javascript
// Image compression using Sharp
const sharp = require('sharp');

async function compressImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}
```

### Fuzzy Search Implementation

```javascript
// Smart search based on Fuse.js
const fuse = new Fuse(plants, {
  keys: ['latinName', 'commonName', 'chineseName'],
  threshold: 0.4,
  includeScore: true
});

const searchResults = fuse.search(query);
```

### React Router Configuration

```javascript
// Dynamic routing with search parameters
<Route 
  path="/search/:plantKey" 
  element={<SearchWithParam />} 
/>

function SearchWithParam() {
  const { plantKey } = useParams();
  return <Database search={plantKey.replace("_", " ")} />;
}
```

## 📈 Performance Optimization

### Frontend Optimization

- **Code Splitting**: Component lazy loading with React.lazy()
- **Image Optimization**: Client-side compression with browser-image-compression
- **Caching Strategy**: State caching with React Context
- **Build Optimization**: Production build with Create React App

### Backend Optimization

- **Gzip Compression**: Compressed response data transmission
- **Redis Caching**: User token and hot data caching
- **Image Processing**: High-performance image processing with Sharp
- **Database Optimization**: MongoDB index optimization

### Deployment Optimization

```javascript
// Enable gzip compression
app.use(compression());

// Static resource caching
app.use('/public', express.static('public', {
  maxAge: '1d'
}));
```

## 🔒 Security Features

### Password Security
- bcrypt encrypted password storage
- JWT Token expiration control
- Redis Token blacklist mechanism

### Data Validation
- User input validation and filtering
- File upload type checking
- CORS cross-origin request control

### Error Handling
```javascript
// Global error handling middleware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

## 🚀 Development Guide

### Adding New Pages

1. Create new component in `client/src/pages/`
2. Add route configuration in `App.js`
3. Update navigation menu

### Adding New API Endpoints

1. Define route handler in `app.js`
2. Create corresponding data model (if needed)
3. Add authentication middleware (if needed)

### Database Model Extension

```javascript
// Create new model in models/ directory
const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
  field1: String,
  field2: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewModel', newSchema);
```

## 📦 Dependency Management

### Main Frontend Dependencies

```bash
npm install react@^18.3.1 react-dom@^18.3.1
npm install react-router-dom@^6.28.0
npm install primereact@^10.8.4
npm install axios@^1.7.7
```

### Main Backend Dependencies

```bash
npm install express@^4.21.1
npm install mongoose@^8.8.2
npm install redis@^4.7.0
npm install jsonwebtoken@^9.0.2
npm install bcrypt@^5.1.1
npm install sharp@^0.33.5
```

## 🤝 Contributing

1. Fork the project repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

### Code Standards

- Use Prettier for code formatting
- Follow ESLint rules
- Use camelCase for component and function naming
- Add necessary code comments

## 📄 License

This project uses a custom private use license, allowing only personal and private use.

### 🟢 Permitted Uses
- ✅ Personal learning and research
- ✅ Private development and testing
- ✅ Non-commercial educational purposes
- ✅ Personal portfolio display (non-commercial)

### 🔴 Prohibited Uses
- ❌ Any form of commercial use
- ❌ Distribution or redistribution of software
- ❌ Modification and redistribution
- ❌ Use in commercial products or services
- ❌ Sale, licensing, or commercialization
- ❌ Use by commercial organizations or entities
- ❌ Public deployment for commercial purposes

### 💼 Commercial Licensing
For commercial use, distribution, or other purposes not covered by private use terms, please contact the copyright holder for a separate commercial license.

See [LICENSE](LICENSE) file for details.

## 📞 Contact Us

- Project Repository: [https://github.com/LQ458/biphflora](https://github.com/LQ458/biphflora)
- Issue Reporting: [Issues](https://github.com/LQ458/biphflora/issues)

---

**BIPH FLORA** - Making plant identification simple and fun 🌱

---

# 中文版本 / Chinese Version

# BIPH FLORA 识草木 🌿

一个现代化的全栈植物图鉴Web应用，致力于为用户提供植物识别、分享和学习的综合平台。

**⚠️ 重要提示：本项目仅允许个人和私人使用，禁止商业用途。如需商业使用，请联系项目维护者获取商业许可证。**

## 📋 目录

- [项目概述](#项目概述)
- [技术架构](#技术架构)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [安装部署](#安装部署)
- [API文档](#api文档)
- [技术实现](#技术实现)
- [开发指南](#开发指南)
- [性能优化](#性能优化)
- [安全特性](#安全特性)
- [贡献指南](#贡献指南)

## 🚀 项目概述

BIPH FLORA是一个基于React和Node.js构建的现代化植物图鉴平台，提供植物搜索、图片上传、社区分享等功能。该项目采用前后端分离架构，支持用户注册登录、植物数据管理、图片压缩处理等高级功能。

### 🎯 核心特性

- **智能搜索**: 基于Fuse.js的模糊搜索算法，支持拉丁名、中文名、英文名多语言搜索
- **图片管理**: 集成Sharp图片处理，支持自动压缩和格式优化
- **用户系统**: JWT认证 + Redis缓存的安全用户管理系统
- **内容管理**: 完整的CRUD操作，支持管理员审核机制
- **响应式设计**: 基于PrimeReact + Tailwind CSS的现代化UI

## 🏗️ 技术架构

### 前端技术栈

- **框架**: React 18.3.1 + React Router DOM v6
- **UI库**: PrimeReact 10.8.4 + PrimeFlex
- **样式**: Tailwind CSS + CSS Modules
- **状态管理**: React Context API
- **HTTP客户端**: Axios
- **图片处理**: browser-image-compression

### 后端技术栈

- **运行环境**: Node.js
- **Web框架**: Express 4.21.1
- **数据库**: MongoDB (Mongoose ODM)
- **缓存**: Redis
- **认证**: JWT + bcrypt
- **文件上传**: Multer
- **图片处理**: Sharp
- **压缩**: gzip compression

### 数据库设计

```
MongoDB Collections:
├── users (用户信息)
├── posts (植物文章)
├── pics (植物图片)
├── arts (艺术作品)
├── activities (活动信息)
├── editTextRequests (编辑请求)
├── featureHomes (首页特色内容)
└── codes (动植物编码)
```

## ✨ 功能特性

### 🔍 搜索功能
- 支持植物拉丁名、中文名、英文名模糊搜索
- 实时搜索建议
- URL参数化搜索结果

### 👤 用户管理
- 安全的用户注册/登录系统
- JWT Token认证 + Redis缓存
- 管理员权限控制
- 密码加密存储

### 📸 图片处理
- 自动图片压缩和格式优化
- 支持多种图片格式上传
- 图片缓存和CDN加速
- 响应式图片显示

### 📝 内容管理
- 植物信息的增删改查
- 富文本编辑器支持
- 管理员审核机制
- 版本控制和历史记录

### 🏠 主页展示
- 轮播图展示特色植物
- 动态加载内容
- 搜索快捷入口
- 响应式布局

## 📁 项目结构

```
biphflora/
├── client/                 # React前端应用
│   ├── public/
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── styles/        # 样式文件
│   │   ├── tools/         # 工具函数
│   │   ├── App.js         # 主应用组件
│   │   ├── UserContext.js # 用户状态管理
│   │   └── index.js       # 应用入口
│   ├── package.json
│   └── tailwind.config.js
├── models/                 # 数据模型
│   ├── user.js           # 用户模型
│   ├── post.js           # 文章模型
│   ├── pic.js            # 图片模型
│   ├── uploadfile.js     # 文件上传
│   └── compression.js    # 图片压缩
├── public/                # 静态资源
│   ├── plantspic/        # 植物图片
│   └── uploads/          # 上传文件
├── app.js                 # Express服务器主文件
├── package.json
└── README.md
```

## 🛠️ 安装部署

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Redis >= 6.0
- npm 或 pnpm

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

### 环境变量配置

创建 `.env` 文件：

```env
# 服务器配置
PORT=3001

# 数据库配置
MONGODB_URL=mongodb://localhost:27017/biphflora

# Redis配置
REDIS_URL=redis://localhost:6379

# JWT密钥
SECRET=your-jwt-secret-key

# 其他配置
REACT_APP_Source_URL=http://localhost:3001
```

### 开发环境启动

```bash
# 启动后端服务 (端口3001)
npm start

# 启动前端服务 (端口3000)
cd client
npm start
```

### 生产环境部署

```bash
# 构建前端
cd client
npm run build

# 启动生产服务器
npm run start
```

## 📖 API文档

### 认证相关

```http
POST /login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

```http
POST /register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

### 植物数据

```http
GET /searchNames
# 获取所有植物名称列表

GET /search?query=plantname
# 搜索植物信息

POST /upload
Content-Type: multipart/form-data
# 上传植物图片和信息
```

### 用户信息

```http
GET /userInfo
Authorization: Bearer <token>
# 获取用户信息和特色内容

GET /refresh
Authorization: Bearer <token>
# 刷新用户token
```

## 🔧 技术实现

### 认证系统

```javascript
// JWT + Redis 双重验证
async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  
  // JWT验证
  const decoded = jwt.verify(token, process.env.secret);
  
  // Redis缓存验证
  const redisToken = await redisClient.get(decoded.username);
  
  if (redisToken === token) {
    req.user = decoded;
    next();
  }
}
```

### 图片压缩处理

```javascript
// 使用Sharp进行图片压缩
const sharp = require('sharp');

async function compressImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(800, 600, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
}
```

### 模糊搜索实现

```javascript
// 基于Fuse.js的智能搜索
const fuse = new Fuse(plants, {
  keys: ['latinName', 'commonName', 'chineseName'],
  threshold: 0.4,
  includeScore: true
});

const searchResults = fuse.search(query);
```

### React路由配置

```javascript
// 动态路由支持搜索参数
<Route 
  path="/search/:plantKey" 
  element={<SearchWithParam />} 
/>

function SearchWithParam() {
  const { plantKey } = useParams();
  return <Database search={plantKey.replace("_", " ")} />;
}
```

## 📈 性能优化

### 前端优化

- **代码分割**: React.lazy() 实现组件懒加载
- **图片优化**: browser-image-compression 客户端压缩
- **缓存策略**: React Context 状态缓存
- **打包优化**: Create React App 生产构建

### 后端优化

- **Gzip压缩**: 响应数据压缩传输
- **Redis缓存**: 用户token和热点数据缓存
- **图片处理**: Sharp高性能图片处理
- **数据库优化**: MongoDB索引优化

### 部署优化

```javascript
// 启用gzip压缩
app.use(compression());

// 静态资源缓存
app.use('/public', express.static('public', {
  maxAge: '1d'
}));
```

## 🔒 安全特性

### 密码安全
- bcrypt加密存储用户密码
- JWT Token时效性控制
- Redis Token黑名单机制

### 数据验证
- 用户输入验证和过滤
- 文件上传类型检查
- CORS跨域请求控制

### 错误处理
```javascript
// 全局错误处理中间件
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

## 🚀 开发指南

### 添加新页面

1. 在 `client/src/pages/` 创建新组件
2. 在 `App.js` 中添加路由配置
3. 更新导航菜单

### 添加新API接口

1. 在 `app.js` 中定义路由处理函数
2. 创建对应的数据模型（如需要）
3. 添加认证中间件（如需要）

### 数据库模型扩展

```javascript
// 在models/目录下创建新模型
const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
  field1: String,
  field2: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewModel', newSchema);
```

## 📦 依赖包管理

### 主要前端依赖

```bash
npm install react@^18.3.1 react-dom@^18.3.1
npm install react-router-dom@^6.28.0
npm install primereact@^10.8.4
npm install axios@^1.7.7
```

### 主要后端依赖

```bash
npm install express@^4.21.1
npm install mongoose@^8.8.2
npm install redis@^4.7.0
npm install jsonwebtoken@^9.0.2
npm install bcrypt@^5.1.1
npm install sharp@^0.33.5
```

## 🤝 贡献指南

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范

- 使用Prettier进行代码格式化
- 遵循ESLint规则
- 组件和函数命名使用驼峰命名法
- 添加必要的代码注释

## 📄 许可证

本项目采用自定义私人使用许可证，仅允许个人和私人使用。

### 🟢 允许的使用
- ✅ 个人学习和研究
- ✅ 私人开发和测试
- ✅ 非商业教育目的
- ✅ 个人作品集展示（非商业）

### 🔴 禁止的使用
- ❌ 任何形式的商业使用
- ❌ 分发或再分发软件
- ❌ 修改并重新分发
- ❌ 用于商业产品或服务
- ❌ 销售、许可或商业化
- ❌ 商业组织或实体使用
- ❌ 公开部署用于商业目的

### 💼 商业许可
如需商业使用、分发或其他不在私人使用条款范围内的用途，请联系版权所有者获取单独的商业许可证。

详见 [LICENSE](LICENSE) 文件

## 📞 联系我们

- 项目地址: [https://github.com/LQ458/biphflora](https://github.com/LQ458/biphflora)
- 问题反馈: [Issues](https://github.com/LQ458/biphflora/issues)

---

**BIPH FLORA** - 让植物识别变得简单有趣 🌱