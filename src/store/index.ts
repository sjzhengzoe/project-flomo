import { defineStore, createPinia } from "pinia";
import { FormData, Theme } from "@/utils/const";

export default createPinia();

interface State {
  nowTheme: Theme;
  formData1: FormData;
  formData2: FormData;
  formData3: FormData;
  formData4: FormData;
}
export const useStore = defineStore("store", {
  state: () => {
    const themeHistory = localStorage.getItem(`FORM_DATA_THEME`);
    let nowTheme = Theme.THEME_1;
    switch (themeHistory) {
      case Theme.THEME_1:
        nowTheme = Theme.THEME_1;
        break;
      case Theme.THEME_2:
        nowTheme = Theme.THEME_2;
        break;
      case Theme.THEME_3:
        nowTheme = Theme.THEME_3;
        break;
      case Theme.THEME_4:
        nowTheme = Theme.THEME_4;
        break;
    }
    const state: State = {
      nowTheme: nowTheme,
      formData1: {
        title:
          localStorage.getItem(`FORM_DATA_TITLE_${Theme.THEME_1}`) || "小诗",
        location: "In GuangZhou, China",
        content:
          localStorage.getItem(`FORM_DATA_CONTENT_${Theme.THEME_1}`) ||
          `-01
太阳快要下山了 
我的周末快要结束了 
我的无聊也快要结束
写完这一段文字 
我可能会躺在床上 缩成一团 看着投影的内容 发发呆
周末 再见 
下次见你 
我会不会就知道自己要做什么了呢`,
        footer:
          localStorage.getItem(`FORM_DATA_FOOTER_${Theme.THEME_1}`) ||
          "文 / 顾飞飞",
        pic: "",
      },
      formData2: {
        title:
          localStorage.getItem(`FORM_DATA_TITLE_${Theme.THEME_2}`) || "总结",
        location: "In GuangZhou, China",
        content:
          localStorage.getItem(`FORM_DATA_CONTENT_${Theme.THEME_2}`) ||
          `-地铁人很多时候，先把无线耳机摘下来握在手里再下车。

因为有一次下车的时候不知道被什么撞了一下，然后我的耳机就掉了，不知道是掉在车厢内、还是车厢外、或是别人的背包里。

损失 ¥500。`,
        footer:
          localStorage.getItem(`FORM_DATA_FOOTER_${Theme.THEME_2}`) ||
          "文 / 顾飞飞",
        pic: "",
      },
      formData3: {
        title:
          localStorage.getItem(`FORM_DATA_TITLE_${Theme.THEME_3}`) || "顾飞飞",
        location: "In GuangZhou, China",
        content:
          localStorage.getItem(`FORM_DATA_CONTENT_${Theme.THEME_3}`) ||
          `首先要去尝试，等受挫时再想这种事也不迟，而到受挫时，你要想的不应该是自己没能力做好，而应该去想怎样才能做好。 你今后要注意的就是，在这种艰难时刻，要去依靠他人，有可以依靠的人，可是一大慰藉。`,
        footer:
          localStorage.getItem(`FORM_DATA_FOOTER_${Theme.THEME_3}`) ||
          "文 / 顾飞飞",
        pic: "",
      },
      formData4: {
        title:
          localStorage.getItem(`FORM_DATA_TITLE_${Theme.THEME_4}`) || "打怪",
        location: "In GuangZhou, China",
        content:
          localStorage.getItem(`FORM_DATA_CONTENT_${Theme.THEME_4}`) ||
          `首先要去尝试，等受挫时再想这种事也不迟，而到受挫时，你要想的不应该是自己没能力做好，而应该去想怎样才能做好。 你今后要注意的就是，在这种艰难时刻，要去依靠他人，有可以依靠的人，可是一大慰藉。`,
        footer:
          localStorage.getItem(`FORM_DATA_FOOTER_${Theme.THEME_4}`) ||
          "文 / 顾飞飞",
        pic: "",
      },
    };
    return state;
  },
});
