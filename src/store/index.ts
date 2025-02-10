import { defineStore, createPinia } from "pinia";
import { FormData, Theme } from "@/utils/const";

export default createPinia();

interface State {
  nowTheme: Theme;
  formData1: FormData;
  formData2: FormData;
  formData3: FormData;
}
export const useStore = defineStore("store", {
  state: () => {
    const state: State = {
      nowTheme: Theme.THEME_1,
      formData1: {
        title: "🧩 生活碎片收集中...",
        tagsOfRed:
          "#情绪[话题]# #文字[话题]# #文字的力量[话题]# #关注自我感受[话题]# #自我觉察和探索[话题]# #自我成长[话题]# # #生活[话题]# #成长[话题]#",
        tagsOfDou: "#随记 #觉察 #成长 #生活 #文字",
        content: `今天有什么令你感动的事情发生吗？\n\n内容 1\n\n内容 2`,
        footer: "- 觉察练习 第 001 问 -",
      },
      formData2: {
        title: "🍚 选择困难症｜随机选粮票决定吃什么",
        tagsOfRed:
          "#情绪[话题]# #文字[话题]# #文字的力量[话题]# #关注自我感受[话题]# #自我觉察和探索[话题]# #自我成长[话题]# # #生活[话题]# #成长[话题]#",
        tagsOfDou: "#随记 #觉察 #成长 #生活 #文字",
        content: `福鼎肉片\n菜系：闽菜（福鼎小吃）\n口味：酸辣辛鲜\n备注：现捶肉糜锁住纤维感，配虾米/紫菜/黄椒水增香，汤底酸度可随白醋碟自由调配。\n\n\n介绍：福鼎肉片是闽东标志性街头小吃，以猪后腿肉捶糜拌薯粉，沸水汆煮后Q弹似云朵，浸入酸辣姜汤鲜香四溢。\n\n\n\n\n历史：源自明朝福鼎沙埕港，渔民为保鲜创制便携肉糜食法，经数百年演变为捶打工艺，现列入非遗小吃名录。`,
        footer: "- 粮票号码 【1】-",
      },
      formData3: {
        title: "🌍 选择困难症｜已接收本次打怪升级任务",
        tagsOfRed:
          "#情绪[话题]# #文字[话题]# #文字的力量[话题]# #关注自我感受[话题]# #自我觉察和探索[话题]# #自我成长[话题]# # #生活[话题]# #成长[话题]#",
        tagsOfDou: "#随记 #觉察 #成长 #生活 #文字",
        content: `测试标题\n\n测试内容 1\n\n测试内容 2`,
        footer: "- 觉察练习 第 001 问 -",
      },
    };
    return state;
  },
});
