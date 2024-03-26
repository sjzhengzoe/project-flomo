import useClipboard from "vue-clipboard3";
// 复制
export const copyLink = async (content: string) => {
  const { toClipboard } = useClipboard();
  await toClipboard(content);
};

// 下载
export const downloadBlob = (blob: Blob, fileName: string) => {
  // 创建一个临时的URL对象
  let url = URL.createObjectURL(blob);

  // 创建一个隐藏的<a>元素
  let a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;

  // 将<a>元素添加到DOM中
  document.body.appendChild(a);

  // 模拟点击<a>元素来触发下载
  a.click();

  // 清理临时的URL对象和<a>元素
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
