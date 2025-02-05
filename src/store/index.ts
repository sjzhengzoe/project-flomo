import { defineStore, createPinia } from "pinia";
import { FormData, Theme } from "@/utils/types";

export default createPinia();

interface State {
  formData: FormData;
}
export const useStore = defineStore("store", {
  state: () => {
    const state: State = {
      formData: {
        title: "🍃 被 AI 的答案温暖到的瞬间",
        tagsOfRed:
          "#自我觉察力[话题]# #有觉知的生活[话题]# #提升觉察力[话题]# #关注自我感受[话题]# #自我觉察和探索[话题]# #自我成长[话题]# # #生活[话题]# #成长[话题]#",
        tagsOfDou: "#随记 #觉察 #成长 #生活 #文字",
        content: "",
        theme: Theme.THEME_1,
        footer: "- 觉察练习 第 001 问 -",
      },
    };
    return state;
  },
});
