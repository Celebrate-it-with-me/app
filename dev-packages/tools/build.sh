#!/bin/sh
# Builds dev-packages/<slug>/<version>/ast.json from its HTML with the server builder (needs the cwm_api container).
# usage: dev-packages/tools/build.sh <slug> <version> [path to the API worktree with the builder]
set -e
APP="$(cd "$(dirname "$0")/../.." && pwd)"
LIB="${3:-/home/hhcarmenate/cwm/cwm_api/.worktrees/tpkgapi}/app/Support/TemplatePackage"
T=/tmp/tpkg-build
docker exec cwm_api sh -c "rm -rf $T && mkdir -p $T"
docker cp "$LIB" cwm_api:$T/lib
docker cp "$APP/dev-packages/$1/$2" cwm_api:$T/pkg
docker cp "$APP/dev-packages/tools/build-ast.php" cwm_api:$T/build-ast.php
set +e
docker exec cwm_api php $T/build-ast.php $T/lib $T/pkg
code=$?
set -e
docker cp cwm_api:$T/pkg/ast.json "$APP/dev-packages/$1/$2/ast.json" 2>/dev/null || true
exit $code
