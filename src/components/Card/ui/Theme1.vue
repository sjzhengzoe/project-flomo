<template>
  <div class="theme_box flex f-sb">
    <template
      v-for="(item, idx) in formData.content.split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div
          v-for="(text, idx2) in item.replace(/\. /g, '\.. ').split('\. ')"
          :key="idx2"
        >
          <div class="content" v-if="text" v-html="text" />
          <div class="block">&nbsp;</div>
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

    // text-align: justify;
    background-color: #fefbf2;
    padding: 0 320px;
    box-sizing: border-box;
    .content {
      padding: 0 100px;
      color: #252525;
      font-family: "font_4";
      // text-align: center;
      font-size: 230px;
      line-height: 260px;
      white-space: pre-wrap;
    }
    .block {
      line-height: 230px;
    }
  }
}
</style>
