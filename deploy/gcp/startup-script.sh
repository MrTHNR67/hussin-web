#!/bin/bash
# Startup script for Siyaj app instances (GCE instance template).
# Configuration is read from instance metadata so no secret lives in the repo.
set -euo pipefail

META="http://metadata.google.internal/computeMetadata/v1/instance/attributes"
fetch() { curl -fsS -H "Metadata-Flavor: Google" "$META/$1"; }

REPO_URL=$(fetch repo-url)
DATABASE_URL=$(fetch db-url)
DATABASE_PASSWORD=$(fetch db-password)
ADMIN_EMAILS=$(fetch admin-emails 2>/dev/null || true)

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

id -u siyaj >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin siyaj

rm -rf /opt/siyaj
git clone --depth 1 "$REPO_URL" /opt/siyaj
cd /opt/siyaj
npm ci --omit=dev --no-audit --no-fund

mkdir -p /srv/siyaj-data
cat > /etc/siyaj.env <<EOF
PORT=3000
NODE_ENV=deployment
DATABASE_URL=$DATABASE_URL
DATABASE_PASSWORD=$DATABASE_PASSWORD
SIYAJ_DATA_DIR=/srv/siyaj-data
SIYAJ_ADMIN_EMAILS=$ADMIN_EMAILS
EOF
chmod 600 /etc/siyaj.env

cat > /etc/systemd/system/siyaj.service <<'EOF'
[Unit]
Description=Siyaj Solar Guardian
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=siyaj
WorkingDirectory=/opt/siyaj
EnvironmentFile=/etc/siyaj.env
ExecStart=/usr/bin/node server.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

chown -R siyaj:siyaj /opt/siyaj /srv/siyaj-data
systemctl daemon-reload
systemctl enable --now siyaj
sleep 3
systemctl is-active siyaj
