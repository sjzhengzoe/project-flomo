<template>
  <div class="theme_box flex f-sb">
    <template
      v-for="(item, idx) in formData.content.split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div
          v-for="(text, idx2) in item.split('\n')"
          :key="idx2"
          :class="['content_box']"
        >
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
    // color: #fff;
    // background-color: #000;
    background-color: rgba(255, 251, 240, 0.5);
    padding: 0 320px;
    box-sizing: border-box;
    font-family: "font_7";
    color: #252525;
    line-height: 230px;
    font-size: 160px;
    .title {
      font-size: 260px;
      line-height: 320px;
      font-weight: 600;
    }
    .content {
      // font-size: 150px;
    }
    .block {
      // font-size: 150px;
    }
  }
}
</style>
