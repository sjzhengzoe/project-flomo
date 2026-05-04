<template>
  <div class="card-box">
    <div class="card-box__preview custom-scrollbar">
      <Swiper
        ref="swiperRef"
        :modules="modules"
        :slides-per-view="1"
        :space-between="12"
        :speed="300"
        :touch-ratio="1"
        :breakpoints="breakpoints"
        class="card-swiper"
      >
        <SwiperSlide v-for="(page, idx) in pages" :key="idx" class="card-slide">
          <div class="card-item">
            <div :id="`pic_${idx}`" class="pic-box pic-box--douyin">
              <div class="content-body">
                <p
                  v-for="(paragraph, i) in page"
                  :key="i"
                  :class="[
                    'content-paragraph',
                    { 'content-paragraph--title': paragraph.isTitle },
                  ]"
                >
                  <span
                    v-for="(part, partIndex) in paragraph.parts"
                    :key="partIndex"
                    :class="[
                      {
                        'content-title-text': paragraph.isTitle,
                        'content-emphasis': part.emphasis,
                      },
                    ]"
                  >
                    {{ part.text }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "../store";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

type TextPart = {
  text: string;
  emphasis: boolean;
};
type Paragraph = {
  parts: TextPart[];
  isTitle: boolean;
};

const store = useStore();
const formData = computed(() => store.formData);
const paragraphs = computed<Paragraph[]>(() =>
  getParagraphLines(formData.value.content).map((line, index) => ({
    parts: parseEmphasis(line),
    isTitle: index === 0,
  })),
);
const pages = computed(() =>
  paragraphs.value.length ? [paragraphs.value] : [],
);

function getParagraphLines(text: string) {
  return normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#") && line !== "/")
    .reduce<string[]>((paragraphs, line) => {
      const isListItem = /^\d+[.．、]\s*/.test(line);
      const lastIndex = paragraphs.length - 1;

      if (isListItem && lastIndex >= 0) {
        paragraphs[lastIndex] = `${paragraphs[lastIndex]}\n${line}`;
        return paragraphs;
      }

      paragraphs.push(line);
      return paragraphs;
    }, []);
}
function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n");
}
function parseEmphasis(text: string) {
  return text
    .split(/(`.*?`)/g)
    .filter(Boolean)
    .map((part) => {
      const emphasis = part.startsWith("`") && part.endsWith("`");
      return {
        text: emphasis ? part.slice(1, -1) : part,
        emphasis,
      };
    })
    .filter((part) => part.text);
}

const modules: any[] = [];
const breakpoints = {
  320: { slidesPerView: 1 },
  480: { slidesPerView: 1 },
  768: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
};
</script>

<style lang="less" scoped>
.card-box {
  width: 100%;
  display: flex;
  justify-content: center;
}

.card-box__preview {
  width: 100%;
  max-width: 100%;
  border-radius: 20px;
  overflow: hidden;
  max-height: 553px;
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5);
}

.card-swiper {
  width: 100%;
  height: auto;
  border-radius: 16px;
}

.card-slide {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}

.card-item {
  width: 300px;

  border-radius: 20px;
  overflow: hidden;
}

.pic-box {
  --fc_1: #1c1c1c;
  --fc_0: #ffffff;
  --fc_3: #5d5d5d;
  --fc_2: #111111;
  width: 300px;
  max-height: 533px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 38px 43px 40px 22px;
  background: url("@/assets/background/theme_bg22.jpg") top/cover no-repeat;
  background-color: rgba(255, 251, 240, 0.5);
  font-family: "font_03_subset", "font_03_full", "font_6", serif;
  color: #252525;
  box-sizing: border-box;
}

.content-body {
  font-size: 11px;
  line-height: 1.72;
  color: #1a1a1a;
}

.content-paragraph {
  margin: 0;
  text-align: left;
  text-justify: inter-ideograph;
  word-break: break-word;
  white-space: pre-line;
}

.content-paragraph + .content-paragraph {
  margin-top: 14px;
}

.content-paragraph--title {
  position: relative;
  color: #111111;
  font-weight: 700;
  line-height: 1.5;
  padding-left: 0;
  padding-bottom: 9px;
}

.content-paragraph--title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 36px;
  height: 2px;
  background: currentColor;
}

.content-paragraph--title + .content-paragraph {
  margin-top: 20px;
}

.content-title-text,
.content-emphasis {
  display: inline;
  color: #111111;
  font-weight: 700;
}

.content-title-text {
  font-size: 14px;
}

.content-emphasis {
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  text-decoration-skip-ink: auto;
}
</style>
