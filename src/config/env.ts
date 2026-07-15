const PRODUCTION_API_BASE_URL = "https://gufeifei.cn"

// 微信开发者工具需要直连本机服务时，可临时填写局域网地址；不要提交私密信息。
const DEVELOPMENT_API_BASE_URL = "http://127.0.0.1:3000"

function getEnvVersion(): "develop" | "trial" | "release" {
  try {
    return wx.getAccountInfoSync().miniProgram.envVersion
  } catch (_error) {
    return "release"
  }
}

function isDevTools(): boolean {
  try {
    return wx.getSystemInfoSync().platform === "devtools"
  } catch (_error) {
    return false
  }
}

export const API_BASE_URL =
  getEnvVersion() === "develop" && isDevTools() && DEVELOPMENT_API_BASE_URL
    ? DEVELOPMENT_API_BASE_URL
    : PRODUCTION_API_BASE_URL
