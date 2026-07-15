import {
  listWardrobeCategories,
  swapWardrobeCategorySortOrders
} from "../../../services/wardrobe"
import type { WardrobeCategory } from "../../../types/wardrobe"
import {
  activateAsyncPage,
  beginAsyncPageRequest,
  deactivateAsyncPage,
  isAsyncPageActive,
  isAsyncPageRequestCurrent
} from "../../../utils/async-page"

type DisplayCategory = WardrobeCategory & { fieldSummary: string }

Page({
  data: {
    categories: [] as DisplayCategory[],
    totalFieldCount: 0,
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
      const categories = await listWardrobeCategories()
      if (!isAsyncPageRequestCurrent(this, generation)) return
      this.setData({
        categories: categories.map((category) => ({
          ...category,
          fieldSummary: category.fields.map((field) => field.name).join(" · ") || "暂无预设属性"
        })),
        totalFieldCount: categories.reduce(
          (total, category) => total + category.fields.length,
          0
        )
      })
    } catch (error) {
      if (!isAsyncPageRequestCurrent(this, generation)) return
      this.setData({
        errorMessage: error instanceof Error ? error.message : "分类加载失败"
      })
    } finally {
      if (isAsyncPageRequestCurrent(this, generation)) {
        this.setData({ loading: false, contentLoading: false, hasLoaded: true })
      }
    }
  },

  handleAdd() {
    if (!this.data.moving && !this.data.contentLoading) {
      wx.navigateTo({ url: "/pages/wardrobe/category-edit/index" })
    }
  },

  handleEdit(event: WechatMiniprogram.TouchEvent) {
    if (this.data.moving || this.data.contentLoading) return
    const id = String(event.currentTarget.dataset.id || "")
    if (id) wx.navigateTo({ url: `/pages/wardrobe/category-edit/index?id=${id}` })
  },

  async handleMove(event: WechatMiniprogram.TouchEvent) {
    if (this.data.moving || this.data.contentLoading) return
    const index = Number(event.currentTarget.dataset.index)
    const direction = Number(event.currentTarget.dataset.direction)
    const targetIndex = index + direction
    const source = this.data.categories[index]
    const target = this.data.categories[targetIndex]
    if (!source || !target) return

    const categories = [...this.data.categories]
    categories[index] = target
    categories[targetIndex] = source
    this.setData({ categories, moving: true })
    try {
      await swapWardrobeCategorySortOrders(source.id, target.id)
    } catch (error) {
      if (isAsyncPageActive(this)) {
        wx.showToast({
          title: error instanceof Error ? error.message : "排序失败",
          icon: "none"
        })
      }
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
