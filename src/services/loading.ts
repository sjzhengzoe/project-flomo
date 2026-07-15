const AUTO_HIDE_DELAY = 15000

let visible = false
let generation = 0
let autoHideTimer: number | null = null

function clearAutoHideTimer(): void {
  if (autoHideTimer === null) return
  clearTimeout(autoHideTimer)
  autoHideTimer = null
}

export function showGlobalLoading(title = "加载中…"): void {
  generation += 1
  const currentGeneration = generation

  visible = true
  clearAutoHideTimer()
  wx.showLoading({ title, mask: true })

  autoHideTimer = setTimeout(() => {
    if (!visible || generation !== currentGeneration) return
    visible = false
    autoHideTimer = null
    wx.hideLoading()
  }, AUTO_HIDE_DELAY)
}

export function hideGlobalLoading(): void {
  if (!visible) return

  visible = false
  generation += 1
  clearAutoHideTimer()
  wx.hideLoading()
}
