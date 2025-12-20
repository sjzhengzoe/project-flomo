import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { 
  publishToXiaohongshu, 
  publishToDouyin, 
  checkLoginStatus,
  loginToXiaohongshu,
  loginToDouyin
} from './puppeteer-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 设置服务器超时时间（5分钟）
app.timeout = 300000;

// 中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: err.message || '服务器内部错误',
    });
  }
});

// 配置文件上传
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// 确保上传目录存在
fs.ensureDirSync('uploads');
fs.ensureDirSync('cookies');

// CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 测试接口
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '后端服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

// 检查登录状态
app.post('/api/check-login', async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (!platform || !['xiaohongshu', 'douyin'].includes(platform)) {
      return res.json({
        success: false,
        message: '无效的平台',
      });
    }
    
    const loggedIn = await checkLoginStatus(platform);
    
    res.json({
      success: true,
      loggedIn,
      message: loggedIn ? '已登录' : '未登录',
    });
  } catch (error) {
    console.error('检查登录状态错误:', error);
    res.json({
      success: false,
      message: error.message,
    });
  }
});

// 登录接口
app.post('/api/login', async (req, res) => {
  // 设置较长的超时时间（5分钟）
  req.setTimeout(300000);
  res.setTimeout(300000);
  
  try {
    const { platform } = req.body;
    
    if (!platform || !['xiaohongshu', 'douyin'].includes(platform)) {
      return res.json({
        success: false,
        message: '无效的平台',
      });
    }
    
    console.log(`🚀 开始登录流程，平台: ${platform}`);
    
    // 这里会打开浏览器让用户手动登录
    // 登录成功后会自动保存 Cookie
    // 使用 Promise.race 添加超时保护
    const loginPromise = platform === 'xiaohongshu' 
      ? loginToXiaohongshu()
      : loginToDouyin();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('登录超时，请重试'));
      }, 300000); // 5分钟超时
    });
    
    const result = await Promise.race([loginPromise, timeoutPromise]);
    
    res.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.json({
      success: false,
      message: error.message || '登录失败，请检查网络连接或重试',
    });
  }
});

// 发布接口
app.post('/api/publish', upload.array('files', 9), async (req, res) => {
  try {
    const { platform, title, content, autoDelay, saveDraft } = req.body;
    const files = req.files || [];
    
    if (!platform || !['xiaohongshu', 'douyin'].includes(platform)) {
      return res.json({
        success: false,
        message: '无效的平台',
      });
    }
    
    if (!title || !content) {
      return res.json({
        success: false,
        message: '标题和内容不能为空',
      });
    }
    
    const publishData = {
      title,
      content,
      files: files.map(file => file.path),
      autoDelay: autoDelay === 'true',
      saveDraft: saveDraft === 'true',
    };
    
    let result;
    if (platform === 'xiaohongshu') {
      result = await publishToXiaohongshu(publishData);
    } else {
      result = await publishToDouyin(publishData);
    }
    
    // 清理上传的文件
    files.forEach(file => {
      fs.removeSync(file.path);
    });
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error('发布错误:', error);
    res.json({
      success: false,
      message: error.message,
    });
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 自动化发布服务已启动`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`📝 API 文档:`);
  console.log(`   GET  /api/test - 测试连接`);
  console.log(`   POST /api/check-login - 检查登录状态`);
  console.log(`   POST /api/login - 登录`);
  console.log(`   POST /api/publish - 发布内容`);
});

