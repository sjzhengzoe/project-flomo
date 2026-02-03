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
            <label class="form-label">内容</label>
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
          </div>
        </form>
      </div>
    </aside>

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

const handleToDownload = async () => {
  const name = "pic_";
  let index = 0;
  while (document.getElementById(`${name}${index}`)) {
    const node = document.getElementById(`${name}${index}`);
    if (!node) break;
    downloadLoading.value = true;
    const blob = await domtoimage.toBlob(node, {
      width: 9000,
      height: 12000,
    });
    downloadBlob(blob, `${name}${index + 1}.png`);
    downloadLoading.value = false;
    index++;
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

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;
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
