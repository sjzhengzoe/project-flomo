import { defineStore, createPinia } from "pinia";
import { Theme } from "@/utils/const";

export default createPinia();

export const useStore = defineStore("store", {
  state: () => ({
    nowTheme: Theme.THEME_5,
    formData5: {
      title:
        localStorage.getItem(`FORM_DATA_TITLE_${Theme.THEME_5}`) || "意义感",
      location:
        localStorage.getItem(`FORM_DATA_LOCATION_${Theme.THEME_5}`) ||
        "2026.01.24 周六 ☀️",
      preface: localStorage.getItem(`FORM_DATA_PREFACE_${Theme.THEME_5}`) || "",
      content:
        localStorage.getItem(`FORM_DATA_CONTENT_${Theme.THEME_5}`) ||
        `#匿名留言板

2026.01.24 周六 ☀️

- 01
恋与深空两周年 一直在看网友们的分享 这次还有一个朋友一起分享 感觉这段时间就非常欢乐

有喜欢的东西 可以分享喜欢 可以共鸣 真是一件非常值得高兴的事情


- 02
短视频总看见一些 通过 AI 如何快速写爆文 可能大家发文的目的不同 但通过 AI 批量生产一些自己都不看的文章 会觉得很没有意思

感觉自己是那种需要意义感才能去做某件事的人


- 03
朋友住新房 还要帮妹妹带两个小孩 吃午饭的时候 注意力基本都在小孩子身上 明年朋友会把自己的小孩也带在身边 感觉未来就不再会去朋友家拜访

不是不想结婚的人物以类聚 是结了婚的人你会与对方渐行渐远`,
      pic: "",
    },
  }),
});
