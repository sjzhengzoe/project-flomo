<template>
  <div class="theme_box flex f-sb">
    <template
      v-for="(item, idx) in formData.content.split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div v-for="(text, idx2) in item.split('\n')" :key="idx2">
          <div
            class="title"
            v-if="text.indexOf('-') != -1"
            v-html="text.replace('-', '')"
          />
          <div class="content" v-else-if="text" v-html="text" />
          <div class="block" v-else>&nbsp;</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

const store = useStore();
const formData = computed(() => store.formData2);
</script>

<style lang="less" scoped>
.theme_box {
  width: 13846px;
  flex-wrap: wrap;
  overflow: hidden;
  transform: scale(0.104);
  transform-origin: 0px 0px;
  .pic_box {
    width: 3750px;
    height: 5000px;
    position: relative;
    display: flex;
    justify-content: center;
    flex-direction: column;

    text-align: justify;
    background-color: #fefbf2;

    box-sizing: border-box;
    font-family: "font_6";
    line-height: 250px;
    font-size: 136px;
    .title {
      padding: 0 520px 140px;
      font-size: 190px;
      line-height: 300px;
      font-weight: 900;
      // text-align: center;
      color: #000;
    }
    .content {
      padding: 0 520px;
      color: #252525;
    }
    .block {
      line-height: 90px;
      // font-size: 150px;
    }
  }
}
</style>
