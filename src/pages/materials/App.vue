<template>
  <div class="materials-page usePx">
    <Header />

    <main class="materials-main">
      <section class="paper-stage" aria-label="A6 番茄炒蛋画风打样">
        <div class="a6-sheet">
          <div class="a6-style-proof">
            <img
              class="a6-style-proof__image"
              :src="a6StyleProofImage"
              alt="A6 番茄炒蛋画风对比"
            />
            <div class="a6-style-proof__labels" aria-hidden="true">
              <div
                v-for="(label, index) in styleLabels"
                :key="label"
                class="a6-style-proof__label"
                :style="{
                  gridColumn: `${(index % 4) + 1}`,
                  gridRow: `${Math.floor(index / 4) + 1}`,
                }"
              >
                {{ index + 1 }}. {{ label }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div class="floating-actions">
      <button type="button" class="action-btn" title="打印" @click="handlePrint">
        <Printer class="action-btn__icon" :size="22" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "@/components/Header.vue";
import { Printer } from "lucide-vue-next";

const a6StyleProofImage = encodeURI("/素材打样/A6番茄炒蛋画风对比03.png");

const styleLabels = [
  "黑色线稿小食物",
  "手账涂鸦",
  "儿童绘本线描",
  "咖啡馆菜单线稿",
  "极简日式 doodle",
  "贴纸边框手绘",
  "粗马克笔线稿",
  "复古包装插画",
];

const handlePrint = () => {
  window.print();
};
</script>

<style lang="less" scoped>
.usePx.materials-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 60px 16px 84px;
  padding-bottom: calc(84px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 18% 8%,
      rgba(242, 163, 58, 0.12),
      transparent 28%
    ),
    radial-gradient(
      circle at 88% 12%,
      rgba(107, 145, 103, 0.12),
      transparent 30%
    ),
    #050508;
}

.usePx .materials-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  margin-top: 0;
  overflow: hidden;
}

.usePx .paper-stage {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  container-type: size;
}

.usePx .a6-sheet {
  position: relative;
  width: min(100cqw, 148mm, calc(100cqh * 148 / 105));
  aspect-ratio: 148 / 105;
  box-sizing: border-box;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
}

.usePx .a6-style-proof {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: #ffffff;
}

.usePx .a6-style-proof__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.usePx .a6-style-proof__labels {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  pointer-events: none;
}

.usePx .a6-style-proof__label {
  align-self: end;
  justify-self: center;
  max-width: 30mm;
  margin-bottom: 2mm;
  padding: 1mm 1.6mm;
  border: 0.1mm solid rgba(17, 24, 39, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #1f2937;
  font-size: 6px;
  font-weight: 600;
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
}

.usePx .floating-actions {
  position: fixed;
  bottom: calc(20px + env(safe-area-inset-bottom));
  left: 50%;
  z-index: 100;
  display: flex;
  gap: 12px;
  padding: 8px;
  border: 1px solid var(--panel-border);
  border-radius: 40px;
  background: rgba(17, 19, 31, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transform: translateX(-50%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.usePx .action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;

  &:active {
    transform: scale(0.95);
    background: rgba(99, 102, 241, 0.15);
  }
}

.usePx .action-btn__icon {
  color: var(--text-primary);
  line-height: 1;
}

@media print {
  @page {
    size: 148mm 105mm;
    margin: 0;
  }

  :global(body) {
    margin: 0;
    background: #ffffff;
  }

  :global(.header) {
    display: none !important;
  }

  .usePx.materials-page {
    position: static;
    display: block;
    width: 148mm;
    height: 105mm;
    padding: 0;
    overflow: visible;
    background: #ffffff;
  }

  .usePx .materials-main,
  .usePx .paper-stage {
    display: block;
    width: 148mm;
    height: 105mm;
    margin: 0;
    overflow: visible;
  }

  .usePx .floating-actions {
    display: none;
  }

  .usePx .a6-sheet {
    width: 148mm;
    height: 105mm;
    box-shadow: none;
  }
}
</style>
