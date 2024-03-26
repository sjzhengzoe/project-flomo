<template>
  <div class="Page">
    <!-- 操作区 -->
    <el-form label-position="right" label-width="100px" :model="formData">
      <!-- 选择类型 -->
      <el-form-item label="类型">
        <el-radio v-model="formData.type" :label="TypeOptions.TEXT">
          {{ TypeOptions.TEXT }}
        </el-radio>
        <el-radio v-model="formData.type" :label="TypeOptions.SHARE_DRAMA">
          {{ TypeOptions.SHARE_DRAMA }}
        </el-radio>
        <el-radio v-model="formData.type" :label="TypeOptions.COVER">
          {{ TypeOptions.COVER }}
        </el-radio>
      </el-form-item>

      <!-- Share Drama -->
      <template v-if="formData.type === TypeOptions.SHARE_DRAMA">
        <el-form-item label="标题">
          <el-radio v-model="formData.title" label="SHARE DRAMA">
            Share Drama
          </el-radio>
          <el-radio v-model="formData.title" label="READING LOG">
            Reading Log
          </el-radio>
        </el-form-item>
        <el-form-item label="剧名">
          <el-input v-model="formData.text[0]" autosize type="textarea" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="formData.text[1]" autosize type="textarea" />
        </el-form-item>
        <el-form-item label="剧照">
          <el-upload v-model="formData.text[2]" :on-change="handleChange">
            <el-button type="primary">Click to upload</el-button>
          </el-upload>
        </el-form-item>
      </template>

      <!-- Text -->
      <template v-if="formData.type === TypeOptions.TEXT">
        <el-form-item label="标题">
          <el-radio v-model="formData.title" label="Chat With My Friends">
            Chat With My Friends
          </el-radio>
          <el-radio v-model="formData.title" label="Human Growth Diary">
            Human Growth Diary
          </el-radio>
          <el-radio v-model="formData.title" label="Some Sentence">
            Sentence
          </el-radio>
          <el-radio v-model="formData.title" label="Reading Log">
            Reading Log
          </el-radio>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="formData.text[0]" autosize type="textarea" />
        </el-form-item>
      </template>

      <!-- cover -->
      <template v-if="formData.type === TypeOptions.COVER">
        <el-form-item label="标题">
          <el-input v-model="formData.text[0]" />
        </el-form-item>
      </template>
    </el-form>
    <Card />
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useStore } from "@/store";
import Card from "@/components/Card.vue";
import { TypeOptions } from "@/utils/types";
import type { UploadProps } from "element-plus";

const store = useStore();
const formData = reactive(store.formData);

const handleChange: UploadProps["onChange"] = async (uploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    formData.text[2] = e?.target?.result as string;
  };
};
</script>

<style lang="less">
.Page {
  padding: 20px;
  background-color: rgba(250, 235, 215, 0.5);
}
</style>
@/utils/types
