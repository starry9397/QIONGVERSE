# Tencent Cloud Lighthouse/CVM deployment

This release path targets an Ubuntu Tencent Cloud Lighthouse or CVM instance with a public DNS name. It uses Caddy for HTTPS/static files and systemd for `server.mjs`.

## Prepare the host

1. Create an Ubuntu 22.04 or 24.04 instance.
2. Allow TCP 22, 80, and 443 in the Tencent Cloud security group. Do not expose TCP 8787.
3. Point the domain A record at the instance and wait for DNS to resolve.
4. Copy the generated release archive to the host, then run the installer as a sudo-capable SSH user:

```bash
sudo bash install.sh /tmp/qiongverse-release.tar.gz example.com
```

The installer creates `/srv/qiongverse/current`, the `qiongverse` system user, the systemd unit, and the Caddy site. It does not create or modify secrets.

## Configure the API secret

Edit the host-only file and set the key through a protected editor or secret-management workflow:

```bash
sudo install -m 600 /dev/null /etc/qiongverse/qiongverse.env
sudoedit /etc/qiongverse/qiongverse.env
```

Use the values below, replacing only the domain and secret values:

```text
VITE_PUBLIC_SITE_URL=https://example.com
SOCIAL_PUBLIC_BASE_URL=https://example.com
LUOYIN_SERVER_HOST=127.0.0.1
LUOYIN_SERVER_PORT=8787
LUOYIN_TRUST_PROXY=1
LUOYIN_ALLOWED_ORIGINS=
GLM_API_KEY=
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

Never place this file in the release archive or Git repository. OAuth variables stay unset until their own provider review is complete.

## Start and verify

```bash
sudo systemctl enable --now qiongverse
sudo systemctl reload caddy
curl -fsS https://example.com/healthz
curl -fsS https://example.com/api/luoyin/status
curl -fsS https://example.com/api/social/status
```

From the repository checkout, run:

```powershell
npm run verify:deployment -- https://example.com
```

The free-form GLM response must never be treated as an official policy or booking result. Caddy and the Node service only expose the existing bounded API contract.
