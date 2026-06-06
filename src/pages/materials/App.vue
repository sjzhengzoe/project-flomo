<template>
  <div class="materials-page usePx">
    <Header />

    <main class="materials-main">
      <section class="paper-stage" aria-label="A6 番茄炒蛋画风打样">
        <div class="a6-sheet">
          <div class="a6-style-proof">
            <img
              class="a6-style-proof__image"
              :src="activeProof.src"
              :alt="activeProof.name"
            />
            <div
              class="a6-style-proof__labels"
              :style="{
                gridTemplateColumns: `repeat(${activeProof.columns}, 1fr)`,
                gridTemplateRows: `repeat(${activeProof.rows}, 1fr)`,
              }"
              aria-hidden="true"
            >
              <div
                v-for="(label, index) in activeProof.labels"
                :key="label"
                class="a6-style-proof__label"
                :style="{
                  gridColumn: `${(index % activeProof.columns) + 1}`,
                  gridRow: `${Math.floor(index / activeProof.columns) + 1}`,
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
      <button
        type="button"
        class="action-btn"
        :title="`切换素材：${activeProof.name}`"
        :aria-label="`切换素材，当前 ${activeProof.name}`"
        @click="cycleProof"
      >
        <RefreshCw class="action-btn__icon" :size="22" />
      </button>
      <button type="button" class="action-btn" title="打印" @click="handlePrint">
        <Printer class="action-btn__icon" :size="22" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "@/components/Header.vue";
import { computed, ref } from "vue";
import { Printer, RefreshCw } from "lucide-vue-next";

const PROOF_INDEX_STORAGE_KEY = "MATERIALS_A6_STYLE_PROOF_INDEX";
const PRINT_PAGE_STYLE_ID = "materials-print-page-style";
const A6_LANDSCAPE_WIDTH_MM = 148;
const A6_LANDSCAPE_HEIGHT_MM = 105;

type StyleProof = {
  name: string;
  src: string;
  columns: number;
  rows: number;
  labels: string[];
};

const styleProofs: StyleProof[] = [
  {
    name: "01 纸感手绘",
    src: encodeURI("/素材打样/A6番茄炒蛋画风对比01.png"),
    columns: 4,
    rows: 2,
    labels: [
      "水彩手绘",
      "日式杂志",
      "水彩细线稿",
      "色铅笔食谱",
      "钢笔淡彩",
      "日式淡彩平涂",
      "轻水粉",
      "手账贴纸",
    ],
  },
  {
    name: "02 平面绘画",
    src: encodeURI("/素材打样/A6番茄炒蛋画风对比02.png"),
    columns: 4,
    rows: 2,
    labels: [
      "平面插画",
      "柔和平面",
      "印象派笔触",
      "后印象派色块",
      "油画棒肌理",
      "粉彩绘画",
      "现代海报插画",
      "绘本插画",
    ],
  },
  {
    name: "03 线稿小食物",
    src: encodeURI("/素材打样/A6番茄炒蛋画风对比03.png"),
    columns: 4,
    rows: 2,
    labels: [
      "黑色线稿小食物",
      "手账涂鸦",
      "儿童绘本线描",
      "咖啡馆菜单线稿",
      "极简日式 doodle",
      "贴纸边框手绘",
      "粗马克笔线稿",
      "复古包装插画",
    ],
  },
  {
    name: "04 菜单参考",
    src: encodeURI("/素材打样/A6番茄炒蛋画风对比04.png"),
    columns: 3,
    rows: 3,
    labels: [
      "日系治愈动画风",
      "韩系 INS 菜单风",
      "二次元厚涂风",
      "新海诚电影感",
      "Q 版可爱风",
      "游戏料理 UI 风",
      "和风浮世绘二次元",
      "日漫食战夸张风",
      "轻像素二次元风",
    ],
  },
];

function loadProofIndex() {
  const storedIndex = Number(localStorage.getItem(PROOF_INDEX_STORAGE_KEY));

  if (Number.isInteger(storedIndex) && styleProofs[storedIndex]) {
    return storedIndex;
  }

  if (Number.isInteger(storedIndex) && storedIndex >= styleProofs.length) {
    return styleProofs.length - 1;
  }

  return 2;
}

const activeProofIndex = ref(loadProofIndex());
const activeProof = computed(
  () => styleProofs[activeProofIndex.value] || styleProofs[0],
);

const cycleProof = () => {
  activeProofIndex.value = (activeProofIndex.value + 1) % styleProofs.length;
  localStorage.setItem(PROOF_INDEX_STORAGE_KEY, String(activeProofIndex.value));
};

const applyPrintPageStyle = () => {
  let style = document.getElementById(
    PRINT_PAGE_STYLE_ID,
  ) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.id = PRINT_PAGE_STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    @media print {
      @page {
        size: ${A6_LANDSCAPE_WIDTH_MM}mm ${A6_LANDSCAPE_HEIGHT_MM}mm;
        margin: 0;
      }

      html,
      body,
      #app {
        width: ${A6_LANDSCAPE_WIDTH_MM}mm !important;
        height: ${A6_LANDSCAPE_HEIGHT_MM}mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    }
  `;
};

const handlePrint = () => {
  applyPrintPageStyle();
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
