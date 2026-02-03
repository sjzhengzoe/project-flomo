<template>
  <div class="card_box">
    <div class="card_box__preview glass-panel custom-scrollbar">
      <Theme5 />
    </div>
  </div>
</template>

<script setup lang="ts">
import Theme5 from "./ui/Theme5.vue";
</script>

<style lang="less" scoped>
.card_box {
  width: 100%;
  max-width: 100%;
}

.card_box__preview {
  width: 100%;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  height: 420px;

  @media (min-width: 768px) {
    height: 520px;
  }
}

.card_box__preview > * {
  display: block;
}
</style>
