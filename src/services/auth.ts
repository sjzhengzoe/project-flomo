import { API_BASE_URL } from "../config/env"
import type { ApiEnvelope, AppUser, AuthSession } from "../types/api"
import { clearStoredSession, getStoredSession, setStoredSession } from "./session"

export type LoginProfile = {
  displayName: string
  avatarUrl: string
  avatarIsLocal: boolean
}

class LoginApiError extends Error {
  readonly code: string

  constructor(message: string, code = "LOGIN_FAILED") {
    super(message)
    this.name = "LoginApiError"
    this.code = code
  }
}

let pendingLogin: Promise<AuthSession> | null = null
let redirectingToLogin = false

function callbackError(result: WechatMiniprogram.GeneralCallbackResult, fallback: string): Error {
  return new Error(result.errMsg || fallback)
}

function wxLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.login({
      success(result) {
        if (result.code) resolve(result.code)
        else reject(new Error("微信没有返回登录凭证。"))
      },
      fail(result) {
        reject(callbackError(result, "无法获取微信登录凭证。"))
      }
    })
  })
}

function requestWechatSession(code: string, profile?: LoginProfile): Promise<AuthSession> {
  return new Promise((resolve, reject) => {
    const data: Record<string, string> = { code }
    if (profile) {
      data.display_name = profile.displayName
      data.avatar_url = profile.avatarIsLocal ? "" : profile.avatarUrl
    }
    wx.request<ApiEnvelope<AuthSession>>({
      url: `${API_BASE_URL}/api/auth/wechat`,
      method: "POST",
      data,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300 && response.data.data) {
          resolve(response.data.data)
          return
        }
        reject(
          new LoginApiError(
            response.data.error?.message || `登录失败（${response.statusCode}）`,
            response.data.error?.code
          )
        )
      },
      fail(result) {
        reject(callbackError(result, "无法连接登录服务。"))
      }
    })
  })
}

function uploadAvatar(filePath: string, token: string): Promise<AppUser> {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE_URL}/api/auth/avatar`,
      filePath,
      name: "avatar",
      header: { Authorization: `Bearer ${token}` },
      success(response) {
        let body: ApiEnvelope<{ user: AppUser }> = { ok: false }
        try {
          body = JSON.parse(response.data) as ApiEnvelope<{ user: AppUser }>
        } catch (_error) {
          // 统一走下面的错误信息。
        }
        if (response.statusCode >= 200 && response.statusCode < 300 && body.data?.user) {
          resolve(body.data.user)
          return
        }
        reject(new Error(body.error?.message || `头像保存失败（${response.statusCode}）`))
      },
      fail(result) {
        reject(callbackError(result, "无法上传头像。"))
      }
    })
  })
}

async function runLogin(profile?: LoginProfile): Promise<AuthSession> {
  if (pendingLogin) return pendingLogin

  pendingLogin = (async () => {
    const code = await wxLogin()
    const session = await requestWechatSession(code, profile)
    if (profile?.avatarIsLocal) {
      session.user = await uploadAvatar(profile.avatarUrl, session.token)
    }
    setStoredSession(session)
    redirectingToLogin = false
    return session
  })()

  try {
    return await pendingLogin
  } finally {
    pendingLogin = null
  }
}

export function loginExistingUser(): Promise<AuthSession> {
  return runLogin()
}

export function login(profile: LoginProfile): Promise<AuthSession> {
  return runLogin(profile)
}

export function isProfileRequiredError(error: unknown): boolean {
  return error instanceof LoginApiError && error.code === "PROFILE_REQUIRED"
}

export function redirectToLogin(expectedToken?: string): void {
  if (!clearStoredSession(expectedToken)) return
  try {
    getApp<IAppOption>().globalData.currentUser = null
  } catch (_error) {
    // App 初始化早期可能还取不到实例。
  }

  const pages = getCurrentPages()
  const currentRoute = pages[pages.length - 1]?.route
  if (currentRoute === "pages/login/index" || redirectingToLogin) return
  redirectingToLogin = true
  wx.reLaunch({
    url: "/pages/login/index",
    complete: () => {
      redirectingToLogin = false
    }
  })
}

export async function ensureLogin(): Promise<AuthSession> {
  const stored = getStoredSession()
  if (stored) return stored
  redirectToLogin()
  throw new Error("请先登录。")
}

export function getCurrentUser(): AppUser | null {
  return getStoredSession()?.user || null
}

export async function logout(): Promise<void> {
  const session = getStoredSession()
  if (session) {
    await new Promise<void>((resolve) => {
      wx.request({
        url: `${API_BASE_URL}/api/auth/logout`,
        method: "POST",
        header: { Authorization: `Bearer ${session.token}` },
        complete: () => resolve()
      })
    })
  }
  clearStoredSession()
  try {
    getApp<IAppOption>().globalData.currentUser = null
  } catch (_error) {
    // 忽略 App 销毁阶段的取值失败。
  }
}
