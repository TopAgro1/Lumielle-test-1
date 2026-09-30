#!/bin/sh
# Arma dist/tema-convertible-<versión>.zip con las carpetas del tema en la raíz (lo que pide Shopify al subir un tema).
set -e
cd "$(dirname "$0")/../tema-convertible"
VERSION=$(python3 -c "import json;print(json.load(open('config/settings_schema.json'))[0]['theme_version'])")
mkdir -p ../dist
rm -f "../dist/tema-convertible-$VERSION.zip"
zip -rq -X "../dist/tema-convertible-$VERSION.zip" assets config layout locales sections snippets templates
echo "dist/tema-convertible-$VERSION.zip"
