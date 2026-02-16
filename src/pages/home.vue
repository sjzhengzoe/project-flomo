<template>
  <div class="page">
    <!-- 编辑区：玻璃面板 -->
    <aside class="page__form glass-panel">
      <div class="page__form-inner">
        <h2 class="page__form-title">编辑</h2>
        <form class="form" @submit.prevent>
          <div class="form-item">
            <label class="form-label">标题</label>
            <input
              class="form-input"
              type="text"
              :value="formData.title"
              @input="
                formData.title = ($event.target as HTMLInputElement).value;
                handleChangeTitle();
              "
            />
          </div>
          <div class="form-item">
            <label class="form-label">日期/心情</label>
            <input
              class="form-input"
              type="text"
              :value="formData.location"
              @input="
                formData.location = ($event.target as HTMLInputElement).value;
                handleChangeLocation();
              "
            />
          </div>
          <div class="form-item">
            <label class="form-label">前言</label>
            <input
              class="form-input"
              type="text"
              :value="formData.preface"
              @input="
                formData.preface = ($event.target as HTMLInputElement).value;
                handleChangePreface();
              "
            />
          </div>
          <div class="form-item">
            <div class="form-label-row">
              <label class="form-label">内容</label>
              <button
                type="button"
                class="btn btn-text"
                @click="handleClearContent"
              >
                清空
              </button>
            </div>
            <textarea
              class="form-textarea"
              :value="formData.content"
              @input="
                formData.content = ($event.target as HTMLTextAreaElement).value;
                handleChangeContent();
              "
              rows="6"
            />
          </div>
          <div class="form-item form-item--action">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="downloadLoading"
              @click="handleToDownload"
            >
              {{ downloadLoading ? "生成中..." : "预览图片" }}
            </button>
            <button
              type="button"
              class="btn btn-xhs"
              :disabled="shareLoading"
              @click="handleShareToXiaohongshu"
            >
              {{ shareLoading ? "准备中..." : "分享到小红书" }}
            </button>
            <button
              type="button"
              class="btn btn-douyin"
              @click="handleShareToDouyin"
            >
              分享到抖音
            </button>
          </div>
        </form>
      </div>
    </aside>

    <!-- 分享提示（移动端） -->
    <div v-if="shareToast" class="share-toast">{{ shareToast }}</div>

    <!-- 主内容区：预览 + 下载 -->
    <main class="page__main">
      <Card />
      <footer class="page__footer">
        <a class="icp" href="https://beian.miit.gov.cn" target="_blank">
          粤ICP备2025373031号
        </a>
      </footer>
    </main>

    <!-- 图片预览弹窗 -->
    <div v-if="showPreview" class="preview-modal" @click="closePreview">
      <div class="preview-modal__content" @click.stop>
        <button class="preview-modal__close" @click="closePreview">×</button>
        <Swiper
          :modules="previewModules"
          :slides-per-view="1"
          :space-between="20"
          :speed="300"
          :touch-ratio="1"
          class="preview-swiper"
          @swiper="onPreviewSwiper"
        >
          <SwiperSlide v-for="(imageUrl, idx) in previewImages" :key="idx">
            <div class="preview-slide">
              <img :src="imageUrl" :alt="`预览图片 ${idx + 1}`" />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "@/store";
import Card from "@/components/Card/index.vue";
import {
  convertBackgroundImagesToBase64,
  replaceSVGCSSVariables,
} from "@/utils";
import domtoimage from "dom-to-image";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const store = useStore();
const formData = computed(() => store.formData5);
const downloadLoading = ref(false);
const shareLoading = ref(false);
const shareToast = ref("");
const showPreview = ref(false);
const previewImages = ref<string[]>([]);
const previewSwiper = ref<any>(null);

const previewModules = [Pagination];

const XHS_SCHEME = "xhsdiscover://post_note/";
const DOUYIN_SCHEME = "snssdk1128://";

const onPreviewSwiper = (swiper: any) => {
  previewSwiper.value = swiper;
};

const closePreview = () => {
  // 清理 URL 对象，避免内存泄漏
  previewImages.value.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  showPreview.value = false;
  previewImages.value = [];
};

const handleToDownload = async () => {
  const name = "pic_";
  let index = 0;
  const images: string[] = [];
  downloadLoading.value = true;

  try {
    await document.fonts.ready;
    while (document.getElementById(`${name}${index}`)) {
      const node = document.getElementById(`${name}${index}`);
      if (!node) break;

      // 获取节点的实际尺寸
      const scale = 10; // 放大倍数
      const originalWidth = node.offsetWidth;
      const originalHeight = node.offsetHeight;
      const width = originalWidth * scale;
      const height = originalHeight * scale;

      // 找到包含 theme_box 的父容器，保持完整的上下文
      let containerNode = node.parentElement; // theme_box
      while (containerNode && !containerNode.classList.contains("theme_box")) {
        containerNode = containerNode.parentElement;
      }

      if (!containerNode) {
        containerNode = node;
      }

      // 保存原始位置信息
      const parent = containerNode.parentElement;
      const nextSibling = containerNode.nextSibling;

      // 在移动节点之前将背景图片转换为 base64，确保在 Safari 中也能正确显示
      await convertBackgroundImagesToBase64(containerNode as HTMLElement);

      // 创建包装容器
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "0";
      container.style.top = "0";
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.overflow = "hidden";
      container.style.backgroundColor = "transparent";
      container.style.zIndex = "999999";

      // 将整个容器节点移动到包装容器中
      container.appendChild(containerNode);
      document.body.appendChild(container);

      // 设置放大样式（应用到容器节点）
      (containerNode as HTMLElement).style.transform = `scale(${scale})`;
      (containerNode as HTMLElement).style.transformOrigin = "top left";
      (containerNode as HTMLElement).style.width = `${originalWidth}px`;
      (containerNode as HTMLElement).style.height = `${originalHeight}px`;

      try {
        // 等待渲染完成
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));

        // 移动节点后再次转换背景图片，确保 base64 格式正确应用
        await convertBackgroundImagesToBase64(container);

        // 替换 SVG 中的 CSS 变量为实际颜色值，确保 SVG 能正确显示
        replaceSVGCSSVariables(container);

        await new Promise((resolve) => setTimeout(resolve, 300)); // 额外等待确保渲染完成

        // 检测是否为 Safari 浏览器
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        let blob: Blob;
        if (isSafari) {
          // Safari 使用 html2canvas，对背景图片支持更好
          try {
            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(container, {
              width: width,
              height: height,
              useCORS: true,
              allowTaint: false,
              scale: 1,
              logging: false,
            });
            blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((blob: Blob | null) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("无法生成 blob"));
                }
              }, "image/png");
            });
          } catch (error) {
            console.error("html2canvas 失败，回退到 dom-to-image:", error);
            // 回退到 dom-to-image
            blob = await domtoimage.toBlob(container, {
              width: width,
              height: height,
              useCORS: true,
              cacheBust: false,
              filter: (_node: Node) => {
                return true;
              },
            });
          }
        } else {
          // 其他浏览器使用 dom-to-image
          blob = await domtoimage.toBlob(container, {
            width: width,
            height: height,
            useCORS: true,
            cacheBust: false,
            filter: (_node: Node) => {
              // 确保所有节点都被包含
              return true;
            },
          });
        }

        // 将 blob 转换为 data URL，用于预览
        const imageUrl = URL.createObjectURL(blob);
        images.push(imageUrl);
      } finally {
        // 恢复节点到原始位置
        container.removeChild(containerNode);
        if (nextSibling) {
          parent?.insertBefore(containerNode, nextSibling);
        } else {
          parent?.appendChild(containerNode);
        }
        document.body.removeChild(container);

        // 恢复节点样式
        (containerNode as HTMLElement).style.transform = "";
        (containerNode as HTMLElement).style.transformOrigin = "";
        (containerNode as HTMLElement).style.width = "";
        (containerNode as HTMLElement).style.height = "";
      }

      index++;
    }

    // 显示预览弹窗
    if (images.length > 0) {
      previewImages.value = images;
      showPreview.value = true;
    }
  } finally {
    downloadLoading.value = false;
  }
};

const handleShareToXiaohongshu = () => {
  // 直接跳转到小红书发布页面
  window.location.href = XHS_SCHEME;
};

const handleShareToDouyin = () => {
  // 直接跳转到抖音发布页面
  window.location.href = DOUYIN_SCHEME;
};

const handleChangeTitle = () => {
  localStorage.setItem(
    `FORM_DATA_TITLE_${store.nowTheme}`,
    formData.value.title
  );
};

const handleChangeLocation = () => {
  localStorage.setItem(
    `FORM_DATA_LOCATION_${store.nowTheme}`,
    formData.value.location
  );
};

const handleChangeContent = () => {
  const text = formData.value.content;
  if (
    text.includes("标题：") &&
    text.includes("日期：") &&
    text.includes("前言：")
  ) {
    const parsed = parseFullContent(text);
    store.formData5.title = parsed.title;
    store.formData5.location = parsed.location;
    store.formData5.preface = parsed.preface;
    store.formData5.content = parsed.content;
    persistAll();
    return;
  }
  persistContent();
};

const handleChangePreface = () => {
  localStorage.setItem(
    `FORM_DATA_PREFACE_${store.nowTheme}`,
    formData.value.preface
  );
};

function parseFullContent(text: string) {
  const titleMatch = text.match(/标题[：:]\s*([^\n]+)/);
  const dateMatch = text.match(/日期[：:]\s*([^\n]+)/);
  const moodMatch = text.match(/心情[：:]\s*([^\n]+)/);
  const prefaceMatch = text.match(
    /前言[：:]\s*([\s\S]+?)(?=\n\s*\/\s*\n|\n\n\s*\/\s*\n)/
  );
  const title = titleMatch ? titleMatch[1].trim() : "";
  const date = dateMatch ? dateMatch[1].trim() : "";
  const mood = moodMatch ? moodMatch[1].trim() : "";
  const preface = prefaceMatch
    ? prefaceMatch[1].trim().replace(/\n+$/, "")
    : "";
  const location = [date, mood].filter(Boolean).join(" ");
  const slashMatch = text.match(/\n\s*\/\s*\n/);
  let body = text;
  if (slashMatch && slashMatch.index != null) {
    body = text
      .slice(slashMatch.index)
      .replace(/^\s*\/\s*\n*/, "")
      .trim();
  }
  const parts = body
    .split(/\n\s*\/\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const content = parts.join("/\n");
  return { title, location, preface, content };
}

function persistAll() {
  localStorage.setItem(
    `FORM_DATA_TITLE_${store.nowTheme}`,
    formData.value.title
  );
  localStorage.setItem(
    `FORM_DATA_LOCATION_${store.nowTheme}`,
    formData.value.location
  );
  localStorage.setItem(
    `FORM_DATA_PREFACE_${store.nowTheme}`,
    formData.value.preface
  );
  localStorage.setItem(
    `FORM_DATA_CONTENT_${store.nowTheme}`,
    formData.value.content
  );
}

function persistContent() {
  localStorage.setItem(
    `FORM_DATA_CONTENT_${store.nowTheme}`,
    formData.value.content
  );
}

const handleClearContent = () => {
  store.formData5.content = "";
  persistContent();
};
</script>

<style lang="less" scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
  }
}

.page__form {
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  flex-shrink: 0;

  @media (min-width: 768px) {
    width: 320px;
    margin-bottom: 0;
    position: sticky;
    top: 24px;
  }
}

.page__form-inner {
  max-width: 100%;
}

.page__form-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--panel-border-strong);
}

.page__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page__footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--panel-border-strong);
  width: 100%;
  text-align: center;
}

.form-item {
  margin-bottom: 14px;
}

.form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;

  .form-label-row & {
    margin-bottom: 0;
  }
}

.form-input,
.form-textarea {
  width: 100%;
  max-width: 100%;
  padding: 10px 12px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  font-family: inherit;
  box-sizing: border-box;

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-item--action {
  margin-top: 4px;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .btn-xhs,
  .btn-douyin {
    @media (min-width: 768px) {
      display: none;
    }
  }
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 0.2s, opacity 0.2s;

  &.btn-primary {
    width: 100%;
    color: #fff;
    background: var(--accent);

    &:hover:not(:disabled) {
      background: var(--accent-hover);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &.btn-xhs {
    width: 100%;
    color: #fff;
    background: linear-gradient(135deg, #ff2442 0%, #ff6b6b 100%);

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &.btn-douyin {
    width: 100%;
    color: #fff;
    background: linear-gradient(135deg, #00c0e0 0%, #0077a0 100%);

    &:hover:not(:disabled) {
      opacity: 0.9;
      background: linear-gradient(135deg, #00b1d9 0%, #0088b3 100%);
    }
  }

  &.btn-text {
    padding: 4px 8px;
    font-size: 12px;
    color: var(--text-muted);
    background: transparent;

    &:hover {
      color: var(--text-secondary);
    }
  }
}

.share-toast {
  position: fixed;
  left: 50%;
  bottom: 100px;
  transform: translateX(-50%);
  max-width: 90%;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 14px;
  border-radius: 8px;
  z-index: 1000;
  text-align: center;
  animation: fade-in 0.2s ease;

  @media (min-width: 768px) {
    bottom: 24px;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.icp {
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: none;
}

.icp:hover {
  color: var(--text-secondary);
  text-decoration: underline;
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  animation: fade-in 0.2s ease;
}

.preview-modal__content {
  position: relative;
  width: 100%;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-modal__close {
  position: absolute;
  top: -40px;
  right: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.preview-swiper {
  width: 100%;
  height: 100%;
  max-height: 90vh;
}

.preview-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
  }
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: rgba(255, 255, 255, 0.8);

  &:hover {
    color: #fff;
  }
}

:deep(.swiper-pagination) {
  bottom: 10px;
}

:deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  background: var(--accent, #6366f1);
}
</style>
