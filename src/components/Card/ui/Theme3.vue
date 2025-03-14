<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content
        .replace(/\n{3,}/g, '\n\n\n')
        .split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box flex f-x-c f-y-c">
        <div class="main">
          <div
            class="decorate1"
            :style="
              formData.pic
                ? {
                    backgroundImage: `url(${formData.pic})`,
                  }
                : {}
            "
          ></div>

          <div class="decorate2 font_7">🎬 《哪吒之魔童闹海》</div>
          <div class="decorate3"></div>
          <div class="decorate4"></div>
          <div class="decorate5 flex f-x-c">………………………………</div>

          <div class="decorate6 flex f-x-c">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
          </div>
          <div class="decorate7 flex f-x-c">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
          </div>

          <div class="content_box flex-y f-x-c font_7">
            <div
              v-for="text in item.split('\n')"
              :key="idx"
              :class="['content']"
            >
              <div v-html="text"></div>
            </div>
          </div>
          <div class="decorate5 flex f-x-c">………………………………</div>
          <div class="decorate2 font_7"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

const store = useStore();
const formData = computed(() => store.formData3);
</script>

<style lang="less" scoped>
.theme_box {
  width: 1850px;
  flex-wrap: wrap;
  overflow: hidden;
  transform: scale(0.19);
  transform-origin: 0px 0px;
  .pic_box {
    width: 1440px;
    height: 1920px;
    background: #000;
    position: relative;
    overflow: hidden;
    .main {
      width: 850px;
      height: 1680px;
      overflow: hidden;
      background: url("@/assets/background/theme_bg3.jpg");
      background-color: #000;
      position: relative;
      border-radius: 8px;
      box-sizing: border-box;
      color: #2b2b2b;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      .decorate1 {
        margin: 70px auto 0;
        border-radius: 8px;
        width: 720px;
        height: 960px;
        background: url("@/assets/images/theme_pic1.jpg") center/cover no-repeat;
      }
      .decorate2 {
        width: 720px;
        color: #000;
        font-size: 60px;
        font-weight: 900;
        line-height: 70px;
        margin: 50px 60px 0;
        // position: absolute;
        // top: 1050px;
      }
      .decorate3,
      .decorate4 {
        width: 40px;
        height: 80px;
        background-color: #000;
        position: absolute;
        top: 1140px;
      }
      .decorate3 {
        border-radius: 0 40px 40px 0;
        left: -1px;
      }
      .decorate4 {
        border-radius: 40px 0 0 40px;
        right: -1px;
      }
      .decorate5 {
        font-size: 60px;
        // position: absolute;
        width: 750px;
        color: #000;
        margin: 20px 50px;
        // text-align: center;
        // left: -5px;
        // top: 1250px;
        text-align: center;
      }
      .decorate6 {
        position: absolute;
        top: -40px;
        left: -50px;
        .item {
          width: 80px;
          height: 80px;
          box-sizing: border-box;
          background: #000;
          border-radius: 50%;
          margin: 0 20px;
        }
      }
      .decorate7 {
        position: absolute;
        bottom: -40px;
        left: -50px;
        .item {
          width: 80px;
          height: 80px;
          box-sizing: border-box;
          background: #000;
          border-radius: 50%;
          margin: 0 20px;
        }
      }

      .content_box {
        width: 850px;
        height: 300px;
        color: #000;
      }
      .content {
        // text-align: center;
        font-size: 50px;
        margin: 0 60px;
        line-height: 70px;
      }
    }
  }
}
</style>
