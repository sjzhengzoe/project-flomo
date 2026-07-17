import { listDiningScenes, swapDiningSceneSortOrders } from "../../../services/life-lists"
import type { DiningScene } from "../../../types/life-lists"
import { activateAsyncPage, beginAsyncPageRequest, deactivateAsyncPage, isAsyncPageActive, isAsyncPageRequestCurrent } from "../../../utils/async-page"

Page({
  data: { scenes: [] as DiningScene[], loading: true, contentLoading: false, hasLoaded: false, moving: false, errorMessage: "" },
  onShow() { activateAsyncPage(this); this.loadScenes() },
  onUnload() { deactivateAsyncPage(this) },
  async loadScenes() {
    const generation = beginAsyncPageRequest(this); const initial = !this.data.hasLoaded
    this.setData({ loading: initial, contentLoading: !initial, errorMessage: "" })
    try { const scenes = await listDiningScenes(); if (isAsyncPageRequestCurrent(this, generation)) this.setData({ scenes }) }
    catch (error) { if (isAsyncPageRequestCurrent(this, generation)) this.setData({ errorMessage: error instanceof Error ? error.message : "场景加载失败" }) }
    finally { if (isAsyncPageRequestCurrent(this, generation)) this.setData({ loading: false, contentLoading: false, hasLoaded: true }) }
  },
  handleAdd() { if (!this.data.moving) wx.navigateTo({ url: "/pages/dining/scene-edit/index" }) },
  handleEdit(event: WechatMiniprogram.TouchEvent) { const id = String(event.currentTarget.dataset.id || ""); if (id && !this.data.moving) wx.navigateTo({ url: `/pages/dining/scene-edit/index?id=${id}` }) },
  async handleMove(event: WechatMiniprogram.TouchEvent) {
    if (this.data.moving) return
    const index = Number(event.currentTarget.dataset.index); const targetIndex = index + Number(event.currentTarget.dataset.direction); const source = this.data.scenes[index]; const target = this.data.scenes[targetIndex]
    if (!source || !target) return
    const scenes = [...this.data.scenes]; scenes[index] = target; scenes[targetIndex] = source; this.setData({ scenes, moving: true })
    try { await swapDiningSceneSortOrders(source.id, target.id) } catch (error) { if (isAsyncPageActive(this)) wx.showToast({ title: error instanceof Error ? error.message : "排序失败", icon: "none" }) }
    finally { if (isAsyncPageActive(this)) { this.setData({ moving: false }); this.loadScenes() } }
  }
})
