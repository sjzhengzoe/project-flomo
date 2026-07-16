import { listMediaCategories, swapMediaCategorySortOrders } from "../../../services/life-lists"
import type { MediaCategory } from "../../../types/life-lists"
import {
  activateAsyncPage,
  beginAsyncPageRequest,
  deactivateAsyncPage,
  isAsyncPageActive,
  isAsyncPageRequestCurrent
} from "../../../utils/async-page"

Page({
  data: {
    categories: [] as MediaCategory[],
    loading: true,
    contentLoading: false,
    hasLoaded: false,
    moving: false,
    errorMessage: ""
  },

  onShow() {
    activateAsyncPage(this)
    this.loadCategories()
  },

  onUnload() {
    deactivateAsyncPage(this)
  },

  async loadCategories() {
    const generation = beginAsyncPageRequest(this)
    const showInitialLoading = !this.data.hasLoaded
    this.setData({
      loading: showInitialLoading,
      contentLoading: !showInitialLoading,
      errorMessage: ""
    })
    try {
      const categories = await listMediaCategories()
      if (isAsyncPageRequestCurrent(this, generation)) this.setData({ categories })
    } catch (error) {
      if (isAsyncPageRequestCurrent(this, generation)) {
        const message = error instanceof Error ? error.message : "分类加载失败"
        if (showInitialLoading) this.setData({ errorMessage: message })
        else wx.showToast({ title: message, icon: "none" })
      }
    } finally {
      if (isAsyncPageRequestCurrent(this, generation)) {
        this.setData({ loading: false, contentLoading: false, hasLoaded: true })
      }
    }
  },

  handleAdd() {
    if (!this.data.moving && !this.data.contentLoading) {
      wx.navigateTo({ url: "/pages/media/category-edit/index" })
    }
  },

  handleEdit(event: WechatMiniprogram.TouchEvent) {
    if (this.data.moving || this.data.contentLoading) return
    const id = String(event.currentTarget.dataset.id || "")
    if (id) wx.navigateTo({ url: `/pages/media/category-edit/index?id=${id}` })
  },

  async handleMove(event: WechatMiniprogram.TouchEvent) {
    if (this.data.moving || this.data.contentLoading) return
    const index = Number(event.currentTarget.dataset.index)
    const targetIndex = index + Number(event.currentTarget.dataset.direction)
    const source = this.data.categories[index]
    const target = this.data.categories[targetIndex]
    if (!source || !target) return
    const categories = [...this.data.categories]
    categories[index] = target
    categories[targetIndex] = source
    this.setData({ categories, moving: true })
    try {
      await swapMediaCategorySortOrders(source.id, target.id)
    } catch (error) {
      if (isAsyncPageActive(this)) wx.showToast({ title: error instanceof Error ? error.message : "排序失败", icon: "none" })
    } finally {
      if (isAsyncPageActive(this)) {
        this.setData({ moving: false })
        this.loadCategories()
      }
    }
  },

  handleRetry() {
    this.loadCategories()
  }
})
