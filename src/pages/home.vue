<template>
  <div class="Page">
    <!-- 操作区 -->
    <el-form label-position="right" label-width="100px">
      <!-- 选择主题 -->
      <el-form-item label="主题：">
        <el-radio v-model="store.nowTheme" :label="Theme.THEME_1">
          觉察
        </el-radio>
        <el-radio v-model="store.nowTheme" :label="Theme.THEME_2">
          碎碎念
        </el-radio>
        <el-radio v-model="store.nowTheme" :label="Theme.THEME_3">
          美食鉴赏家
        </el-radio>
        <el-radio v-model="store.nowTheme" :label="Theme.THEME_4">
          打怪升级计划
        </el-radio>
      </el-form-item>
    </el-form>
    <el-form label-position="right" label-width="100px" :model="formData">
      <!-- 内容 -->
      <el-form-item label="标题：">
        <el-input v-model="formData.title" />
        <div>{{ formData.title.length }} 字</div>
      </el-form-item>
      <!-- <el-form-item label="底部：">
        <el-input v-model="formData.footer" />
      </el-form-item> -->
      <el-form-item label="小红书标签：">
        <el-input v-model="formData.tagsOfRed" />
      </el-form-item>
      <el-form-item label="抖音标签：">
        <el-input v-model="formData.tagsOfDou" />
      </el-form-item>
      <el-form-item label="封面">
        <el-upload v-model="formData.pic" :on-change="handleChange">
          <el-button type="primary">Click to upload</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="内容：">
        <el-input
          @input="handleChangeContent"
          v-model="formData.content"
          autosize
          type="textarea"
        />
      </el-form-item>
    </el-form>

    <Card />
    <a class="icp flex f-x-c" href="https://beian.miit.gov.cn" target="_blank"
      >粤ICP备2025373031号</a
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";
import Card from "@/components/Card/index.vue";
import { Theme } from "@/utils/const";
import { UploadProps } from "element-plus";

const store = useStore();
const formData = computed(() => {
  if (store.nowTheme == Theme.THEME_1) {
    return store.formData1;
  }
  if (store.nowTheme == Theme.THEME_2) {
    return store.formData2;
  }
  if (store.nowTheme == Theme.THEME_3) {
    return store.formData3;
  }
  if (store.nowTheme == Theme.THEME_4) {
    return store.formData4;
  }

  return store.formData1;
});

const handleChangeContent = () => {
  console.log("feifei", formData.value.content);
  localStorage.setItem("FORM_DATA_CONTENT", formData.value.content);
};

const handleChange: UploadProps["onChange"] = async (uploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    formData.value.pic = e?.target?.result as string;
  };
};
</script>

<style lang="less">
.Page {
  padding: 20px;
  background-color: rgba(250, 235, 215, 0.5);

  .icp {
    font-size: 3px;
    color: #000;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
