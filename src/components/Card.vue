<template>
  <div class="card_box flex-y">
    <!-- 操作区 -->
    <div class="btn_box">
      <el-button :loading="loading" type="primary" @click="handleToDownload">
        下载图片
      </el-button>
    </div>

    <!-- 预览区 -->
    <div :class="['width_limit_box flex']">
      <!-- THEME_1 -->
      <template v-if="formData.theme === Theme.THEME_1">
        <template
          v-for="(item, idx) in formData.content
            .replace(/\n{3,}/g, '\n\n')
            .split('\n\n')"
          :key="idx"
        >
          <template v-if="idx == 0">
            <div :id="`pic_${idx}`" class="flex-y pic_box theme_1 text">
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
            <div :id="`pic_${idx}`" class="flex-y pic_box theme_1 text">
              <div
                v-for="(text, idx) in item.split('\n')"
                :key="idx"
                :class="['desc']"
              >
                {{ text }}
              </div>
            </div>
          </template>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { downloadBlob } from "@/utils";
import { useStore } from "@/store";
import domtoimage from "dom-to-image";
import { Theme } from "@/utils/const";

const store = useStore();
const loading = ref(false);
const formData = computed(() => store.formData);

// 下载图片
const handleToDownload = async () => {
  const name = "pic_";
  let index = 0;
  while (document.getElementById(`${name}${index}`)) {
    const node = document.getElementById(`${name}${index}`);
    loading.value = true;
    const blob = await domtoimage.toBlob(node, {
      width: 1440,
      height: 1440,
    });
    downloadBlob(blob, `${name}${index + 1}.png`);
    loading.value = false;
    index++;
  }
};
</script>

<style lang="less" scoped>
.card_box {
  height: 340px;
  position: relative;

  .btn_box {
    margin-bottom: 10px;
  }

  .width_limit_box {
    width: 1900px;
    flex-wrap: wrap;
    top: 20px;
    transform: scale(0.19);
    transform-origin: 0px 0px;
    .pic_box {
      &.theme_1 {
        background: url("@/assets/images/theme_bg_1.jpg") top/cover no-repeat;
      }
      color: #000;
      box-sizing: border-box;
      width: 1440px;
      height: 1440px;
      margin: 0 20px 20px 0;
      justify-content: center;
      position: relative;
      &.text {
        padding: 0px 130px;
        .title {
          font-size: 90px;
          line-height: 150px;
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
          font-size: 50px;
        }
        .desc {
          font-size: 60px;
          line-height: 110px;
        }
      }
    }
  }
}
</style>
