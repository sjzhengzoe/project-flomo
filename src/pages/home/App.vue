<template>
  <div class="page">
    <Header />
    <main class="page__main">
      <Card />
    </main>

    <div class="floating-actions">
      <button
        type="button"
        class="action-btn"
        @click="handlePasteContent"
        title="粘贴文案"
      >
        <Clipboard class="action-btn__icon" :size="22" />
      </button>
      <button
        type="button"
        class="action-btn"
        @click="openEditModal"
        title="编辑文案"
      >
        <Pencil class="action-btn__icon" :size="22" />
      </button>
      <button
        type="button"
        class="action-btn"
        @click="handleToDownload"
        :disabled="isDownloading"
        title="下载图片"
      >
        <Download class="action-btn__icon" :size="22" />
      </button>
    </div>

    <div v-if="showEditModal" class="edit-modal" @click="closeEditModal">
      <div class="edit-modal__content" @click.stop>
        <div class="edit-modal__header">
          <h3 class="edit-modal__title">编辑文案</h3>
          <button class="edit-modal__close" @click="closeEditModal">×</button>
        </div>
        <form class="edit-form" @submit.prevent>
          <div class="form-item">
            <label class="form-label">标题</label>
            <input
              class="form-input"
              type="text"
              v-model="editFormData.title"
            />
          </div>
          <div class="form-item">
            <label class="form-label">日期</label>
            <input class="form-input" type="text" v-model="editFormData.date" />
          </div>
          <div class="form-item">
            <label class="form-label">关键词</label>
            <input
              class="form-input"
              type="text"
              v-model="editFormData.keyValue"
            />
          </div>
          <div class="form-item">
            <div class="form-label-row">
              <label class="form-label">内容</label>
              <button
                type="button"
                class="btn btn-text"
                @click="editFormData.content = ''"
              >
                清空
              </button>
            </div>
            <textarea
              class="form-textarea"
              v-model="editFormData.content"
              rows="6"
            />
          </div>
          <div class="form-item form-item--action">
            <button
              type="button"
              class="btn btn-primary"
              @click="handleSaveEdit"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from "vue";
import { useStore } from "./store";
import { useCommonStore } from "@/store/commonStore";
import Header from "@/components/Header.vue";
import Card from "./components/Card.vue";
import { Clipboard, Pencil, Download } from "lucide-vue-next";
import {
  convertBackgroundImagesToBase64,
  replaceSVGCSSVariables,
} from "@/utils/dataToImages";
import domtoimage from "dom-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const store = useStore();
const loadingStore = useCommonStore();
const formData = computed(() => store.formData);
const showEditModal = ref(false);
const isDownloading = ref(false);

const editFormData = reactive({
  title: "",
  date: "",
  keyValue: "",
  content: "",
});

const openEditModal = () => {
  Object.assign(editFormData, formData.value);
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const handleSaveEdit = () => {
  Object.assign(store.formData, editFormData);
  persistAll();
  closeEditModal();
};

const handlePasteContent = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return;

    if (
      (text.includes("标题：") || text.includes("本周标题：")) &&
      text.includes("日期：")
    ) {
      const parsed = parseFullContent(text);
      Object.assign(store.formData, parsed);
    } else {
      store.formData.content = text.trim();
    }
    persistAll();
  } catch (err) {
    console.error("读取剪贴板失败:", err);
  }
};

const handleToDownload = async () => {
  if (isDownloading.value) return;
  isDownloading.value = true;
  const zip = new JSZip();
  let index = 0;

  loadingStore.showLoading();

  try {
    await document.fonts.ready;
    while (true) {
      const node = document.getElementById(`pic_${index}`);
      if (!node) break;

      const blob = await generateImage(node);
      const now = new Date();
      const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      );
      zip.file(`flomo_${String(index + 1).padStart(2, "0")}.png`, blob, {
        date: localDate,
      });
      index++;
    }

    if (index > 0) {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const date = formData.value.date
        .replace(/[^\d]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      saveAs(zipBlob, `flomo_${date}.zip`);
    }
  } catch (err) {
    console.error("下载失败:", err);
  } finally {
    loadingStore.hideLoading();
    isDownloading.value = false;
  }
};

async function generateImage(node: HTMLElement): Promise<Blob> {
  const scale = 10;
  const width = node.offsetWidth * scale;
  const height = node.offsetHeight * scale;

  let containerNode = node.parentElement;
  while (containerNode && !containerNode.classList.contains("theme_box")) {
    containerNode = containerNode.parentElement;
  }
  if (!containerNode) containerNode = node;

  const parent = containerNode.parentElement;
  const nextSibling = containerNode.nextSibling;

  await convertBackgroundImagesToBase64(containerNode as HTMLElement);

  const container = document.createElement("div");
  container.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;overflow:hidden;background:transparent;z-index:999;`;
  container.appendChild(containerNode);
  document.body.appendChild(container);

  const el = containerNode as HTMLElement;
  el.style.transform = `scale(${scale})`;
  el.style.transformOrigin = "top left";
  el.style.width = `${node.offsetWidth}px`;
  el.style.height = `${node.offsetHeight}px`;

  try {
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    await convertBackgroundImagesToBase64(container);
    replaceSVGCSSVariables(container);
    await new Promise((r) => setTimeout(r, 300));

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(container, {
          width,
          height,
          useCORS: true,
          scale: 1,
          logging: false,
        });
        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob: Blob | null) =>
              blob ? resolve(blob) : reject(new Error("无法生成 blob")),
            "image/png",
          );
        });
      } catch {
        return domtoimage.toBlob(container, {
          width,
          height,
          useCORS: true,
          cacheBust: false,
          filter: () => true,
        });
      }
    }
    return domtoimage.toBlob(container, {
      width,
      height,
      useCORS: true,
      cacheBust: false,
      filter: () => true,
    });
  } finally {
    container.removeChild(containerNode);
    if (nextSibling) {
      parent?.insertBefore(containerNode, nextSibling);
    } else {
      parent?.appendChild(containerNode);
    }
    document.body.removeChild(container);
    el.style.transform = "";
    el.style.transformOrigin = "";
    el.style.width = "";
    el.style.height = "";
  }
}

function parseFullContent(text: string) {
  const normalizedText = text
    .replace(/^#吾日三省吾身\s*\/\s*/, "")
    .replace(/本周标题(?=[：:])/g, "标题");
  const headerMatch = normalizedText.match(
    /标题[：:]\s*([\s\S]*?)日期[：:]\s*([\s\S]*?)关键词[：:]\s*([\s\S]*?)\s*\//i,
  );
  const title = headerMatch?.[1]?.trim() || "";
  const dateStr = headerMatch?.[2]?.trim() || "";
  const keyValue = headerMatch?.[3]?.trim() || "";

  // 找到第一个单独出现的 / 作为分隔符（/ 在行首或前面只有空白）
  const match = normalizedText.match(/\n\s*\/\s*\n/);
  const slashIdx = match ? match.index! + match[0].indexOf("/") : -1;
  let body =
    slashIdx >= 0 ? normalizedText.slice(slashIdx + 1).trim() : normalizedText;

  if (slashIdx < 0 && headerMatch?.index != null) {
    body = normalizedText
      .slice(headerMatch.index + headerMatch[0].length)
      .trim();
  }

  // 按 / 分段处理
  const content = body
    .split(slashIdx >= 0 ? /\n\s*\/\s*\n/ : /\s*\/\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join("/\n");

  return {
    title,
    date: dateStr,
    keyValue,
    content,
  };
}

function persistAll() {
  const keys = [
    "FORM_DATA_TITLE",
    "FORM_DATA_DATE",
    "FORM_DATA_KEY_VALUE",
    "FORM_DATA_CONTENT",
  ];
  keys.forEach((key) => {
    const k = key.replace("FORM_DATA_", "").toLowerCase();
    localStorage.setItem(key, (formData.value as any)[k]);
  });
}
</script>

<style lang="less" scoped>
.page {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 60px 16px 84px;
  padding-bottom: calc(84px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  overflow: hidden;
}

.page__main {
  flex: 1;
  margin-top: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.floating-actions {
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 100;
  padding: 8px;
  background: rgba(17, 19, 31, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 40px;
  border: 1px solid var(--panel-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.action-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
    background: rgba(99, 102, 241, 0.15);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:active {
      transform: none;
      background: transparent;
    }
  }

  &__icon {
    color: var(--text-primary);
    line-height: 1;
  }
}

.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #050508;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fade-in 0.2s ease;
}

.edit-modal__content {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  background: #11131f;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  animation: slide-up 0.3s ease;
}

.edit-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.edit-modal__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.edit-modal__close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--input-bg);
  color: var(--text-secondary);
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--input-border);
    color: var(--text-primary);
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
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
}
.form-label-row .form-label {
  margin-bottom: 0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-primary);
  font-family: inherit;
  box-sizing: border-box;

  &::placeholder {
    color: var(--text-muted);
  }
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-item--action {
  margin-top: 8px;
  margin-bottom: 0;
  .btn-primary {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    font-weight: 600;
  }
}

.btn {
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  &.btn-primary {
    color: #fff;
    background: var(--accent);
    &:hover {
      background: var(--accent-hover);
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

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
