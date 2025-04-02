<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content.split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div
          class="bg"
          :style="
            formData.pic
              ? {
                  backgroundImage: `url(${formData.pic})`,
                }
              : {}
          "
        ></div>
        <div class="top">&nbsp;</div>
        <div class="from flex f-y-c">
          <div>{{ formData.title }}</div>
        </div>
        <div class="line_2">----------------------------------</div>
        <div class="content_main flex-y f-x-c">
          <div>
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
              <div class="content" v-else v-html="text" />
            </div>
          </div>
        </div>

        <!-- 页脚 -->
        <div class="line_footer">----------------------------------</div>
        <div class="footer flex f-y-c f-sb">
          <div>{{ formData.footer }}</div>
          <div>{{ formattedDate }}</div>
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
    color: #252525;
    box-sizing: border-box;
    width: 1440px;
    height: 1920px;
    border-radius: 80px;
    justify-content: center;
    overflow: hidden;
    position: relative;
    background: url("@/assets/background/theme_bg18.jpg") top/cover no-repeat;
    .bg {
      width: 1440px;
      border-radius: 10px;
      height: 550px;
      overflow: hidden;
      background: url("@/assets/images/theme_pic1.jpg") center/cover no-repeat;
    }
    .top {
      margin-top: 80px;
    }
    .line {
      font-size: 57px;
      padding: 0 60px;
      line-height: 110px;
      color: #6e6e73;
    }
    .from {
      padding: 0 80px;
      text-align: justify;
      font-size: 46px;
      font-family: "font_8_2";
    }
    .line_2 {
      font-size: 57px;
      padding: 0 60px;
      line-height: 110px;
      color: #6e6e73;
    }
    .content_main {
      height: 870px;
    }

    .content_box {
      font-size: 56px;
      font-family: "font_8_2";
      margin: 0px 80px 40px;
      line-height: 1.7em;
      .title {
        font-family: "font_8_4";
      }
    }
    .line_footer {
      position: absolute;
      bottom: 120px;
      font-size: 57px;
      padding: 0 60px;
      line-height: 110px;
      color: #6e6e73;
    }
    .footer {
      position: absolute;
      bottom: 80px;
      width: 1440px;
      font-size: 46px;
      padding: 0 80px;
      box-sizing: border-box;
      font-family: "font_2";
    }
  }
}
</style>
