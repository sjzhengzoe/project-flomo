<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content.split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div class="decorate1 flex f-sb">
          <div>"</div>
          <div class="text">Episode {{ formattedDate }}</div>
          <div>"</div>
        </div>
        <div class="tags flex f-y-c">
          <div class="tag">#不要温和地走入那个良夜</div>
          <div class="tag">#人生课题</div>
        </div>
        <div class="title">{{ formData.title }}</div>
        <div
          v-for="(text, idx2) in item.split('\n')"
          :key="idx2"
          :class="['content']"
        >
          <div v-if="text" v-html="text"></div>
          <div style="line-height: 70px" v-else>&nbsp;</div>
        </div>
        <div class="decorate2 flex f-x-c">@傲慢的人类</div>
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

<style lang="less" scoped>
.theme_box {
  width: 1850px;
  flex-wrap: wrap;
  overflow: hidden;
  transform: scale(0.19);
  transform-origin: 0px 0px;
  .pic_box {
    color: #000;
    box-sizing: border-box;
    width: 1440px;
    height: 1920px;
    padding: 0 80px;
    justify-content: center;
    position: relative;
    background: url("@/assets/background/theme_bg17.jpg") top/cover no-repeat;

    .decorate1 {
      width: 1326px;
      height: 285px;
      font-size: 220px;
      padding: 96px 0px 0;
      margin-left: -30px;
      box-sizing: border-box;
      .text {
        font-size: 44px;
        padding-top: 20px;
        font-weight: 900;
        font-family: "en_4";
      }
    }
    .tags {
      font-size: 46px;
      font-family: "font_3";
      margin: 0px 0px 97px;
      .tag {
        color: #fffffff2;
        background: #1b1b1b;
        margin-right: 15px;
        line-height: 60px;
        padding: 14px 20px 10px;
        border-radius: 10px;
      }
    }
    .title {
      font-size: 62px;
      line-height: 96px;
      text-decoration: underline;
      font-family: "font_6";
      margin-bottom: 60px;
      text-underline-offset: 14px;
    }
    .content {
      text-align: justify;
      font-size: 55px;
      line-height: 96px;
      font-family: "font_6";
    }
    .decorate2 {
      font-size: 44px;
      position: absolute;
      bottom: 97px;
      left: 0;
      right: 0;
      font-family: "font_3";
    }
  }
}
</style>
