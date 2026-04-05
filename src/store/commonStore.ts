import { defineStore } from "pinia";

const useCommonStore = defineStore("common", {
  state: () => ({
    loading: {
      visible: false,
      text: "",
    },
  }),
  actions: {
    showLoading(text = "") {
      this.loading.visible = true;
      this.loading.text = text;
    },
    hideLoading() {
      this.loading.visible = false;
      this.loading.text = "";
    },
  },
});

export { useCommonStore };
