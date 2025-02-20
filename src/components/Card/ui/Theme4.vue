<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content
        .replace(/\n{3,}/g, '\n\n\n')
        .split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div class="desc">
          {{ idx + 1 < 10 ? "0" : "" }}{{ idx + 1 }} <br />
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
const formData = computed(() => store.formData4);
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
    margin: 0 20px 20px 0;
    justify-content: center;
    position: relative;
    background: url("@/assets/background/theme_bg10.jpg") top/cover no-repeat;
    padding: 650px 130px;
    .title {
      font-size: 120px;
      line-height: 200px;
      text-align: center;
      padding: 0px 100px;
      font-weight: 900;
    }
    .desc {
      font-size: 60px;
      line-height: 110px;
    }
  }
}
</style>
