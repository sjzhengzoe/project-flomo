import { defineStore } from "pinia";

const useStore = defineStore("store", {
  state: () => ({
    formData: {
      title: localStorage.getItem(`FORM_DATA_TITLE`) || "未命名",
      date: localStorage.getItem(`FORM_DATA_DATE`) || "2026.01.24 周六 ☀️",
      keyValue: localStorage.getItem(`FORM_DATA_KEY_VALUE`) || "关键词",
      content:
        localStorage.getItem(`FORM_DATA_CONTENT`) ||
        `内容片段 一

内容片段 二
/
内容片段 三

内容片段四`,
    },
  }),
});

export { useStore };
