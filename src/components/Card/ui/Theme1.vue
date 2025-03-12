<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content
        .replace(/\n{3,}/g, '\n\n\n')
        .split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box flex f-x-c f-y-c">
        <div class="main flex-y f-x-c f-y-c">
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

          <div class="decorate2">JOURNAL</div>

          <div class="decorate3"></div>
          <div class="decorate4"></div>
          <div class="decorate5">------------------------</div>

          <div class="decorate6">
            Do not go gentle into that good night
            <br />
            ———————————————————————————————————————————
            <br />
            Now this is my world.
          </div>
          <div class="content_box flex-y f-x-c">
            <div
              v-for="text in item.split('\n')"
              :key="idx"
              :class="['content']"
            >
              {{ text }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

const store = useStore();
const formData = computed(() => store.formData1);
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
    background: url("@/assets/background/theme_bg2.jpg");
    position: relative;
    overflow: hidden;
    .main {
      width: 1200px;
      height: 1700px;
      background: url("@/assets/background/theme_bg9.jpg");
      position: relative;
      border-radius: 70px;
      box-sizing: border-box;
      color: #2b2b2b;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      .decorate1 {
        left: 0;
        right: 0;
        margin: 0 auto;
        border-radius: 60px;
        width: 1080px;
        height: 650px;
        overflow: hidden;
        line-height: 60px;
        position: absolute;
        top: 60px;
        background: url("@/assets/images/theme_pic1.jpg") center no-repeat;
      }
      .decorate2 {
        color: #fff;
        font-size: 220px;
        font-weight: 900;
        right: 0;
        padding: 0 50px 22px 120px;
        line-height: 220px;
        position: absolute;
        top: 510px;
        font-family: "font_1";
      }

      .decorate3,
      .decorate4 {
        width: 50px;
        height: 100px;
        background-color: #000;
        position: absolute;
        top: 720px;
      }
      .decorate3 {
        border-radius: 0 50px 50px 0;
        left: -1px;
      }
      .decorate4 {
        border-radius: 50px 0 0 50px;
        right: -1px;
      }
      .decorate5 {
        font-size: 60px;
        position: absolute;
        width: 1000px;
        color: #000;
        top: 740px;
      }

      .decorate6 {
        font-size: 30px;
        left: 0;
        right: 0;
        line-height: 36px;
        position: absolute;
        bottom: 40px;
        text-align: center;
        font-family: "en_6";
      }

      .content_box {
        width: 1000px;
        height: 650px;
        position: absolute;
        top: 845px;
      }
      .content {
        text-align: justify;
        font-size: 50px;
        line-height: 100px;
      }
    }
  }
}
</style>
