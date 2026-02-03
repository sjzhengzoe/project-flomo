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
              {{ downloadLoading ? "下载中..." : "下载图片" }}
            </button>
            <button
              type="button"
              class="btn btn-xhs"
              :disabled="shareLoading"
              @click="handleShareToXiaohongshu"
            >
              {{ shareLoading ? "准备中..." : "分享到小红书" }}
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "@/store";
import Card from "@/components/Card/index.vue";
import { downloadBlob } from "@/utils";
import domtoimage from "dom-to-image";

const store = useStore();
const formData = computed(() => store.formData5);
const downloadLoading = ref(false);
const shareLoading = ref(false);
const shareToast = ref("");

const XHS_SCHEME = "xhsdiscover://post_note/";

const handleToDownload = async () => {
  const name = "pic_";
  let index = 0;
  while (document.getElementById(`${name}${index}`)) {
    const node = document.getElementById(`${name}${index}`);
    if (!node) break;
    downloadLoading.value = true;

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
      await new Promise((resolve) => setTimeout(resolve, 200)); // 等待资源加载

      const blob = await domtoimage.toBlob(container, {
        width: width,
        height: height,
      });
      downloadBlob(blob, `${name}${index + 1}.png`);
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

    downloadLoading.value = false;
    index++;
  }
};

const handleShareToXiaohongshu = async () => {
  const node = document.getElementById("pic_0");
  if (!node) {
    shareToast.value = "暂无可分享的图片";
    setTimeout(() => (shareToast.value = ""), 2000);
    return;
  }
  shareLoading.value = true;
  shareToast.value = "";
  try {
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

    // 等待渲染完成
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 200)); // 等待资源加载

    const blob = await domtoimage.toBlob(container, {
      width: width,
      height: height,
    });

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
    let copied = false;
    if (navigator.clipboard?.write && window.isSecureContext) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        copied = true;
      } catch {
        copied = false;
      }
    }
    if (copied) {
      shareToast.value = "图片已复制，请在小红书发布页长按粘贴";
    } else {
      downloadBlob(blob, "pic_1.png");
      shareToast.value = "图片已保存，请打开小红书从相册选择刚保存的图片";
    }
    setTimeout(() => (shareToast.value = ""), 4000);
    window.location.href = XHS_SCHEME;
  } catch (e) {
    shareToast.value = "生成图片失败，请重试";
    setTimeout(() => (shareToast.value = ""), 2000);
  } finally {
    shareLoading.value = false;
  }
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

  .btn-xhs {
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
</style>
