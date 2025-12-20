# 自动化发布工具 - 后端服务

## 功能特性

- ✅ 自动登录（使用小红书创作者中心登录页面，支持 Cookie 复用）
- ✅ 自动填写标题和内容
- ✅ 自动上传图片/视频
- ✅ 自动发布或保存草稿
- ✅ 反检测机制（降低被封风险）
- ✅ 随机延迟（模拟人类行为）

## 安装依赖

```bash
cd server
npm install
```

## 启动服务

```bash
npm start
# 或开发模式（自动重启）
npm run dev
```

服务将在 `http://localhost:3000` 启动

## API 接口

### 1. 测试连接
```
GET /api/test
```

### 2. 检查登录状态
```
POST /api/check-login
Body: {
  "platform": "xiaohongshu" | "douyin"
}
```

### 3. 登录
```
POST /api/login
Body: {
  "platform": "xiaohongshu" | "douyin"
}
```

### 4. 发布内容
```
POST /api/publish
FormData: {
  platform: "xiaohongshu" | "douyin",
  title: "标题",
  content: "内容",
  autoDelay: "true" | "false",
  saveDraft: "true" | "false",
  files: File[] (最多9个)
}
```

## Cookie 管理

- Cookie 会自动保存到 `cookies/` 目录
- 文件名格式：`{platform}-cookies.json`
- 下次登录时会自动加载 Cookie，避免重复扫码

## 反检测措施

1. **隐藏 WebDriver 特征**
   - 移除 `navigator.webdriver` 属性
   - 模拟真实的浏览器环境

2. **随机延迟**
   - 操作之间添加随机延迟（1-3秒）
   - 模拟人类操作速度

3. **真实 User-Agent**
   - 使用真实的浏览器 User-Agent

4. **Cookie 复用**
   - 避免频繁登录
   - 减少触发反作弊机制

## 风险提示

⚠️ **重要提醒**：

1. **账号安全**
   - 自动化操作可能违反平台服务条款
   - 使用前请仔细阅读平台规则
   - 建议使用小号测试

2. **频率控制**
   - 不要过于频繁发布
   - 建议每天发布数量控制在合理范围
   - 启用随机延迟功能

3. **内容质量**
   - 确保内容符合平台规范
   - 避免发布违规内容

4. **技术风险**
   - 平台可能更新页面结构，导致脚本失效
   - 需要定期维护和更新选择器

## 故障排查

### 1. 登录失败
- 检查网络连接
- 确认平台页面结构是否变化
- 查看浏览器控制台错误信息

### 2. 发布失败
- 检查是否已登录
- 确认内容格式是否正确
- 检查文件大小是否超限

### 3. Cookie 失效
- 删除 `cookies/` 目录下的对应文件
- 重新登录

## 注意事项

- 首次登录需要手动扫码或输入账号密码
- Cookie 有效期取决于平台策略
- 建议定期检查登录状态
- 生产环境建议使用无头模式（headless: true）

