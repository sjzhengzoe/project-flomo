# 更换证书

1. 下载证书到本地 gufeifei.cn_nginx
2. 部署
3. ssh gufeifei
4. cd /etc/nginx/
5. sudo cp -r /home/ubuntu/project-flomo/gufeifei.cn_nginx .
6. sudo systemctl restart nginx
7. 打开 https://www.gufeifei.cn/

# 服务端部署

这个项目现在是同一个仓库里同时放前端和 Node 服务端：

- `/` 继续由 Nginx 读取 `dist` 里的 Vue 静态页面。
- `/api/*` 由 Nginx 反向代理到本机 Node 服务 `127.0.0.1:3000`。

本地启动服务端：

```bash
pnpm run server
```

线上首次安装 systemd 服务：

```bash
cd /home/ubuntu/project-flomo
sudo cp deploy/project-flomo-server.service /etc/systemd/system/project-flomo-server.service
sudo systemctl daemon-reload
sudo systemctl enable --now project-flomo-server
sudo cp nginx.conf /etc/nginx/conf.d/project-flomo.conf
sudo nginx -t
sudo nginx -s reload
```

验证：

```bash
curl https://www.gufeifei.cn/api/health
```
