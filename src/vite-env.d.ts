/// <reference types="vite/client" />

declare module "swiper/vue" {
  import type { DefineComponent } from "vue";
  export const Swiper: DefineComponent<Record<string, unknown>>;
  export const SwiperSlide: DefineComponent<Record<string, unknown>>;
}

declare module "swiper/modules" {
  export const Pagination: unknown;
}
