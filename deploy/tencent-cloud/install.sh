#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root or with sudo: sudo bash install.sh <release.tar.gz> <domain>" >&2
  exit 1
fi

ARCHIVE="${1:-}"
DOMAIN="${2:-}"
if [[ -z "${ARCHIVE}" || -z "${DOMAIN}" || ! -f "${ARCHIVE}" ]]; then
  echo "Usage: sudo bash install.sh <release.tar.gz> <domain>" >&2
  exit 1
fi
if [[ "${DOMAIN}" != *.* || "${DOMAIN}" == *"/"* || "${DOMAIN}" == *" "* ]]; then
  echo "Domain must be a hostname, for example example.com" >&2
  exit 1
fi

for command_name in tar install useradd systemctl node caddy; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Required command is missing: ${command_name}. Install Node.js 20+ and Caddy before running this installer." >&2
    exit 1
  fi
done

RELEASE_ROOT="/srv/qiongverse/releases"
STAMP="$(date -u +%Y%m%d%H%M%S)"
RELEASE_DIR="${RELEASE_ROOT}/${STAMP}"
install -d -m 755 "${RELEASE_DIR}" /etc/qiongverse
tar -xzf "${ARCHIVE}" -C "${RELEASE_DIR}"

if [[ ! -f "${RELEASE_DIR}/server.mjs" || ! -d "${RELEASE_DIR}/dist" ]]; then
  echo "Release archive must contain server.mjs and dist/" >&2
  exit 1
fi

if ! id qiongverse >/dev/null 2>&1; then
  useradd --system --home-dir /srv/qiongverse --shell /usr/sbin/nologin qiongverse
fi
install -d -o qiongverse -g qiongverse -m 755 /srv/qiongverse
chown -R qiongverse:qiongverse "${RELEASE_DIR}"
ln -sfn "${RELEASE_DIR}" /srv/qiongverse/current

if [[ ! -f /etc/qiongverse/qiongverse.env ]]; then
  install -o root -g root -m 600 /dev/null /etc/qiongverse/qiongverse.env
  cat > /etc/qiongverse/qiongverse.env <<EOF
VITE_PUBLIC_SITE_URL=https://${DOMAIN}
SOCIAL_PUBLIC_BASE_URL=https://${DOMAIN}
LUOYIN_SERVER_HOST=127.0.0.1
LUOYIN_SERVER_PORT=8787
LUOYIN_TRUST_PROXY=1
LUOYIN_ALLOWED_ORIGINS=
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
GLM_API_KEY=
EOF
  chmod 600 /etc/qiongverse/qiongverse.env
  echo "Created /etc/qiongverse/qiongverse.env. Set GLM_API_KEY there before starting the service."
fi

install -m 644 "${RELEASE_DIR}/deploy/qiongverse.service.example" /etc/systemd/system/qiongverse.service
install -d -m 755 /etc/caddy
sed "s/qiongverse.com/${DOMAIN}/g" "${RELEASE_DIR}/deploy/Caddyfile.qiongverse.com.example" > /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile
systemctl daemon-reload
systemctl enable qiongverse
systemctl restart qiongverse
systemctl reload caddy || systemctl restart caddy

echo "Release installed at ${RELEASE_DIR}. Configure /etc/qiongverse/qiongverse.env, then verify https://${DOMAIN}/healthz."
