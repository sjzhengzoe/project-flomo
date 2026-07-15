import { getCurrentUser, redirectToLogin } from "./services/auth"

App<IAppOption>({
  globalData: {
    currentUser: null
  },
  onLaunch() {
    this.globalData.currentUser = getCurrentUser()
  },
  onShow() {
    const user = getCurrentUser()
    this.globalData.currentUser = user
    const pages = getCurrentPages()
    const currentRoute = pages[pages.length - 1]?.route
    if (user) return
    if (currentRoute && currentRoute !== "pages/login/index") {
      redirectToLogin()
      return
    }
    if (!currentRoute) {
      setTimeout(() => {
        if (getCurrentUser()) return
        const readyPages = getCurrentPages()
        const readyRoute = readyPages[readyPages.length - 1]?.route
        if (readyRoute && readyRoute !== "pages/login/index") redirectToLogin()
      }, 0)
    }
  }
})
