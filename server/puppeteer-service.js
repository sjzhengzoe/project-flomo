import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cookie 文件路径
const COOKIE_DIR = path.join(__dirname, 'cookies');

// 确保 Cookie 目录存在
fs.ensureDirSync(COOKIE_DIR);

/**
 * 规范化 Cookie 域名
 */
function normalizeCookies(cookies, platform) {
  if (!cookies || cookies.length === 0) {
    return cookies;
  }
  
  const domainMap = {
    xiaohongshu: '.xiaohongshu.com',
    douyin: '.douyin.com',
  };
  
  const targetDomain = domainMap[platform];
  if (!targetDomain) {
    return cookies;
  }
  
  // 规范化 Cookie 域名，确保可以在子域名间共享
  return cookies.map(cookie => {
    const normalizedCookie = { ...cookie };
    
    // 如果 Cookie 的域名是子域名（如 creator.xiaohongshu.com），改为根域名（.xiaohongshu.com）
    if (normalizedCookie.domain) {
      if (normalizedCookie.domain.includes('xiaohongshu.com')) {
        normalizedCookie.domain = '.xiaohongshu.com';
      } else if (normalizedCookie.domain.includes('douyin.com')) {
        normalizedCookie.domain = '.douyin.com';
      }
    } else {
      // 如果没有域名，设置默认域名
      normalizedCookie.domain = targetDomain;
    }
    
    return normalizedCookie;
  });
}

/**
 * 保存 Cookie 到文件
 */
function saveCookies(platform, cookies) {
  // 规范化 Cookie 域名
  const normalizedCookies = normalizeCookies(cookies, platform);
  
  const cookiePath = path.join(COOKIE_DIR, `${platform}-cookies.json`);
  fs.writeFileSync(cookiePath, JSON.stringify(normalizedCookies, null, 2));
  console.log(`✅ Cookie 已保存到: ${cookiePath}`);
  console.log(`🍪 Cookie 数量: ${normalizedCookies.length}`);
  console.log(`🌐 Cookie 域名: ${normalizedCookies[0]?.domain || '未设置'}`);
}

/**
 * 加载 Cookie 从文件
 */
function loadCookies(platform) {
  const cookiePath = path.join(COOKIE_DIR, `${platform}-cookies.json`);
  if (fs.existsSync(cookiePath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
    console.log(`✅ Cookie 已加载: ${cookiePath}`);
    return cookies;
  }
  return null;
}

/**
 * 查找系统 Chrome 路径
 */
function findChromePath() {
  const platforms = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ],
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ],
  };
  
  const platform = process.platform;
  const paths = platforms[platform] || [];
  
  for (const chromePath of paths) {
    try {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    } catch (e) {
      // 继续查找
    }
  }
  
  return null;
}

/**
 * 创建浏览器实例（带反检测配置）
 */
async function createBrowser(headless = false) {
  const maxRetries = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔧 正在启动 Puppeteer 浏览器... (尝试 ${attempt}/${maxRetries})`);
      
      // 尝试使用系统 Chrome
      const chromePath = findChromePath();
      const launchOptions = {
        headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--window-size=1920,1080',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-gpu',
          '--disable-software-rasterizer',
        ],
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
        timeout: 60000, // 60秒启动超时
      };
      
      // 如果找到系统 Chrome，使用它
      if (chromePath) {
        console.log(`📍 使用系统 Chrome: ${chromePath}`);
        launchOptions.executablePath = chromePath;
      } else {
        console.log('📍 使用 Puppeteer 自带的 Chromium');
      }
      
      const browser = await puppeteer.launch(launchOptions);
      console.log('✅ 浏览器启动成功');
      return browser;
    } catch (error) {
      lastError = error;
      console.error(`❌ 浏览器启动失败 (尝试 ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // 递增延迟：2秒、4秒、6秒
        console.log(`⏳ ${delay/1000}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 所有重试都失败
  console.error('❌ 浏览器启动失败，已重试', maxRetries, '次');
  throw new Error(`浏览器启动失败: ${lastError?.message || '未知错误'}。请检查 Chrome/Chromium 是否已安装，或网络连接是否正常。`);
}

/**
 * 反检测：隐藏 webdriver 特征
 */
async function stealthPage(page) {
  // 隐藏 webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
    
    // 覆盖 plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    
    // 覆盖 languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['zh-CN', 'zh', 'en'],
    });
    
    // 覆盖 permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });
  
  // 设置 User-Agent
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );
}

/**
 * 随机延迟（模拟人类行为）
 */
function randomDelay(min = 1000, max = 3000) {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(resolve, delay);
  });
}

/**
 * 检查登录状态
 */
export async function checkLoginStatus(platform) {
  const cookies = loadCookies(platform);
  if (!cookies || cookies.length === 0) {
    console.log('⚠️ 未找到保存的 Cookie');
    return false;
  }

  console.log(`🔍 检查登录状态，平台: ${platform}`);
  console.log(`🍪 加载了 ${cookies.length} 个 Cookie`);

  const browser = await createBrowser(true);
  const page = await browser.newPage();
  // 设置页面超时，避免长时间等待导致上下文销毁
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000);
  
  try {
    await stealthPage(page);
    
    // 规范化并设置 Cookie
    const normalizedCookies = normalizeCookies(cookies, platform);
    
    // 确保所有 Cookie 的域名正确
    const validCookies = normalizedCookies.map(cookie => {
      const normalized = { ...cookie };
      
      // 确保域名格式正确（以点开头表示子域名共享）
      if (platform === 'xiaohongshu') {
        if (normalized.domain && !normalized.domain.startsWith('.')) {
          // 如果是 creator.xiaohongshu.com，改为 .xiaohongshu.com
          if (normalized.domain.includes('xiaohongshu.com')) {
            normalized.domain = '.xiaohongshu.com';
          }
        } else if (!normalized.domain) {
          normalized.domain = '.xiaohongshu.com';
        }
      } else {
        if (normalized.domain && !normalized.domain.startsWith('.')) {
          if (normalized.domain.includes('douyin.com')) {
            normalized.domain = '.douyin.com';
          }
        } else if (!normalized.domain) {
          normalized.domain = '.douyin.com';
        }
      }
      
      return normalized;
    });
    
    if (validCookies.length === 0) {
      console.log('⚠️ 没有有效的 Cookie');
      return false;
    }
    
    console.log(`🍪 准备设置 ${validCookies.length} 个 Cookie`);
    console.log(`🌐 Cookie 域名示例: ${validCookies[0]?.domain}`);
    
    // 对于小红书，先访问一个基础页面来设置 Cookie
    const baseUrl = platform === 'xiaohongshu' 
      ? 'https://creator.xiaohongshu.com'
      : 'https://www.douyin.com';
    
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    
    // 设置 Cookie
    let successCount = 0;
    for (const cookie of validCookies) {
      try {
        await page.setCookie(cookie);
        successCount++;
      } catch (e) {
        console.warn(`⚠️ Cookie 设置失败: ${cookie.name}`, e.message);
      }
    }
    
    console.log(`✅ 成功设置 ${successCount}/${validCookies.length} 个 Cookie`);
    
    // 对于小红书，直接访问登录后的首页
    if (platform === 'xiaohongshu') {
      const homeUrl = 'https://creator.xiaohongshu.com/new/home';
      console.log(`🏠 访问创作者中心首页: ${homeUrl}`);
      await page.goto(homeUrl, { waitUntil: 'networkidle2' });
    } else {
      // 重新加载页面以应用 Cookie
      await page.reload({ waitUntil: 'networkidle2' });
    }
    
    await randomDelay(3000, 5000); // 增加等待时间，确保页面完全加载
    
    // 检查是否已登录（根据页面元素判断）
    if (platform === 'xiaohongshu') {
      // 先检查 Cookie 中是否有登录标识
      const cookieInfo = await page.evaluate(() => {
        return {
          cookies: document.cookie,
          url: window.location.href,
          hasA1: document.cookie.includes('a1='),
          hasXsecappid: document.cookie.includes('xsecappid='),
          hasWebId: document.cookie.includes('webId='),
        };
      });
      
      console.log('📋 Cookie 信息:', {
        url: cookieInfo.url,
        hasA1: cookieInfo.hasA1,
        hasXsecappid: cookieInfo.hasXsecappid,
        hasWebId: cookieInfo.hasWebId,
        cookieLength: cookieInfo.cookies.length,
      });
      
      // 检查是否有登录 Cookie（a1 是小红书的登录 token）
      if (!cookieInfo.hasA1 && !cookieInfo.hasXsecappid) {
        console.log('❌ Cookie 中缺少登录标识');
        return false;
      }
      
      // 如果 URL 包含 /login，说明 Cookie 可能无效或已过期
      if (cookieInfo.url.includes('/login')) {
        console.log('⚠️ 检测到登录页面，但 Cookie 存在，可能是 Cookie 已过期');
        // 即使有 Cookie，如果在登录页，也认为未登录
        return false;
      }
      
      // 检查页面内容
      const pageInfo = await page.evaluate(() => {
        // 尝试多种选择器查找登录后的元素
        const selectors = [
          '[class*="user"]',
          '[class*="avatar"]',
          '[class*="User"]',
          '[class*="Avatar"]',
          '[data-testid*="user"]',
          '[data-testid*="avatar"]',
          'img[alt*="头像"]',
          'img[alt*="avatar"]',
        ];
        
        let foundElement = null;
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            foundElement = selector;
            break;
          }
        }
        
        // 检查页面文本中是否有登录后的内容
        const bodyText = document.body.innerText || '';
        const hasLoginText = bodyText.includes('发布') || 
                           bodyText.includes('创作') ||
                           bodyText.includes('数据') ||
                           bodyText.includes('内容') ||
                           bodyText.includes('笔记') ||
                           bodyText.includes('视频');
        
        return {
          foundElement,
          hasLoginText,
          bodyTextLength: bodyText.length,
          title: document.title,
        };
      });
      
      console.log('📄 页面信息:', pageInfo);
      console.log('📍 当前 URL:', cookieInfo.url);
      
      // 综合判断：
      // 1. 有登录 Cookie（a1 或 xsecappid）
      // 2. 不在登录页面
      // 3. 在创作者中心相关页面（/new/home, /publish, /creator 等）
      const isCreatorPage = cookieInfo.url.includes('/new/home') ||
                           cookieInfo.url.includes('/publish') ||
                           cookieInfo.url.includes('/creator') ||
                           cookieInfo.url.includes('/home');
      
      const isLoggedIn = (cookieInfo.hasA1 || cookieInfo.hasXsecappid) && 
                         !cookieInfo.url.includes('/login') &&
                         (isCreatorPage || pageInfo.hasLoginText);
      
      if (isLoggedIn) {
        console.log('✅ 已登录（基于 Cookie 和页面判断）');
      } else {
        console.log('❌ 未登录');
        console.log('   原因:', {
          hasA1: cookieInfo.hasA1,
          hasXsecappid: cookieInfo.hasXsecappid,
          isLoginPage: cookieInfo.url.includes('/login'),
          isCreatorPage,
          hasLoginText: pageInfo.hasLoginText,
        });
      }
      
      return isLoggedIn;
    } else {
      // 抖音的登录检查逻辑
      const isLoggedIn = await page.evaluate(() => {
        const currentUrl = window.location.href;
        if (currentUrl.includes('/login')) return false;
        return !!document.querySelector('.user-info') || 
               currentUrl.includes('user');
      });
      return isLoggedIn;
    }
  } catch (error) {
    console.error('检查登录状态错误:', error);
    console.error('错误堆栈:', error.stack);
    return false;
  } finally {
    await browser.close();
  }
}

/**
 * 小红书登录（使用创作者中心登录页面）
 */
export async function loginToXiaohongshu() {
  let browser = null;
  let page = null;
  
  try {
    console.log('🔧 正在启动浏览器...');
    browser = await createBrowser(false);
    page = await browser.newPage();
    
    // 设置页面超时
    page.setDefaultNavigationTimeout(60000); // 60秒
    page.setDefaultTimeout(60000);
    
    await stealthPage(page);
    
    console.log('🌐 正在打开小红书创作者中心登录页面...');
    await page.goto('https://creator.xiaohongshu.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    await randomDelay(2000, 3000);
    
    console.log('⏳ 请在浏览器中完成登录（扫码或账号密码）...');
    console.log('⏳ 登录成功后，程序会自动保存 Cookie');
    console.log('⏳ 等待时间最长5分钟...');
    
    // 等待用户登录（使用更宽松的检测逻辑）
    // 主要检测 Cookie 中是否有登录标识，而不是等待页面跳转
    console.log('⏳ 等待登录完成...');
    
    let loginSuccess = false;
    let checkCount = 0;
    const maxChecks = 300; // 最多检查5分钟（300秒）
    
    while (!loginSuccess && checkCount < maxChecks) {
      await randomDelay(1000, 2000); // 每秒检查一次
      checkCount++;
      
      try {
        // 检查当前 URL 和 Cookie
        const pageInfo = await page.evaluate(() => {
          return {
            url: window.location.href,
            cookies: document.cookie,
            hasA1: document.cookie.includes('a1='),
            hasXsecappid: document.cookie.includes('xsecappid='),
            hasWebId: document.cookie.includes('webId='),
          };
        });
        
        // 如果 Cookie 中有登录标识，且不在登录页，认为登录成功
        const hasLoginCookie = pageInfo.hasA1 || pageInfo.hasXsecappid;
        const isNotLoginPage = !pageInfo.url.includes('/login') || 
                              pageInfo.url.includes('/new/home') ||
                              pageInfo.url.includes('/publish') ||
                              pageInfo.url.includes('/creator');
        
        if (hasLoginCookie && isNotLoginPage && !pageInfo.url.includes('redirectReason=401')) {
          loginSuccess = true;
          console.log('✅ 检测到登录成功！');
          console.log(`📍 当前页面: ${pageInfo.url}`);
          break;
        }
        
        // 每30秒输出一次状态
        if (checkCount % 30 === 0) {
          console.log(`⏳ 等待登录中... (已等待 ${checkCount} 秒)`);
          console.log(`   当前页面: ${pageInfo.url}`);
          console.log(`   Cookie 状态: a1=${pageInfo.hasA1}, xsecappid=${pageInfo.hasXsecappid}`);
        }
      } catch (e) {
        // 忽略检查错误，继续等待
        if (checkCount % 30 === 0) {
          console.log(`⏳ 检查中... (已等待 ${checkCount} 秒)`);
        }
      }
    }
    
    if (!loginSuccess) {
      throw new Error('登录超时，请在5分钟内完成登录');
    }
    
    // 等待页面稳定
    await randomDelay(2000, 3000);
    
    // 获取当前页面信息
    const currentUrl = page.url();
    console.log(`📍 登录后当前页面: ${currentUrl}`);
    
    // 如果还在登录页，尝试手动跳转到首页
    if (currentUrl.includes('/login') && !currentUrl.includes('redirectReason=401')) {
      console.log('🔄 检测到仍在登录页，尝试跳转到首页...');
      try {
        await page.goto('https://creator.xiaohongshu.com/new/home', { 
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        await randomDelay(2000, 3000);
      } catch (e) {
        console.warn('⚠️ 跳转失败，继续使用当前页面:', e.message);
      }
    }
    
    // 获取 Cookie（在登录成功后的页面获取）
    const cookies = await page.cookies();
    if (!cookies || cookies.length === 0) {
      throw new Error('未获取到 Cookie，登录可能失败');
    }
    
    // 验证 Cookie 中是否有登录标识
    const hasLoginCookie = cookies.some(cookie => 
      cookie.name === 'a1' || cookie.name === 'xsecappid'
    );
    
    if (!hasLoginCookie) {
      // 即使没有 a1 或 xsecappid，如果有其他 Cookie，也尝试保存
      console.warn('⚠️ Cookie 中缺少 a1 或 xsecappid，但检测到其他 Cookie');
      const hasOtherCookie = cookies.some(cookie => 
        cookie.name === 'webId' || cookie.name === 'websectiga'
      );
      if (!hasOtherCookie) {
        throw new Error('Cookie 中缺少登录标识，登录可能失败');
      }
    }
    
    // 获取最终 URL
    const finalUrl = page.url();
    
    // 如果最终 URL 是登录页且有 redirectReason=401，说明 Cookie 无效
    if (finalUrl.includes('/login') && finalUrl.includes('redirectReason=401')) {
      throw new Error('登录验证失败，Cookie 可能无效，请重新登录');
    }
    
    saveCookies('xiaohongshu', cookies);
    
    console.log('✅ 登录成功，Cookie 已保存');
    console.log(`📍 最终页面: ${finalUrl}`);
    console.log(`🍪 Cookie 数量: ${cookies.length}`);
    console.log(`🍪 登录标识: a1=${cookies.some(c => c.name === 'a1')}, xsecappid=${cookies.some(c => c.name === 'xsecappid')}`);
    
    await randomDelay(2000, 3000);
    
    return {
      success: true,
      message: '登录成功',
    };
  } catch (error) {
    console.error('登录错误:', error);
    console.error('错误详情:', error.stack);
    
    // 清理资源
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.error('关闭页面失败:', e);
      }
    }
    
    return {
      success: false,
      message: error.message || '登录失败，请重试',
    };
  } finally {
    // 不关闭浏览器，让用户看到登录结果
    // 如果需要关闭浏览器，取消下面的注释
    // if (browser) {
    //   await browser.close();
    // }
  }
}

/**
 * 抖音登录
 */
export async function loginToDouyin() {
  const browser = await createBrowser(false);
  const page = await browser.newPage();
  
  try {
    await stealthPage(page);
    
    console.log('🌐 正在打开抖音...');
    await page.goto('https://www.douyin.com', { 
      waitUntil: 'networkidle2' 
    });
    
    await randomDelay(2000, 3000);
    
    // 点击登录按钮
    const loginButton = await page.waitForSelector(
      '.login-btn, [class*="login"], .sign-in',
      { timeout: 10000 }
    ).catch(() => null);
    
    if (loginButton) {
      await loginButton.click();
      await randomDelay(1000, 2000);
    }
    
    console.log('⏳ 请在浏览器中完成登录（扫码或账号密码）...');
    console.log('⏳ 登录成功后，程序会自动保存 Cookie');
    
    // 等待用户登录
    await page.waitForFunction(
      () => {
        return window.location.href.includes('user') || 
               document.querySelector('.user-info') ||
               document.cookie.includes('passport');
      },
      { timeout: 300000 }
    );
    
    // 获取 Cookie
    const cookies = await page.cookies();
    saveCookies('douyin', cookies);
    
    console.log('✅ 登录成功，Cookie 已保存');
    
    await randomDelay(2000, 3000);
    
    return {
      success: true,
      message: '登录成功',
    };
  } catch (error) {
    console.error('登录错误:', error);
    return {
      success: false,
      message: error.message,
    };
  } finally {
    // 不关闭浏览器
    // await browser.close();
  }
}

/**
 * 小红书发布
 */
export async function publishToXiaohongshu(data) {
  const { title, content, files, autoDelay, saveDraft } = data;
  
  const browser = await createBrowser(false);
  const page = await browser.newPage();
  
  try {
    await stealthPage(page);
    
    // 加载 Cookie
    const cookies = loadCookies('xiaohongshu');
    if (!cookies) {
      throw new Error('请先登录');
    }
    
    // 直接访问发布笔记页面（图文发布）
    console.log('🌐 正在打开小红书发布笔记页面...');
    
    // 先访问首页，再跳转到发布页面，模拟正常用户行为
    if (autoDelay) {
      console.log('🔄 先访问首页，模拟正常用户行为...');
      await page.goto('https://creator.xiaohongshu.com/new/home', {
        waitUntil: 'networkidle2'
      });
      
      // 设置 Cookie
      await page.setCookie(...cookies);
      await page.reload({ waitUntil: 'networkidle2' });
      await randomDelay(2000, 4000);
      
      // 然后访问发布页面
      console.log('🔄 跳转到发布页面...');
      await page.goto('https://creator.xiaohongshu.com/publish/publish?from=menu&target=image', {
        waitUntil: 'networkidle2'
      });
      await randomDelay(2000, 3000);
    } else {
      await page.goto('https://creator.xiaohongshu.com/publish/publish?from=menu&target=image', { 
        waitUntil: 'networkidle2' 
      });
      
      // 设置 Cookie
      await page.setCookie(...cookies);
      await page.reload({ waitUntil: 'networkidle2' });
    }
    
    if (autoDelay) {
      await randomDelay(2000, 4000);
    }
    
    // 检查是否需要登录（如果跳转到登录页面，说明 Cookie 失效）
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('登录已过期，请重新登录');
    }
    
    if (autoDelay) {
      await randomDelay(2000, 3000);
    }
    
    // 点击上传按钮并选择图片（无论是否有文件都需要）
    console.log('📷 开始上传图片流程...');
    
    // 上传前先让页面完全稳定，模拟用户浏览页面
    if (autoDelay) {
      console.log('⏳ 等待页面完全加载并稳定...');
      await randomDelay(3000, 5000);
      
      // 模拟用户查看页面内容（人类会先浏览再操作）
      console.log('👀 模拟用户浏览页面内容...');
      
      // 缓慢滚动页面，模拟阅读
      await page.evaluate(() => {
        window.scrollTo({
          top: Math.random() * 300 + 100,
          behavior: 'smooth'
        });
      });
      await randomDelay(2000, 3000);
      
      // 模拟鼠标移动，查看不同区域
      await page.mouse.move(
        Math.random() * 400 + 200,
        Math.random() * 300 + 200
      );
      await randomDelay(1000, 2000);
      
      // 再次滚动，模拟继续浏览
      await page.evaluate(() => {
        window.scrollBy({
          top: Math.random() * 200 - 100,
          behavior: 'smooth'
        });
      });
      await randomDelay(1500, 2500);
      
      console.log('✅ 页面浏览完成，准备上传');
    }
    
    // 查找上传输入框（input.upload-input）
    console.log('🔍 查找上传输入框 (input.upload-input)...');
    const uploadInput = await page.waitForSelector(
      'input.upload-input, input[class*="upload-input"]',
      { timeout: 15000 }
    ).catch(() => null);
    
    if (!uploadInput) {
      console.warn('⚠️ 未找到上传输入框 (input.upload-input)');
      console.log('💡 提示：可能需要手动上传图片');
    } else {
      console.log('✅ 找到上传输入框');
      
      // 找到输入框后，先模拟鼠标移动到输入框位置（人类会先看再点）
      if (autoDelay) {
        console.log('🖱️ 模拟鼠标移动到上传区域...');
        const box = await uploadInput.boundingBox();
        if (box) {
          // 获取当前鼠标位置（如果有）
          const currentPos = { x: 100, y: 100 };
          
          // 使用更自然的鼠标移动路径（贝塞尔曲线模拟）
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          
          // 分多步移动，模拟人类鼠标轨迹
          const steps = 10;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            // 使用缓动函数，让移动更自然（ease-in-out）
            const easeT = t < 0.5 
              ? 2 * t * t 
              : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const x = currentPos.x + (targetX - currentPos.x) * easeT;
            const y = currentPos.y + (targetY - currentPos.y) * easeT;
            await page.mouse.move(x, y);
            await randomDelay(20, 40); // 每步20-40ms，模拟人类鼠标移动速度
          }
          
          // 悬停一下，模拟人类会稍微停顿观察
          await randomDelay(800, 1500);
          console.log('✅ 鼠标已移动到上传区域');
        }
      }
      
      try {
        // 固定使用指定路径的文件
        const targetFilePath = '/Users/zoe/电脑壁纸1.jpeg';
        let fileToUpload = null;
        
        // 优先检查固定路径
        if (fs.existsSync(targetFilePath)) {
          fileToUpload = targetFilePath;
          console.log(`✅ 找到目标文件: ${targetFilePath}`);
        } else if (files && files.length > 0) {
          // 如果固定路径不存在，在上传的文件列表中查找
          const targetFileName = '电脑壁纸1.jpeg';
          console.log(`🔍 固定路径不存在，在 ${files.length} 个上传文件中查找 "${targetFileName}"...`);
          
          for (const filePath of files) {
            const fileName = path.basename(filePath);
            if (fileName === targetFileName || fileName.includes('电脑壁纸1')) {
              fileToUpload = filePath;
              console.log(`✅ 在上传文件中找到: ${fileName}`);
              break;
            }
          }
          
          // 如果没找到目标文件，使用第二个文件（索引1）
          if (!fileToUpload && files.length >= 2) {
            fileToUpload = files[1];
            console.log(`⚠️ 未找到目标文件，使用第二个文件: ${path.basename(fileToUpload)}`);
          } else if (!fileToUpload) {
            fileToUpload = files[0];
            console.log(`⚠️ 未找到目标文件，使用第一个文件: ${path.basename(fileToUpload)}`);
          }
        }
        
        if (!fileToUpload) {
          throw new Error(`文件不存在: ${targetFilePath}。请确保文件存在或在前端上传文件。`);
        }
        
        const absolutePath = path.isAbsolute(fileToUpload) 
          ? fileToUpload 
          : path.resolve(fileToUpload);
        
        if (!fs.existsSync(absolutePath)) {
          throw new Error(`文件不存在: ${absolutePath}`);
        }
        
        console.log(`📤 准备上传文件: ${path.basename(absolutePath)}`);
        
        // 在上传前添加更多人类行为模拟，降低被检测风险
        if (autoDelay) {
          console.log('⏳ 上传前等待，模拟人类行为...');
          
          // 模拟点击前的犹豫（人类会稍微犹豫）
          await randomDelay(1500, 2500);
          
          // 模拟鼠标移动到输入框并悬停
          const box = await uploadInput.boundingBox();
          if (box) {
            // 使用贝塞尔曲线模拟人类鼠标移动
            const startX = Math.random() * 200 + 100;
            const startY = Math.random() * 200 + 100;
            const endX = box.x + box.width / 2;
            const endY = box.y + box.height / 2;
            
            // 分步移动鼠标，模拟人类行为
            const steps = 5;
            for (let i = 0; i <= steps; i++) {
              const t = i / steps;
              const x = startX + (endX - startX) * t;
              const y = startY + (endY - startY) * t;
              await page.mouse.move(x, y);
              await randomDelay(50, 100);
            }
            
            // 悬停一下
            await randomDelay(300, 600);
          }
        }
        
        // 上传文件（使用更自然的方式）
        console.log('📤 上传文件...');
        await uploadInput.uploadFile(absolutePath);
        console.log('✅ 文件已选择，等待小红书平台上传...');
        
        // 上传后立即添加延迟，避免操作过快
        // 同时模拟人类会等待上传完成的行为
        if (autoDelay) {
          console.log('⏳ 等待上传处理...');
          await randomDelay(2000, 3000);
          
          // 模拟查看上传进度（人类会关注上传状态）
          await page.mouse.move(
            Math.random() * 100 + 200,
            Math.random() * 100 + 200
          );
          await randomDelay(500, 1000);
        }
        
        // 等待上传完成（小红书会通过接口上传并返回链接）
        // 上传成功后页面可能会跳转到发布页面
        console.log('⏳ 等待上传完成...');
        
        // 记录上传前的URL
        const urlBeforeUpload = page.url();
        console.log(`📍 上传前URL: ${urlBeforeUpload}`);
        
        // 监听页面导航事件，检测是否跳转到登录页
        let navigatedToLogin = false;
        let navigationUrl = null;
        const navigationHandler = (frame) => {
          if (frame === page.mainFrame()) {
            const url = frame.url();
            navigationUrl = url;
            console.log(`🔍 页面导航事件: ${url}`);
            if (url.includes('/login')) {
              navigatedToLogin = true;
              console.warn('⚠️ ⚠️ ⚠️ 检测到导航到登录页！');
              console.warn('   这可能是小红书平台的反作弊检测');
            }
          }
        };
        
        page.on('framenavigated', navigationHandler);
        
        // 等待页面跳转或刷新（上传成功后可能会跳转）
        // 使用较短的超时，避免长时间等待触发检测
        try {
          await page.waitForNavigation({ 
            waitUntil: 'networkidle0', // 使用 networkidle0 减少等待时间
            timeout: 15000 
          });
          console.log('✅ 页面已跳转');
        } catch (e) {
          // 如果页面没有跳转，等待一段时间让上传完成
          console.log('ℹ️ 页面未自动跳转，等待上传完成...');
          await randomDelay(3000, 5000); // 减少等待时间
        }
        
        // 移除导航监听器
        page.off('framenavigated', navigationHandler);
        
        // 检查当前URL，确认是否在发布页面或登录页
        const currentUrl = page.url();
        console.log(`📍 上传后URL: ${currentUrl}`);
        
        // 分析跳转原因
        if (currentUrl.includes('/login') || navigatedToLogin) {
          console.warn('⚠️ ⚠️ ⚠️ 检测到跳转到登录页！');
          console.log('🔍 跳转分析：');
          console.log(`   上传前URL: ${urlBeforeUpload}`);
          console.log(`   上传后URL: ${currentUrl}`);
          console.log(`   导航URL: ${navigationUrl || '无'}`);
          console.log('   可能的原因：');
          console.log('   1. 小红书平台的反作弊检测（最可能）');
          console.log('   2. 上传操作触发了安全机制');
          console.log('   3. 会话超时或Cookie失效');
          console.log('   4. 我们的操作（如频繁检查页面）触发了检测');
          
          // 不立即重新设置Cookie，先等待一下，看是否是临时跳转
          console.log('⏳ 等待3秒，观察是否会自动恢复...');
          await randomDelay(3000, 3000);
          
          const urlAfterWait = page.url();
          console.log(`📍 等待后URL: ${urlAfterWait}`);
          
          // 如果还在登录页，说明确实是跳转了
          if (urlAfterWait.includes('/login')) {
            console.warn('⚠️ 确认跳转到登录页，尝试恢复...');
            
            // 重新加载Cookie并设置
            const freshCookies = loadCookies('xiaohongshu');
            if (freshCookies && freshCookies.length > 0) {
              // 规范化Cookie
              const normalizedCookies = normalizeCookies(freshCookies, 'xiaohongshu');
              const validCookies = normalizedCookies.map(cookie => {
                const normalized = { ...cookie };
                if (normalized.domain && !normalized.domain.startsWith('.')) {
                  if (normalized.domain.includes('xiaohongshu.com')) {
                    normalized.domain = '.xiaohongshu.com';
                  }
                } else if (!normalized.domain) {
                  normalized.domain = '.xiaohongshu.com';
                }
                return normalized;
              });
              
              // 先访问发布页面
              await page.goto('https://creator.xiaohongshu.com/publish/publish?from=menu&target=image', {
                waitUntil: 'domcontentloaded'
              });
              
              // 设置Cookie
              await page.setCookie(...validCookies);
              console.log('✅ Cookie已重新设置');
              
              // 重新加载页面
              await page.reload({ waitUntil: 'networkidle2' });
              await randomDelay(2000, 3000);
              
              // 再次检查是否还在登录页
              const newUrl = page.url();
              if (newUrl.includes('/login')) {
                throw new Error('登录已过期，请重新登录');
              }
            } else {
              throw new Error('Cookie已失效，请重新登录');
            }
          } else {
            console.log('✅ 页面已自动恢复，继续执行');
          }
        }
        
        // 如果不在发布页面，等待或跳转到发布页面
        // 注意：减少频繁的页面检查，避免触发检测
        if (!currentUrl.includes('/publish/publish') && !currentUrl.includes('/login')) {
          console.log('⏳ 等待跳转到发布页面...');
          // 减少等待时间，避免频繁检查
          let waited = 0;
          const maxWait = 10000; // 减少到10秒
          while (waited < maxWait && !page.url().includes('/publish/publish')) {
            await randomDelay(2000, 3000);
            waited += 2500;
            // 减少URL检查频率
            if (waited % 5000 === 0) {
              console.log(`   已等待 ${waited/1000} 秒...`);
            }
          }
          
          // 如果还是没有跳转，手动跳转（但要小心，这可能触发检测）
          if (!page.url().includes('/publish/publish')) {
            console.log('🔄 手动跳转到发布页面...');
            console.log('⚠️ 注意：手动跳转可能会触发平台检测');
            
            // 使用更温和的方式跳转
            await page.goto('https://creator.xiaohongshu.com/publish/publish?from=menu&target=image', {
              waitUntil: 'domcontentloaded' // 使用 domcontentloaded 而不是 networkidle2
            });
            
            // 重新设置Cookie（确保登录状态）
            const freshCookies = loadCookies('xiaohongshu');
            if (freshCookies && freshCookies.length > 0) {
              const normalizedCookies = normalizeCookies(freshCookies, 'xiaohongshu');
              const validCookies = normalizedCookies.map(cookie => {
                const normalized = { ...cookie };
                if (normalized.domain && !normalized.domain.startsWith('.')) {
                  if (normalized.domain.includes('xiaohongshu.com')) {
                    normalized.domain = '.xiaohongshu.com';
                  }
                } else if (!normalized.domain) {
                  normalized.domain = '.xiaohongshu.com';
                }
                return normalized;
              });
              
              await page.setCookie(...validCookies);
              // 使用更温和的重新加载方式
              await randomDelay(1000, 2000);
              await page.evaluate(() => window.location.reload());
              await randomDelay(2000, 3000);
            }
          }
        }
        
        console.log('✅ 上传流程完成');
      } catch (error) {
        console.error('❌ 上传流程失败:', error.message);
        // 不抛出错误，继续执行（可能用户会手动上传）
        console.log('💡 提示：如果上传失败，请手动上传图片');
      }
    }
    
    if (autoDelay) {
      await randomDelay(2000, 3000);
    }
    
    // 在填写内容前，再次检查是否在登录页
    const beforeFillUrl = page.url();
    console.log(`📍 填写前检查页面: ${beforeFillUrl}`);
    
    if (beforeFillUrl.includes('/login')) {
      console.warn('⚠️ 检测到在登录页，重新设置Cookie...');
      
      const freshCookies = loadCookies('xiaohongshu');
      if (freshCookies && freshCookies.length > 0) {
        const normalizedCookies = normalizeCookies(freshCookies, 'xiaohongshu');
        const validCookies = normalizedCookies.map(cookie => {
          const normalized = { ...cookie };
          if (normalized.domain && !normalized.domain.startsWith('.')) {
            if (normalized.domain.includes('xiaohongshu.com')) {
              normalized.domain = '.xiaohongshu.com';
            }
          } else if (!normalized.domain) {
            normalized.domain = '.xiaohongshu.com';
          }
          return normalized;
        });
        
        await page.goto('https://creator.xiaohongshu.com/publish/publish?from=menu&target=image', {
          waitUntil: 'domcontentloaded'
        });
        
        await page.setCookie(...validCookies);
        await page.reload({ waitUntil: 'networkidle2' });
        await randomDelay(2000, 3000);
        
        // 再次检查
        const finalUrl = page.url();
        if (finalUrl.includes('/login')) {
          throw new Error('登录已过期，请重新登录');
        }
        console.log('✅ Cookie已重新设置，继续填写内容');
      } else {
        throw new Error('Cookie已失效，请重新登录');
      }
    }
    
    // 填写标题
    console.log('✍️ 填写标题...');
    const titleInput = await page.waitForSelector(
      'input[placeholder*="标题"], textarea[placeholder*="标题"], input[type="text"], textarea',
      { timeout: 15000 }
    ).catch(() => null);
    
    if (!titleInput) {
      // 尝试通过页面内容查找标题输入框
      const titleInputFound = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, textarea'));
        return inputs.find(input => 
          input.placeholder?.includes('标题') ||
          input.placeholder?.includes('标题') ||
          input.getAttribute('class')?.includes('title')
        );
      });
      
      if (titleInputFound) {
        await page.evaluate((input) => input.focus(), titleInputFound);
        await page.keyboard.type(title, { delay: 100 });
      } else {
        throw new Error('未找到标题输入框');
      }
    } else {
      await titleInput.click();
      await page.keyboard.type(title, { delay: 100 });
    }
    
    if (autoDelay) {
      await randomDelay(1000, 2000);
    }
    
    // 填写内容
    console.log('📝 填写内容...');
    const contentInput = await page.waitForSelector(
      'textarea[placeholder*="内容"], textarea[placeholder*="描述"], .editor-content, [contenteditable="true"], textarea',
      { timeout: 15000 }
    ).catch(() => null);
    
    if (!contentInput) {
      // 尝试通过页面内容查找内容输入框
      const contentInputFound = await page.evaluate(() => {
        const textareas = Array.from(document.querySelectorAll('textarea, [contenteditable="true"]'));
        return textareas.find(textarea => 
          textarea.placeholder?.includes('内容') ||
          textarea.placeholder?.includes('描述') ||
          textarea.getAttribute('class')?.includes('content') ||
          textarea.getAttribute('class')?.includes('editor')
        );
      });
      
      if (contentInputFound) {
        await page.evaluate((textarea) => textarea.focus(), contentInputFound);
        await page.keyboard.type(content, { delay: 50 });
      } else {
        throw new Error('未找到内容输入框');
      }
    } else {
      await contentInput.click();
      await page.keyboard.type(content, { delay: 50 });
    }
    
    if (autoDelay) {
      await randomDelay(1000, 2000);
    }
    
    // 上传图片/视频
    if (files && files.length > 0) {
      const fileInput = await page.waitForSelector(
        'input[type="file"]',
        { timeout: 10000 }
      ).catch(() => null);
      
      if (fileInput) {
        // Puppeteer 的文件上传：使用 ElementHandle.uploadFile() 方法
        // 注意：uploadFile 方法接受文件路径数组
        try {
          await fileInput.uploadFile(...files);
        } catch (error) {
          console.warn('文件上传方法失败，尝试备用方案:', error);
          // 备用方案：通过 evaluate 触发文件选择
          await fileInput.evaluate((el, filePaths) => {
            // 注意：浏览器环境无法直接访问文件系统
            // 实际使用时需要根据平台的具体实现调整
            console.log('文件路径:', filePaths);
          }, files);
        }
        await randomDelay(3000, 5000); // 等待上传完成
      }
    }
    
    if (autoDelay) {
      await randomDelay(2000, 3000);
    }
    
    // 发布或保存草稿
    if (!saveDraft) {
      const publishBtn = await page.waitForSelector(
        '.publish-btn, button[class*="publish"]',
        { timeout: 10000 }
      );
      await publishBtn.click();
      
      // 等待发布完成
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      
      return {
        success: true,
        message: '发布成功',
      };
    } else {
      const saveBtn = await page.waitForSelector(
        '.save-draft, button[class*="draft"]',
        { timeout: 10000 }
      );
      await saveBtn.click();
      
      return {
        success: true,
        message: '草稿保存成功',
      };
    }
  } catch (error) {
    console.error('发布错误:', error);
    return {
      success: false,
      message: error.message,
    };
  } finally {
    // 保持浏览器打开以便查看结果
    // await browser.close();
  }
}

/**
 * 抖音发布
 */
export async function publishToDouyin(data) {
  const { title, content, files, autoDelay, saveDraft } = data;
  
  const browser = await createBrowser(false);
  const page = await browser.newPage();
  
  try {
    await stealthPage(page);
    
    // 加载 Cookie
    const cookies = loadCookies('douyin');
    if (!cookies) {
      throw new Error('请先登录');
    }
    
    // 访问抖音创作者中心
    await page.goto('https://creator.douyin.com', { 
      waitUntil: 'networkidle2' 
    });
    
    // 设置 Cookie
    await page.setCookie(...cookies);
    await page.reload({ waitUntil: 'networkidle2' });
    
    if (autoDelay) {
      await randomDelay(2000, 4000);
    }
    
    // 查找发布入口
    const publishLink = await page.waitForSelector(
      '.publish-btn, [href*="publish"], .create-video',
      { timeout: 10000 }
    ).catch(() => null);
    
    if (publishLink) {
      await publishLink.click();
      await randomDelay(2000, 3000);
    } else {
      await page.goto('https://creator.douyin.com/creator-micro/content/upload', {
        waitUntil: 'networkidle2'
      });
    }
    
    if (autoDelay) {
      await randomDelay(2000, 3000);
    }
    
    // 填写标题
    const titleInput = await page.waitForSelector(
      'input[placeholder*="标题"], textarea[placeholder*="标题"]',
      { timeout: 10000 }
    );
    await titleInput.click();
    await page.keyboard.type(title, { delay: 100 });
    
    if (autoDelay) {
      await randomDelay(1000, 2000);
    }
    
    // 填写内容
    const contentInput = await page.waitForSelector(
      'textarea[placeholder*="描述"], .description-input',
      { timeout: 10000 }
    );
    await contentInput.click();
    await page.keyboard.type(content, { delay: 50 });
    
    if (autoDelay) {
      await randomDelay(1000, 2000);
    }
    
    // 上传视频/图片
    if (files && files.length > 0) {
      const fileInput = await page.waitForSelector(
        'input[type="file"]',
        { timeout: 10000 }
      ).catch(() => null);
      
      if (fileInput) {
        // Puppeteer 的文件上传
        try {
          await fileInput.uploadFile(...files);
        } catch (error) {
          console.warn('文件上传方法失败，尝试备用方案:', error);
        }
        await randomDelay(5000, 8000); // 视频上传需要更长时间
      }
    }
    
    if (autoDelay) {
      await randomDelay(2000, 3000);
    }
    
    // 发布或保存草稿
    if (!saveDraft) {
      const publishBtn = await page.waitForSelector(
        '.publish-btn, button[class*="publish"]',
        { timeout: 10000 }
      );
      await publishBtn.click();
      
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
      
      return {
        success: true,
        message: '发布成功',
      };
    } else {
      const saveBtn = await page.waitForSelector(
        '.save-draft, button[class*="draft"]',
        { timeout: 10000 }
      );
      await saveBtn.click();
      
      return {
        success: true,
        message: '草稿保存成功',
      };
    }
  } catch (error) {
    console.error('发布错误:', error);
    return {
      success: false,
      message: error.message,
    };
  } finally {
    // 保持浏览器打开
    // await browser.close();
  }
}

