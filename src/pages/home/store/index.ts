import { defineStore, createPinia } from "pinia";

const useStore = defineStore("store", {
  state: () => ({
    formData: {
      title: localStorage.getItem(`FORM_DATA_TITLE`) || "未命名",
      date: localStorage.getItem(`FORM_DATA_DATE`) || "2026.01.24 周六 ☀️",
      keyValue: localStorage.getItem(`FORM_DATA_KEY_VALUE`) || "",
      content:
        localStorage.getItem(`FORM_DATA_CONTENT`) ||
        `#吾日三省吾身/本周
标题：周二杂记
日期：2026.03.31
心情：🙂
关键词：关键词一
/
内容片段 一

内容片段 二
/
内容片段 三

内容片段四
/
今日觉察的意义感瞬间是：无`,
    },
  }),
});

export { useStore };
