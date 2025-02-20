<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content
        .replace(/\n{3,}/g, '\n\n\n')
        .split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div class="">
          <img
            class="decorate1 flex"
            src="@/assets/images/theme_pic1.jpg"
            alt=""
          />
        </div>
        <!-- <div class="decorate1">
          Do not go gentle into that good night
          <br />
          ———————————————————————————
          ----------------------------------
          <br />
          NEW STORY
          Rage, rage against the dying of the light.
        </div> -->
        <!-- <div class="decorate1">
          Do not go gentle into that good night, Old age should burn and rave at close of day; Rage, rage against the dying of the light.
        </br>
        </div> -->

        <!-- <div class="decorate4">HUMAN GROWTH DAILY | 人类成长日志</div> -->
        <div class="decorate2">JOURNAL</div>
        <div class="decorate3">
          Do not go gentle into that good night
          <br />
          ———————————————————————————————————————————
          <!-- ---------------------------------- -->
          <br />
          <!-- Rage, rage against the dying of the light. -->
          <!-- NEW STORY -->
          <!-- now is my world -->
          Now this is my world.
          <!-- Now, this world belongs to me. -->
        </div>
        <div v-for="text in item.split('\n')" :key="idx" :class="['desc']">
          {{ text }}
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
    // color: #494949;
    color: #1d1d1f;
    box-sizing: border-box;
    width: 1440px;
    height: 1920px;
    margin: 0 20px 20px 0;
    justify-content: center;
    border-radius: 5%;
    overflow: hidden;
    position: relative;
    background-color: #efefef;
    // background: url("@/assets/background/theme_bg2.jpg");
    // background: #fff2df;
    padding: 980px 130px 250px;
    .decorate1 {
      margin-top: -160px;
      font-size: 50px;
      position: absolute;
      top: 40px;
      left: 0;
      right: 0;
      width: 100%;
      line-height: 60px;
      text-align: center;
      font-family: "en_6";
      border-radius: 0px 0 0 400px;
    }
    .decorate2 {
      color: #fff;
      font-size: 210px;
      font-weight: 900;
      right: 0;
      padding: 0 40px 22px 120px;
      line-height: 220px;
      position: absolute;
      top: 590px;
      font-family: "en_2" !important;
      border-bottom: 10px solid #fff;
    }
    .decorate3 {
      font-size: 46px;
      left: 0;
      right: 0;
      line-height: 60px;
      position: absolute;
      bottom: 40px;
      text-align: center;
      font-family: "en_6";
      color: #545454;
    }
    .title {
      font-size: 120px;
      line-height: 200px;
      text-align: center;
      padding: 0px 100px;
      font-weight: 900;
      text-align: justify;
    }
    .footer_box {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 200px 0 30px;
      line-height: 200px;
      text-align: center;
      font-size: 70px;
    }
    .desc {
      font-size: 52px;
      line-height: 100px;
    }
  }
}
</style>
