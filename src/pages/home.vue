<template>
  <div class="Page">
    <!-- 操作区 -->
    <el-form label-position="right" label-width="100px" :model="formData">
      <!-- 选择主题 -->
      <el-form-item label="主题：">
        <el-radio v-model="formData.theme" :label="Theme.THEME_1">
          主题一
        </el-radio>
      </el-form-item>

      <!-- 内容 -->
      <el-form-item label="标题：">
        <el-input v-model="formData.title" />
        <div>{{ formData.title.length }} 字</div>
      </el-form-item>
      <el-form-item label="底部：">
        <el-input v-model="formData.footer" />
      </el-form-item>
      <el-form-item label="小红书标签：">
        <el-input v-model="formData.tagsOfRed" />
      </el-form-item>
      <el-form-item label="抖音标签：">
        <el-input v-model="formData.tagsOfDou" />
      </el-form-item>
      <el-form-item label="内容：">
        <el-input v-model="formData.content" autosize type="textarea" />
      </el-form-item>
    </el-form>

    <Card />
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useStore } from "@/store";
import Card from "@/components/Card.vue";
import { Theme } from "@/utils/const";

const store = useStore();
const formData = reactive(store.formData);
</script>

<style lang="less">
.Page {
  padding: 20px;
  background-color: rgba(250, 235, 215, 0.5);
}
</style>
