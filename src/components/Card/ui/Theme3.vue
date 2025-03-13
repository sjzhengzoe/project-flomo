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

          <div class="decorate2 font_6">🎬 《哪吒之魔童闹海》</div>

          <div class="decorate3"></div>
          <div class="decorate4"></div>
          <div class="decorate5">--------------------------</div>

          <div class="content_box flex-y f-x-c">
            <div
              v-for="text in item.split('\n')"
              :key="idx"
              :class="['content']"
            >
              <div v-html="text"></div>
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
    background: url("@/assets/background/theme_bg2.jpg") center/cover no-repeat;
    position: relative;
    overflow: hidden;
    .main {
      width: 1200px;
      height: 1800px;
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
        border-radius: 60px 60px 0 0;
        width: 1200px;
        height: 1200px;
        overflow: hidden;
        line-height: 60px;
        position: absolute;
        top: 0px;
        background: url("@/assets/images/theme_pic1.jpg") center/cover no-repeat;
      }
      .decorate2 {
        color: #2b2b2b;
        font-size: 60px;
        font-weight: 900;
        left: 0;
        right: 0;
        text-align: center;
        padding: 0 50px;
        line-height: 136px;
        position: absolute;
        top: 1200px;
      }

      .decorate3,
      .decorate4 {
        width: 40px;
        height: 80px;
        background-color: #000;
        position: absolute;
        top: 1300px;
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
        position: absolute;
        width: 1300px;
        color: #000;
        top: 1310px;
        text-align: center;
      }

      .content_box {
        width: 1050px;
        height: 455px;
        position: absolute;
        top: 1340px;
      }
      .content {
        text-align: center;
        font-size: 50px;
        line-height: 100px;
      }
    }
  }
}
</style>
