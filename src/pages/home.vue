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
          美食鉴赏家
        </el-radio>
        <el-radio v-model="store.nowTheme" :label="Theme.THEME_3">
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
import { computed } from "vue";
import { useStore } from "@/store";
import Card from "@/components/Card/index.vue";
import { Theme } from "@/utils/const";

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

  return store.formData1;
});
</script>

<style lang="less">
.Page {
  padding: 20px;
  background-color: rgba(250, 235, 215, 0.5);
}
</style>
