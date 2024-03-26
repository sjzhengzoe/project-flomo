<template>
  <div class="content_box flex-y">
    <!-- 操作区 -->
    <div>
      <el-button :loading="loading" type="primary" @click="handleToDownload">
        下载图片
      </el-button>
    </div>

    <!-- 预览区 -->
    <div :class="['pic_limit_box flex f-y-c']">
      <!-- Share Drama -->
      <template v-if="formData.type === TypeOptions.SHARE_DRAMA">
        <div id="red_pic_0" class="pic_box share_drama flex-y f-x-c">
          <div class="title">{{ formData.title }}</div>
          <img class="flex intro_pic" alt="" :src="formData.text[2]" />
          <div class="name">「 {{ formData.text[0] }} 」</div>
          <div :class="['key_box flex f-y-c f-x-c flex-w']">
            <div
              v-for="(key, idx) in formData.text[1].split(' ')"
              :key="idx"
              class="key"
            >
              {{ key }}
            </div>
          </div>
        </div>
      </template>

      <!-- Text -->
      <template v-if="formData.type === TypeOptions.TEXT">
        <template
          v-for="(item, idx) in formData.text[0].split('\n\n')"
          :key="idx"
        >
          <template v-if="item">
            <div :id="`red_pic_${idx}`" class="flex-y pic_box text f-y-c f-x-c">
              <div class="title">{{ formData.title }}</div>
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

      <!-- COVER -->
      <template v-if="formData.type === TypeOptions.COVER">
        <div id="red_pic_0" class="pic_box cover flex-y f-x-c">
          {{
            JSON.stringify(formData.text[0])
              .replace(/\\n\\n/g, "\n")
              .replace(/\\n/g, "\n")
              .replace(/^"/, "")
              .replace(/"$/, "")
          }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { downloadBlob } from "@/utils";
import { useStore } from "@/store";
import domtoimage from "dom-to-image";
import { TypeOptions } from "@/utils/types";

const store = useStore();
const loading = ref(false);
const formData = computed(() => store.formData);

// 下载图片
const handleToDownload = async () => {
  const name = "red_pic_";
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
.content_box {
  height: 340px;
  position: relative;
  overflow: hidden;

  .pic_limit_box {
    width: 10100px;
    position: absolute;
    top: 20px;
    transform: scale(0.13);
    transform-origin: 0px 0px;
    .pic_box {
      background-color: #000;
      color: #fff;
      box-sizing: border-box;
      width: 1440px;
      height: 1920px;
      // padding: 0 250px 0 120px;
      padding: 0 180px;
      &.share_drama {
        .title {
          font-size: 110px;
          line-height: 200px;
          text-align: center;
          font-family: "en1";
          margin-bottom: 70px;
        }
        .intro_pic {
          margin: 10px 0 100px;
          object-fit: contain;
          max-height: 800px;
        }
        .name {
          font-size: 100px;
          line-height: 104px;
          font-family: "zh1";
          white-space: pre-line;
          text-align: center;
          margin-bottom: 40px;
        }
        .key_box {
          .key {
            font-size: 64px;
            font-family: "zh1";
            white-space: pre-line;
            background-color: #fff;
            color: #000;
            margin: 14px 10px;
            padding: 5px 10px;
          }
        }
      }
      &.text {
        padding: 0 130px;
        .title {
          line-height: 200px;
          text-align: center;
          font-family: "en1";
          font-size: 95px;
          margin-bottom: 30px;
        }
        .desc {
          font-size: 70px;
          text-align: justify;
          line-height: 98px;
          font-family: "zh1";
          text-indent: 120px;
          white-space: pre-line;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      &.cover {
        line-height: 360px;
        text-align: center;
        font-family: "en1";
        font-size: 200px;
      }
    }
  }
}
</style>
