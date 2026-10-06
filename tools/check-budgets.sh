#!/bin/sh
# Size gate for spec 11.5. Development only.
#   tools/check-budgets.sh            (uses `hugo` on PATH; set HUGO to override)
# Fails when the CSS source or any built stylesheet exceeds 51,200 bytes, or when all
# scripts together (inline head script plus bundle, built unminified) exceed 30,720 bytes.
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd)
HUGO=${HUGO:-hugo}
CSS_CAP=51200
JS_CAP=30720
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
fail=0

src=$(cat "$REPO"/assets/css/*.css "$REPO"/assets/css/*/*.css | wc -c | tr -d ' ')
echo "CSS source (all files):      $src bytes (cap $CSS_CAP)"
[ "$src" -le "$CSS_CAP" ] || fail=1

build() { "$HUGO" --quiet --source "$REPO/exampleSite" --destination "$1" --baseURL / "$2"; }
build "$TMP/min" --minify
for f in "$TMP"/min/css/*.css; do
  n=$(wc -c < "$f" | tr -d ' ')
  echo "CSS built, minified:         $n bytes (cap $CSS_CAP)"
  [ "$n" -le "$CSS_CAP" ] || fail=1
done

HUGO_ENVIRONMENT=development build "$TMP/dev" --environment=development
bundle=$(cat "$TMP"/dev/js/*.js | wc -c | tr -d ' ')
inline=$(sed -n 's:.*<script>\(.*\)</script>.*:\1:p' "$TMP/dev/index.html" | head -n 1 | wc -c | tr -d ' ')
total=$((bundle + inline))
echo "JS bundle + inline, unminified: $total bytes (cap $JS_CAP)"
[ "$total" -le "$JS_CAP" ] || fail=1

if [ "$fail" -ne 0 ]; then echo "Budget exceeded." >&2; exit 1; fi
echo "Budgets OK."
