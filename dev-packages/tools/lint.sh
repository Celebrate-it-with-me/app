#!/bin/sh
# Validates dev-packages/<slug>/<version> with the server validator (templates:lint) as a zip, like a designer's upload.
# The dev-only files (package.json, ast.json) are left out of the zip.
# usage: dev-packages/tools/lint.sh <slug> <version> [extra templates:lint options]  (API checkout inside cwm_api: TPKG_API, default /var/www/html)
set -e
APP="$(cd "$(dirname "$0")/../.." && pwd)"
slug=$1; ver=$2; shift 2
WT=${TPKG_API:-/var/www/html}
ZIP="/tmp/claude-1000/pkg-$slug-$ver.zip"; mkdir -p "$(dirname "$ZIP")"; rm -f "$ZIP"
(cd "$APP/dev-packages/$slug/$ver" && zip -qr "$ZIP" . -x package.json ast.json)
docker cp "$ZIP" cwm_api:/tmp/pkg-$slug-$ver.zip
docker exec -w "$WT" cwm_api php artisan templates:lint /tmp/pkg-$slug-$ver.zip "$@"
echo "zip: $ZIP"
