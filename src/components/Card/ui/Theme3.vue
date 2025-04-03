<template>
  <div class="theme_box flex">
    <template
      v-for="(item, idx) in formData.content.split('\n\n\n')"
      :key="idx"
    >
      <div :id="`pic_${idx}`" class="pic_box">
        <div class="head flex f-sb f-y-c">
          <div class="flex f-y-c">
            <div
              class="avatar"
              :style="
                formData.pic
                  ? {
                      backgroundImage: `url(${formData.pic})`,
                    }
                  : {}
              "
            ></div>
            <div>
              <div class="flex f-y-c">
                <div class="name">{{ formData.title }}</div>
                <svg
                  aria-label="已验证"
                  class="icon_good"
                  fill="rgb(0, 149, 246)"
                  height="12"
                  role="img"
                  viewBox="0 0 40 40"
                  width="12"
                >
                  <title>已验证</title>
                  <path
                    d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
                    fill-rule="evenodd"
                  ></path>
                </svg>
                <div class="text2 flex f-y-c">
                  <div class="char">·</div>
                  已关注
                </div>
              </div>
              <div class="location">In GuangZhou</div>
            </div>
          </div>
          <svg
            class="icon_more"
            aria-label="更多选项"
            fill="currentColor"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <title>更多选项</title>
            <circle cx="12" cy="12" r="1.5"></circle>
            <circle cx="6" cy="12" r="1.5"></circle>
            <circle cx="18" cy="12" r="1.5"></circle>
          </svg>
        </div>

        <div class="content_main flex-y f-x-c">
          <div v-for="(text, idx2) in item.split('\n')" :key="idx2">
            <div
              class="title"
              v-if="text.indexOf('-') != -1"
              v-html="text.replace('-', '')"
            />
            <div class="content" v-else v-html="text" />
          </div>
        </div>

        <div class="footer">
          <div
            v-if="formData.content.split('\n\n\n').length >= 2"
            class="dot_box flex f-x-c f-y-c"
          >
            <div :class="`dot ${idx == 0 ? 'active' : ''}`"></div>
            <div
              :class="`dot ${
                (idx == 1 && formData.content.split('\n\n\n').length == 2) ||
                (idx != 0 &&
                  idx + 1 !== formData.content.split('\n\n\n').length)
                  ? 'active'
                  : ''
              }`"
            ></div>
            <div
              v-if="formData.content.split('\n\n\n').length >= 3"
              :class="`dot ${
                formData.content.split('\n\n\n').length >= 3 &&
                idx + 1 == formData.content.split('\n\n\n').length
                  ? 'active'
                  : ''
              }`"
            ></div>
          </div>

          <div class="flex f-y-c f-sb">
            <div class="flex f-y-c icon_box">
              <div class="flex f-y-c f-x-c" style="width: 240px; height: 240px">
                <svg
                  aria-label="取消赞"
                  class="like"
                  fill="currentColor"
                  height="24"
                  role="img"
                  viewBox="0 0 48 48"
                  width="24"
                >
                  <title>取消赞</title>
                  <path
                    d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"
                  ></path>
                </svg>
              </div>
              <div class="num num1">{{ randomLike }}</div>
              <div class="flex f-y-c f-x-c" style="width: 240px; height: 240px">
                <svg
                  aria-label="评论"
                  class="comment"
                  fill="currentColor"
                  height="24"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <title>评论</title>
                  <path
                    d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-linejoin="round"
                    stroke-width="2"
                  ></path>
                </svg>
              </div>

              <div class="num num2">{{ randomComment }}</div>
              <div class="flex f-y-c f-x-c" style="width: 240px; height: 240px">
                <svg
                  aria-label="分享"
                  class="share"
                  fill="currentColor"
                  height="24"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <title>分享</title>
                  <line
                    fill="none"
                    stroke="currentColor"
                    stroke-linejoin="round"
                    stroke-width="2"
                    x1="22"
                    x2="9.218"
                    y1="3"
                    y2="10.083"
                  ></line>
                  <polygon
                    fill="none"
                    points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                    stroke="currentColor"
                    stroke-linejoin="round"
                    stroke-width="2"
                  ></polygon>
                </svg>
              </div>
            </div>
            <div class="flex f-y-c icon_box">
              <svg
                aria-label="收藏"
                class="collect"
                fill="currentColor"
                height="24"
                role="img"
                viewBox="0 0 24 24"
                width="24"
              >
                <title>收藏</title>
                <polygon
                  fill="none"
                  points="20 21 12 13.44 4 21 4 3 20 3 20 21"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                ></polygon>
              </svg>
            </div>
          </div>
          <!-- <div class="flex f-sb f-y-c">
            <div class="like_num">{{ randomLike }} 次赞</div>
            <div class="comment_num">全部 {{ randomComment }}条评论</div>
          </div> -->
          <div class="say_box flex f-y-c">
            <div class="name">{{ formData.title }}</div>
            <svg
              aria-label="已验证"
              class="icon_good"
              fill="rgb(0, 149, 246)"
              height="12"
              role="img"
              viewBox="0 0 40 40"
              width="12"
            >
              <title>已验证</title>
              <path
                d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
                fill-rule="evenodd"
              ></path>
            </svg>
            <div class="say">{{ formData.content }}</div>
          </div>
          <div class="tag flex f-y-c">
            <div>#{{ formData.footer }}</div>
            <div class="more">更多</div>
          </div>
          <div class="time flex g-y-c">
            {{ formattedDate }}&nbsp;&nbsp;·&nbsp;&nbsp;
            <div class="check">查看翻译</div>
          </div>
        </div>
        <div class="home flex f-y-c f-sb">
          <svg
            aria-label="首页"
            class="x1lliihq x1n2onr6 x5n08af"
            fill="currentColor"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <title>首页</title>
            <path
              d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z"
            ></path>
          </svg>

          <svg
            aria-label="发现"
            class="x1lliihq x1n2onr6 x5n08af"
            fill="currentColor"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <title>发现</title>
            <path
              d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
            <line
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              x1="16.511"
              x2="22"
              y1="16.511"
              y2="22"
            ></line>
          </svg>
          <svg
            aria-label="Reels"
            class="x1lliihq x1n2onr6 x5n08af"
            fill="currentColor"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <title>Reels</title>
            <line
              fill="none"
              stroke="currentColor"
              stroke-linejoin="round"
              stroke-width="2"
              x1="2.049"
              x2="21.95"
              y1="7.002"
              y2="7.002"
            ></line>
            <line
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              x1="13.504"
              x2="16.362"
              y1="2.001"
              y2="7.002"
            ></line>
            <line
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              x1="7.207"
              x2="10.002"
              y1="2.11"
              y2="7.002"
            ></line>
            <path
              d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552Z"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            ></path>
            <path
              d="M9.763 17.664a.908.908 0 0 1-.454-.787V11.63a.909.909 0 0 1 1.364-.788l4.545 2.624a.909.909 0 0 1 0 1.575l-4.545 2.624a.91.91 0 0 1-.91 0Z"
              fill-rule="evenodd"
            ></path>
          </svg>
          <svg
            aria-label="Direct"
            class="x1lliihq x1n2onr6 x5n08af"
            fill="currentColor"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <title>Direct</title>
            <line
              fill="none"
              stroke="currentColor"
              stroke-linejoin="round"
              stroke-width="2"
              x1="22"
              x2="9.218"
              y1="3"
              y2="10.083"
            ></line>
            <polygon
              fill="none"
              points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
              stroke="currentColor"
              stroke-linejoin="round"
              stroke-width="2"
            ></polygon>
          </svg>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

const store = useStore();
const formData = computed(() => store.formData3);
const date = new Date();
const year = date.getFullYear();
const month = String(date.getMonth() + 1);
const day = String(date.getDate());

const formattedDate = `${year}年${month}月${day}日`;

const randomLike = computed(() => {
  return Math.floor(Math.random() * 10000);
});
const randomComment = computed(() => {
  return Math.floor(Math.random() * 10000);
});
</script>

<style lang="less" scoped>
.theme_box {
  width: 3000px;
  flex-wrap: wrap;
  overflow: hidden;
  transform: scale(0.08);
  transform-origin: 0px 0px;
  .pic_box {
    width: 3750px;
    height: 5000px;
    position: relative;
    background-color: #000;
    .head {
      height: 300px;
      padding: 120px;
      .avatar {
        width: 320px;
        height: 320px;
        border-radius: 50%;
        margin-right: 120px;
        background: url("@/assets/images/theme_pic1.jpg") center/cover no-repeat;
      }
      .name {
        font-size: 140px;
        line-height: 180px;
        color: rgba(245, 245, 245, 1);
        font-family: "font_8_4";
      }
      .location {
        font-size: 120px;
        line-height: 180px;
        color: rgba(245, 245, 245, 1);
        font-family: "font_8_4";
      }
      svg {
        transform: scale(10);
      }
      .icon_good {
        padding: 2px 0 0 20px;
      }
      .text2 {
        font-size: 140px;
        line-height: 180px;
        color: rgba(245, 245, 245, 1);
        padding: 0 100px 0 240px;
        font-family: "font_8_4";
        .char {
          margin-right: 100px;
          font-family: "font_8_8";
        }
      }
      .icon_more {
        color: #fff;
        display: block;
        padding-right: 16px;
      }
    }
    .content_main {
      width: 3750px;
      height: 2830px;
      font-family: "font_8_2";
      font-size: 140px;
      line-height: 230px;
      padding: 0 200px;
      box-sizing: border-box;
      color: #252525;
      background-color: #fff;
      // background: url("@/assets/background/theme_bg18.jpg") bottom/cover
      //   no-repeat;
      .title {
        font-family: "font_8_4";
      }
    }
    .footer {
      width: 3750px;
      padding: 0 160px;
      box-sizing: border-box;
      .dot_box {
        margin: 80px 0 16px;
        .dot {
          width: 60px;
          height: 60px;
          margin: 0 40px;
          border-radius: 50%;
          background-color: rgba(245, 245, 245, 0.6);
          &.active {
            background-color: #007bfc;
          }
        }
      }
      .num {
        line-height: 150px;
        font-size: 150px;
        color: rgba(245, 245, 245, 1);
        font-family: "font_8_4";
        padding: 0 140px 20px 60px;
      }
      .icon_box {
        height: 360px;
        padding-top: 14px;
        svg {
          transform: scale(10);
        }
        .like {
          color: rgb(255, 48, 64);
        }
        .comment {
          color: #fff;
        }
        .share {
          padding-top: 2px;
          color: #fff;
        }
        .collect {
          padding-right: 16px;
          color: #fff;
        }
      }
      .like_num {
        line-height: 180px;
        font-size: 150px;
        color: rgba(245, 245, 245, 1);
        font-family: "font_8_4";
        margin-bottom: 80px;
      }
      .say_box {
        margin-right: 200px;
        line-height: 200px;
        font-size: 150px;
        color: rgba(245, 245, 245, 1);
        font-family: "font_8_4";
        margin-bottom: 40px;
        .say {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .icon_good {
          transform: scale(20);
          padding: 1px 110px 0;
        }
      }
      .tag {
        line-height: 200px;
        font-size: 150px;
        color: rgba(245, 245, 245, 1);
        font-family: "font_8_4";
        color: rgba(224, 241, 255, 1);
        .more {
          color: rgba(168, 168, 168, 1);
          margin-left: 50px;
        }
      }
      .comment_num {
        line-height: 180px;
        font-size: 150px;
        color: rgba(168, 168, 168, 1);
        font-family: "font_8_4";
        margin-bottom: 40px;
      }
      .time {
        line-height: 180px;
        font-size: 130px;
        color: rgba(168, 168, 168, 1);
        font-family: "font_8_4";
        margin-bottom: 40px;

        .check {
          color: rgba(245, 245, 245, 1);
        }
      }
    }
    .home {
      width: 3750px;
      height: 430px;
      position: absolute;
      bottom: 0;
      box-sizing: border-box;
      padding: 0 300px;
      svg {
        transform: scale(10);
        color: rgba(245, 245, 245, 1);
      }
    }
  }
}
</style>
