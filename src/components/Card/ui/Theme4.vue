<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content.split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div class="decorate1 flex f-sb">
          <div>"</div>
          <div class="text">Episode - 0{{ idx + 1 }}</div>
          <div>"</div>
        </div>
        <div
          class="decorate3"
          :style="
            formData.pic
              ? {
                  backgroundImage: `url(${formData.pic})`,
                }
              : {}
          "
        ></div>
        <!-- <div class="tags flex f-y-c">
          <div class="tag">#不要温和地走入那个良夜</div>
          <div class="tag">#人生课题</div>
        </div> -->

        <div
          v-for="(text, idx2) in item.split('\n')"
          :key="idx2"
          :class="['content']"
        >
          <div v-if="text" v-html="text"></div>
        </div>
        <!-- <div class="decorate2 flex f-x-c">@傲慢的人类</div> -->
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

const store = useStore();
const formData = computed(() => store.formData4);
const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");

const formattedDate = `${year}/${month}/${day}`;
</script>

<style lang="less">
b {
  font-size: 14px !important;
  line-height: 16px !important;
  font-family: "font_8_4" !important;
  color: #222222 !important;
  display: flex !important;
  margin: 10px 0 20px 0;
}
</style>

<style lang="less" scoped>
.theme_box {
  width: 1850px;
  flex-wrap: wrap;
  overflow: hidden;
  transform: scale(0.19);
  transform-origin: 0px 0px;
  .pic_box {
    color: #252525;
    box-sizing: border-box;
    width: 1440px;
    height: 1920px;
    justify-content: center;
    overflow: hidden;
    position: relative;
    background: url("@/assets/background/theme_bg18.jpg") top/cover no-repeat;
    .decorate1 {
      width: 1440px;
      height: 235px;
      font-size: 220px;
      padding: 96px 40px 0;
      margin: -30px 0 96px 0px;
      color: #4a4a4a;
      box-sizing: border-box;
      .text {
        font-size: 50px;
        padding-top: 20px;
        font-weight: 900;
        font-family: "font_8_5";
      }
    }
    .content {
      width: 900px;
      text-align: justify;
      font-size: 56px;
      line-height: 1.8em;
      font-family: "font_8_1";
      margin: 54px 80px 0px;
    }
    .decorate3 {
      margin: -40px 0px 210px 360px;
      width: 1000px;
      border-radius: 10px;
      height: 550px;
      overflow: hidden;
      line-height: 60px;
      background: url("@/assets/images/theme_pic1.jpg") center/cover no-repeat;
    }
  }
}
</style>
