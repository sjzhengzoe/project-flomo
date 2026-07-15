import { ensureLogin } from "../../services/auth"
import {
  createLuggageGroup,
  createLuggageItem,
  createLuggageScene,
  deleteLuggageGroup,
  deleteLuggageItem,
  deleteLuggageScene,
  listLuggageScenes,
  updateLuggageGroup,
  updateLuggageItem,
  updateLuggageScene
} from "../../services/life-lists"
import type { LuggageScene } from "../../types/life-lists"
import {
  activateAsyncPage,
  beginAsyncPageRequest,
  deactivateAsyncPage,
  isAsyncPageActive,
  isAsyncPageRequestCurrent
} from "../../utils/async-page"

function promptText(title: string, placeholder: string, content = ""): Promise<string | null> {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      editable: true,
      placeholderText: placeholder,
      content,
      success: (result) => resolve(result.confirm ? result.content.trim() || null : null),
      fail: () => resolve(null)
    })
  })
}

function getSceneCounts(scene: LuggageScene | null): {
  groupCount: number
  itemCount: number
} {
  if (!scene) return { groupCount: 0, itemCount: 0 }
  return {
    groupCount: scene.groups.length,
    itemCount: scene.groups.reduce((total, group) => total + group.items.length, 0)
  }
}

Page({
  data: {
    scenes: [] as LuggageScene[],
    activeSceneId: "",
    activeScene: null as LuggageScene | null,
    activeGroupCount: 0,
    activeItemCount: 0,
    canWrite: false,
    loading: true,
    contentLoading: false,
    hasLoaded: false
  },

  onShow() {
    activateAsyncPage(this)
    this.loadScenes()
  },

  onUnload() {
    deactivateAsyncPage(this)
  },

  async loadScenes() {
    if (!isAsyncPageActive(this)) return
    const generation = beginAsyncPageRequest(this)
    const showInitialLoading = !this.data.hasLoaded
    this.setData({
      loading: showInitialLoading,
      contentLoading: !showInitialLoading
    })
    try {
      const session = await ensureLogin()
      const scenes = await listLuggageScenes()
      if (!isAsyncPageRequestCurrent(this, generation)) return
      const activeSceneId = scenes.some((scene) => scene.id === this.data.activeSceneId)
        ? this.data.activeSceneId
        : scenes[0]?.id || ""
      const activeScene = scenes.find((scene) => scene.id === activeSceneId) || null
      const counts = getSceneCounts(activeScene)
      this.setData({
        scenes,
        activeSceneId,
        activeScene,
        activeGroupCount: counts.groupCount,
        activeItemCount: counts.itemCount,
        canWrite: session.user.can_write
      })
    } catch (error) {
      if (!isAsyncPageRequestCurrent(this, generation)) return
      wx.showToast({ title: error instanceof Error ? error.message : "加载失败", icon: "none" })
    } finally {
      if (isAsyncPageRequestCurrent(this, generation)) {
        this.setData({ loading: false, contentLoading: false, hasLoaded: true })
      }
    }
  },

  handleSceneTap(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || "")
    const activeScene = this.data.scenes.find((scene) => scene.id === id) || null
    const counts = getSceneCounts(activeScene)
    this.setData({
      activeSceneId: id,
      activeScene,
      activeGroupCount: counts.groupCount,
      activeItemCount: counts.itemCount
    })
  },

  async handleAddScene() {
    if (!this.data.canWrite) return
    const name = await promptText("新增场景", "例如：成都三日游")
    if (!name || !isAsyncPageActive(this)) return
    try {
      const scene = await createLuggageScene(name)
      if (!isAsyncPageActive(this)) return
      this.setData({ activeSceneId: scene.id })
      await this.loadScenes()
    } catch (error) {
      if (isAsyncPageActive(this)) {
        wx.showToast({ title: error instanceof Error ? error.message : "新增失败", icon: "none" })
      }
    }
  },

  async handleRenameScene() {
    const scene = this.data.activeScene
    if (!scene || !this.data.canWrite) return
    const name = await promptText("修改场景名", "输入场景名称", scene.name)
    if (!name || !isAsyncPageActive(this)) return
    await updateLuggageScene(scene.id, name)
    if (isAsyncPageActive(this)) this.loadScenes()
  },

  handleDeleteScene() {
    const scene = this.data.activeScene
    if (!scene || !this.data.canWrite) return
    wx.showModal({
      title: "删除场景",
      content: `将同时删除“${scene.name}”下的全部层级和物品。`,
      confirmText: "删除",
      confirmColor: "#c9342f",
      success: async (result) => {
        if (!result.confirm || !isAsyncPageActive(this)) return
        await deleteLuggageScene(scene.id)
        if (!isAsyncPageActive(this)) return
        this.setData({ activeSceneId: "" })
        this.loadScenes()
      }
    })
  },

  async handleAddGroup() {
    const scene = this.data.activeScene
    if (!scene || !this.data.canWrite) return
    const name = await promptText("新增携带层级", "例如：更加精致")
    if (!name || !isAsyncPageActive(this)) return
    await createLuggageGroup(scene.id, name)
    if (isAsyncPageActive(this)) this.loadScenes()
  },

  async handleRenameGroup(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || "")
    const name = String(event.currentTarget.dataset.name || "")
    const nextName = await promptText("修改层级名", "输入层级名称", name)
    if (!nextName || !isAsyncPageActive(this)) return
    await updateLuggageGroup(id, nextName)
    if (isAsyncPageActive(this)) this.loadScenes()
  },

  handleDeleteGroup(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || "")
    wx.showModal({
      title: "删除携带层级",
      content: "该层级下的物品也会删除。",
      confirmText: "删除",
      confirmColor: "#c9342f",
      success: async (result) => {
        if (!result.confirm || !isAsyncPageActive(this)) return
        await deleteLuggageGroup(id)
        if (isAsyncPageActive(this)) this.loadScenes()
      }
    })
  },

  async handleAddItem(event: WechatMiniprogram.TouchEvent) {
    const groupId = String(event.currentTarget.dataset.groupId || "")
    const name = await promptText("新增物品", "例如：身份证")
    if (!name || !isAsyncPageActive(this)) return
    await createLuggageItem(groupId, name)
    if (isAsyncPageActive(this)) this.loadScenes()
  },

  async handleRenameItem(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || "")
    const name = String(event.currentTarget.dataset.name || "")
    const nextName = await promptText("修改物品", "输入物品名称", name)
    if (!nextName || !isAsyncPageActive(this)) return
    await updateLuggageItem(id, nextName)
    if (isAsyncPageActive(this)) this.loadScenes()
  },

  handleDeleteItem(event: WechatMiniprogram.TouchEvent) {
    const id = String(event.currentTarget.dataset.id || "")
    wx.showModal({
      title: "删除物品",
      content: "确认删除这件物品？",
      confirmText: "删除",
      confirmColor: "#c9342f",
      success: async (result) => {
        if (!result.confirm || !isAsyncPageActive(this)) return
        await deleteLuggageItem(id)
        if (isAsyncPageActive(this)) this.loadScenes()
      }
    })
  }
})
