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
    const state: State = {
      nowTheme: Theme.THEME_1,
      formData1: {
        title: "📝 Chat With My Friends",
        tagsOfRed:
          "#原创文字[话题]# #文字的力量[话题]# #记录吧就现在[话题]# #日记[话题]# #浪漫生活的记录者[话题]#",
        tagsOfDou: "#随记 #文字的力量 #日记 #生活 #感受",
        content: `首先要去尝试，等受挫时再想这种事也不迟，而到受挫时，你要想的不应该是自己没能力做好，而应该去想怎样才能做好。 你今后要注意的就是，在这种艰难时刻，要去依靠他人，有可以依靠的人，可是一大慰藉。`,
        footer: "",
        pic: "",
      },
      formData2: {
        title: "🍚 选择困难症｜随机选粮票决定吃什么",
        tagsOfRed:
          "#情绪[话题]# #文字[话题]# #文字的力量[话题]# #关注自我感受[话题]# #自我觉察和探索[话题]# #自我成长[话题]# # #生活[话题]# #成长[话题]#",
        tagsOfDou: "#随记 #觉察 #成长 #生活 #文字",
        content: `首先要去尝试，等受挫时再想这种事也不迟，而到受挫时，你要想的不应该是自己没能力做好，而应该去想怎样才能做好。 你今后要注意的就是，在这种艰难时刻，要去依靠他人，有可以依靠的人，可是一大慰藉。`,
        footer: "- 粮票号码 【1】-",
        pic: "",
      },
      formData3: {
        title: "🌍 选择困难症｜已接收本次打怪升级任务",
        tagsOfRed:
          "#情绪[话题]# #文字[话题]# #文字的力量[话题]# #关注自我感受[话题]# #自我觉察和探索[话题]# #自我成长[话题]# # #生活[话题]# #成长[话题]#",
        tagsOfDou: "#随记 #觉察 #成长 #生活 #文字",
        content: `首先要去尝试，等受挫时再想这种事也不迟，而到受挫时，你要想的不应该是自己没能力做好，而应该去想怎样才能做好。 你今后要注意的就是，在这种艰难时刻，要去依靠他人，有可以依靠的人，可是一大慰藉。`,
        footer: "- 觉察练习 第 001 问 -",
        pic: "",
      },
      formData4: {
        title: "📝 我的觉察日志",
        tagsOfRed:
          "#情绪[话题]# #文字[话题]# #文字的力量[话题]# #关注自我感受[话题]# #自我觉察和探索[话题]# #自我成长[话题]# # #生活[话题]# #成长[话题]#",
        tagsOfDou: "#随记 #觉察 #成长 #生活 #文字",
        content: `首先要去尝试，等受挫时再想这种事也不迟，而到受挫时，你要想的不应该是自己没能力做好，而应该去想怎样才能做好。 你今后要注意的就是，在这种艰难时刻，要去依靠他人，有可以依靠的人，可是一大慰藉。`,
        footer: "",
        pic: "",
      },
    };
    return state;
  },
});
