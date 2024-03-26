import { defineStore, createPinia } from "pinia";
import { FormData, TypeOptions } from "@/utils/types";

export default createPinia();

interface State {
  formData: FormData;
}
export const useStore = defineStore("store", {
  state: () => {
    const state: State = {
      formData: {
        title: "Human Growth Diary",
        text: ["", "", "", "", "", "", ""],
        type: TypeOptions.TEXT,
      },
    };
    return state;
  },
});
