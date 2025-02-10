<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content
        .replace(/\n{3,}/g, '\n\n\n')
        .split('\n\n\n')"
      :key="idx"
    >
      <template v-if="idx == 0">
        <div :id="`pic_${idx}`" class="flex-y pic_box theme_1">
          <div
            v-for="(text, idx) in item.split('\n')"
            :key="idx"
            :class="['title']"
          >
            #
            {{ text }}
          </div>
          <div class="footer_box">{{ formData.footer }}</div>
        </div>
      </template>

      <template v-else>
        <div :id="`pic_${idx}`" class="flex-y pic_box theme_1">
          <div v-for="text in item.split('\n')" :key="idx" :class="['desc']">
            <div v-if="text.indexOf('最近的觉察瞬间') == -1">
              0{{ idx }} <br />
            </div>
            {{ text }}
          </div>
        </div>
      </template>
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
    color: #000;
    box-sizing: border-box;
    width: 1440px;
    height: 1920px;
    margin: 0 20px 20px 0;
    justify-content: center;
    position: relative;
    &.theme_1 {
      background: url("@/assets/images/theme_bg_1.jpg") top/cover no-repeat;
      padding: 0px 130px;
      .title {
        font-size: 120px;
        line-height: 200px;
        text-align: center;
        padding: 0px 100px;
        font-weight: 900;
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
        font-size: 60px;
        line-height: 110px;
      }
    }
  }
}
</style>
