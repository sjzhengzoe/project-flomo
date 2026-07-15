type EditorSource = "xiaohongshu" | "douyin2"

type EditorConfig = {
  title: string
  storageKey: string
}

const EDITOR_CONFIG: Record<EditorSource, EditorConfig> = {
  xiaohongshu: {
    title: "小红书文案",
    storageKey: "XIAOHONGSHU_FORM_DATA_CONTENT"
  },
  douyin2: {
    title: "抖音文案",
    storageKey: "DOUYIN2_FORM_DATA_CONTENT"
  }
}

function normalizeSource(source: string | undefined): EditorSource {
  return source === "douyin2" ? "douyin2" : "xiaohongshu"
}

Page({
  data: {
    source: "xiaohongshu" as EditorSource,
    content: ""
  },

  onLoad(query: Record<string, string | undefined>) {
    const source = normalizeSource(query.source)
    const config = EDITOR_CONFIG[source]
    const storedContent = wx.getStorageSync(config.storageKey)

    wx.setNavigationBarTitle({
      title: config.title
    })

    this.setData({
      source,
      content: typeof storedContent === "string" ? storedContent : ""
    })
  },

  handleInput(event: WechatMiniprogram.Input) {
    this.setData({
      content: event.detail.value
    })
  },

  clearContent() {
    this.setData({
      content: ""
    })
  },

  saveContent() {
    const source = this.data.source as EditorSource
    const config = EDITOR_CONFIG[source]

    wx.setStorageSync(config.storageKey, this.data.content.trim())
    wx.showToast({
      title: "已保存",
      icon: "success"
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 220)
  }
})
