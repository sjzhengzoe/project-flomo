# human_draft

同一个仓库包含微信小程序和 Node 服务端：

- `src/`：微信小程序代码
- `server/`：Node 服务端代码
- `public/`：由 Nginx 提供给小程序使用的菜单图片等静态素材
- `project.config.json`：微信开发者工具项目配置

微信开发者工具直接打开仓库根目录。本地服务端使用：

```bash
pnpm run server
```

## 更换证书

1. 下载证书到本地 gufeifei.cn_nginx
2. 部署
3. ssh gufeifei
4. cd /etc/nginx/
5. sudo cp -r /home/ubuntu/human_draft/gufeifei.cn_nginx .
6. sudo systemctl restart nginx
7. 打开 https://www.gufeifei.cn/

## 服务端部署

Nginx 从 `public/` 提供静态素材，并将 `/api/*` 反向代理到本机 Node 服务 `127.0.0.1:3000`。

线上首次安装 systemd 服务：

```bash
cd /home/ubuntu/human_draft
sudo cp deploy/human-draft-server.service /etc/systemd/system/human-draft-server.service
sudo systemctl daemon-reload
sudo systemctl enable --now human-draft-server
sudo cp nginx.conf /etc/nginx/conf.d/human-draft.conf
sudo nginx -t
sudo nginx -s reload
```

从旧名称迁移时，先停止并禁用旧服务，再启用新服务：

```bash
sudo systemctl disable --now project-flomo-server
sudo rm -f /etc/systemd/system/project-flomo-server.service
sudo systemctl daemon-reload
```

验证：

```bash
curl https://www.gufeifei.cn/api/health
```
