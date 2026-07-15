import {
  getCurrentUser,
  isProfileRequiredError,
  login,
  loginExistingUser
} from "../../services/auth"
import { hideGlobalLoading, showGlobalLoading } from "../../services/loading"
import type { AppUser } from "../../types/api"

type LoginStage = "welcome" | "profile"

function getWechatProfile(): Promise<WechatMiniprogram.UserInfo | null> {
  return new Promise((resolve) => {
    wx.getUserProfile({
      desc: "用于完善头像和昵称",
      lang: "zh_CN",
      success: (result) => resolve(result.userInfo),
      fail: () => resolve(null)
    })
  })
}

function enterApp(user: AppUser): Promise<void> {
  getApp<IAppOption>().globalData.currentUser = user
  showGlobalLoading("正在进入…")

  return new Promise((resolve, reject) => {
    wx.switchTab({
      url: "/pages/create/index",
      success: () => resolve(),
      fail: (result) => {
        hideGlobalLoading()
        reject(new Error(result.errMsg || "无法打开首页，请重试。"))
      }
    })
  })
}

Page({
  data: {
    stage: "welcome" as LoginStage,
    avatarUrl: "",
    avatarIsLocal: false,
    displayName: "",
    preparingProfile: false,
    loggingIn: false,
    errorMessage: ""
  },

  onShow() {
    const user = getCurrentUser()
    if (!user) return
    void enterApp(user).catch((error) => {
      this.setData({
        errorMessage: error instanceof Error ? error.message : "无法打开首页，请重试"
      })
    })
  },

  async handleLoginTap() {
    if (this.data.preparingProfile) return
    this.setData({ preparingProfile: true, errorMessage: "" })
    try {
      const session = await loginExistingUser()
      await enterApp(session.user)
    } catch (error) {
      if (isProfileRequiredError(error)) {
        const profile = await getWechatProfile()
        this.setData({
          stage: "profile",
          avatarUrl: profile?.avatarUrl || "",
          avatarIsLocal: false,
          displayName: profile?.nickName || ""
        })
      } else {
        this.setData({
          errorMessage: error instanceof Error ? error.message : "登录失败，请稍后重试"
        })
      }
    } finally {
      this.setData({ preparingProfile: false })
    }
  },

  handleChooseAvatar(event: WechatMiniprogram.CustomEvent<{ avatarUrl: string }>) {
    this.setData({
      avatarUrl: event.detail.avatarUrl,
      avatarIsLocal: true,
      errorMessage: ""
    })
  },

  handleNicknameInput(event: WechatMiniprogram.Input) {
    this.setData({ displayName: event.detail.value, errorMessage: "" })
  },

  handleProfileBack() {
    if (this.data.loggingIn) return
    this.setData({ stage: "welcome", errorMessage: "" })
  },

  async handleConfirmLogin(event: WechatMiniprogram.FormSubmit) {
    if (this.data.loggingIn) return
    const submittedDisplayName = event.detail.value.displayName
    const displayName = (
      typeof submittedDisplayName === "string"
        ? submittedDisplayName
        : this.data.displayName
    ).trim()
    this.setData({ displayName, errorMessage: "" })
    if (!this.data.avatarUrl) {
      wx.showToast({ title: "请选择头像", icon: "none" })
      return
    }
    if (!displayName) {
      wx.showToast({ title: "请填写昵称", icon: "none" })
      return
    }
    if (displayName.length > 40) {
      wx.showToast({ title: "昵称不能超过 40 个字符", icon: "none" })
      return
    }

    this.setData({ loggingIn: true, errorMessage: "" })
    try {
      const session = await login({
        displayName,
        avatarUrl: this.data.avatarUrl,
        avatarIsLocal: this.data.avatarIsLocal
      })
      await enterApp(session.user)
    } catch (error) {
      this.setData({
        errorMessage: error instanceof Error ? error.message : "登录失败，请稍后重试"
      })
    } finally {
      this.setData({ loggingIn: false })
    }
  }
})
