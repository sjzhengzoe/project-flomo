<template>
  <div class="card_box flex-y">
    <!-- 操作区 -->
    <div class="btn_box">
      <el-button :loading="loading" type="primary" @click="handleToDownload">
        下载图片
      </el-button>
    </div>

    <!-- 预览区 -->
    <div class="preview_box">
      <!-- THEME_1 -->
      <Theme1 v-if="nowTheme === Theme.THEME_1" />

      <!-- THEME_2 -->
      <Theme2 v-if="nowTheme === Theme.THEME_2" />

      <!-- THEME_3 -->
      <Theme3 v-if="nowTheme === Theme.THEME_3" />

      <!-- THEME_4 -->
      <Theme4 v-if="nowTheme === Theme.THEME_4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { downloadBlob } from "@/utils";
import { useStore } from "@/store";
import domtoimage from "dom-to-image";
import { Theme } from "@/utils/const";
import Theme1 from "./ui/Theme1.vue";
import Theme2 from "./ui/Theme2.vue";
import Theme3 from "./ui/Theme3.vue";
import Theme4 from "./ui/Theme4.vue";

const store = useStore();
const nowTheme = computed(() => store.nowTheme);
const loading = ref(false);

// 下载图片
const handleToDownload = async () => {
  const name = "pic_";
  let index = 0;
  while (document.getElementById(`${name}${index}`)) {
    const node = document.getElementById(`${name}${index}`);
    loading.value = true;
    const blob = await domtoimage.toBlob(node, {
      width: 1440,
      height: 1920,
    });
    downloadBlob(blob, `${name}${index + 1}.png`);
    loading.value = false;
    index++;
  }
};
</script>

<style lang="less" scoped>
.card_box {
  position: relative;

  .btn_box {
    margin-bottom: 10px;
  }
  .preview_box {
    height: 110px;
    overflow: hidden;
  }
}
</style>
