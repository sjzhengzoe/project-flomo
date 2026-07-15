import { ensureLogin } from "../../services/auth"
import {
  createActivityItem,
  deleteActivityItem,
  listActivityItems,
  updateActivityItem
} from "../../services/life-lists"
import type { ActivityItem, ActivityType } from "../../types/life-lists"
import {
  activateAsyncPage,
  beginAsyncPageRequest,
  deactivateAsyncPage,
  isAsyncPageActive,
  isAsyncPageRequestCurrent
} from "../../utils/async-page"

const ACTIVITY_TYPES: ActivityType[] = ["室内", "户外", "居家"]

Page({
  data: {
    activityTypes: ACTIVITY_TYPES,
    activeType: "室内" as ActivityType,
    items: [] as ActivityItem[],
    canWrite: false,
    loading: true,
    contentLoading: false,
    hasLoaded: false,
    showEditor: false,
    editingId: "",
    editorName: "",
    editorType: "室内" as ActivityType,
    saving: false,
    deleting: false
  },

  onShow() {
    activateAsyncPage(this)
    this.loadItems()
  },

  onUnload() {
    deactivateAsyncPage(this)
  },

  async loadItems() {
    const generation = beginAsyncPageRequest(this)
    const activeType = this.data.activeType
    const showInitialLoading = !this.data.hasLoaded
    this.setData({
      loading: showInitialLoading,
      contentLoading: !showInitialLoading
    })
    try {
      const session = await ensureLogin()
      const items = await listActivityItems(activeType)
      if (!isAsyncPageRequestCurrent(this, generation)) return
      this.setData({ items, canWrite: session.user.can_write })
    } catch (error) {
      if (!isAsyncPageRequestCurrent(this, generation)) return
      wx.showToast({ title: error instanceof Error ? error.message : "加载失败", icon: "none" })
    } finally {
      if (isAsyncPageRequestCurrent(this, generation)) {
        this.setData({ loading: false, contentLoading: false, hasLoaded: true })
      }
    }
  },

  handleTypeTap(event: WechatMiniprogram.TouchEvent) {
    if (this.data.saving || this.data.deleting) return
    const type = event.currentTarget.dataset.type as ActivityType
    if (!type || type === this.data.activeType) return
    this.setData({ activeType: type }, () => this.loadItems())
  },

  noop() {},

  handleAdd() {
    if (!this.data.canWrite || this.data.loading || this.data.contentLoading || this.data.deleting) return
    this.setData({
      showEditor: true,
      editingId: "",
      editorName: "",
      editorType: this.data.activeType
    })
  },

  handleEdit(event: WechatMiniprogram.TouchEvent) {
    if (!this.data.canWrite || this.data.loading || this.data.contentLoading || this.data.deleting) return
    const id = String(event.currentTarget.dataset.id || "")
    const item = this.data.items.find((entry) => entry.id === id)
    if (!item) return
    this.setData({
      showEditor: true,
      editingId: item.id,
      editorName: item.name,
      editorType: item.activity_type
    })
  },

  handleEditorNameInput(event: WechatMiniprogram.Input) {
    this.setData({ editorName: event.detail.value })
  },

  handleEditorTypeTap(event: WechatMiniprogram.TouchEvent) {
    this.setData({ editorType: event.currentTarget.dataset.type as ActivityType })
  },

  closeEditor() {
    if (!this.data.saving) this.setData({ showEditor: false })
  },

  async saveEditor() {
    const name = this.data.editorName.trim()
    if (!name || this.data.saving) return
    this.setData({ saving: true })
    try {
      if (this.data.editingId) {
        await updateActivityItem(this.data.editingId, name, this.data.editorType)
      } else {
        await createActivityItem(name, this.data.editorType)
      }
      if (!isAsyncPageActive(this)) return
      this.setData({ showEditor: false, activeType: this.data.editorType })
      await this.loadItems()
    } catch (error) {
      if (isAsyncPageActive(this)) {
        wx.showToast({ title: error instanceof Error ? error.message : "保存失败", icon: "none" })
      }
    } finally {
      if (isAsyncPageActive(this)) this.setData({ saving: false })
    }
  },

  handleDelete(event: WechatMiniprogram.TouchEvent) {
    if (!this.data.canWrite || this.data.saving || this.data.deleting) return
    const id = String(event.currentTarget.dataset.id || "")
    if (!id) return
    this.setData({ deleting: true })
    wx.showModal({
      title: "删除活动",
      content: "删除后无法恢复。",
      confirmText: "删除",
      confirmColor: "#c9342f",
      success: async (result) => {
        if (!isAsyncPageActive(this)) return
        if (!result.confirm) {
          this.setData({ deleting: false })
          return
        }
        try {
          await deleteActivityItem(id)
          if (isAsyncPageActive(this)) await this.loadItems()
        } catch (error) {
          if (isAsyncPageActive(this)) {
            wx.showToast({
              title: error instanceof Error ? error.message : "删除失败",
              icon: "none"
            })
          }
        } finally {
          if (isAsyncPageActive(this)) this.setData({ deleting: false })
        }
      },
      fail: () => {
        if (isAsyncPageActive(this)) this.setData({ deleting: false })
      }
    })
  }
})
