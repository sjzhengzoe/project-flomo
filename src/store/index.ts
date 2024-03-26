import { defineStore, createPinia } from "pinia";
import { FormData, TypeOptions } from "../types.d";

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
