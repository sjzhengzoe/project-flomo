export interface FormData {
  text: string[]; // 内容
  type: TypeOptions; // 类型
  title: string; // 标题
}
export enum TypeOptions {
  TEXT = "TEXT",
  SHARE_DRAMA = "Share Drama",
  COVER = "COVER",
}
