#!/bin/sh
# CSP gate. Development only.
#   tools/check-csp.sh            (uses `hugo` on PATH; set HUGO to override)
# Builds exampleSite minified, as Netlify does, then checks that every inline <script> and
# <style> in every page has its sha256 hash in the generated _headers CSP, and that no page
# carries a style="" attribute or an inline event handler (both blocked by the CSP).
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd)
HUGO=${HUGO:-hugo}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
"$HUGO" --quiet --gc --minify --source "$REPO/exampleSite" --destination "$TMP/public" --baseURL /
H="$TMP/public/_headers"
[ -f "$H" ] || { echo "No _headers: add \"headers\" to [outputs] home." >&2; exit 1; }
csp=$(grep 'Content-Security-Policy:' "$H")
fail=0
find "$TMP/public" -name '*.html' | sort > "$TMP/pages"
while read -r page; do
  for tag in script style; do
    # Inline blocks only: <script> without src, <style>.
    perl -0777 -ne 'while (/<'"$tag"'(?:\s[^>]*)?>(.*?)<\/'"$tag"'>/sg) { print $1, "\0" }' "$page" > "$TMP/blocks"
    [ -s "$TMP/blocks" ] || continue
    perl -MDigest::SHA=sha256_base64 -0 -ne 'chomp; next unless length; my $h = sha256_base64($_); $h .= "=" while length($h) % 4; print "sha256-$h\n"' "$TMP/blocks" > "$TMP/hashes"
    while read -r hash; do
      case "$csp" in
        *"'$hash'"*) ;;
        *) echo "Inline <$tag> in ${page#$TMP/public/} ($hash) is not in the CSP." >&2; fail=1 ;;
      esac
    done < "$TMP/hashes"
  done
  if grep -qE ' style=| on[a-z]+=' "$page"; then
    echo "${page#$TMP/public/} has a style attribute or inline event handler." >&2; fail=1
  fi
done < "$TMP/pages"
if [ "$fail" -ne 0 ]; then echo "CSP check failed." >&2; exit 1; fi
echo "CSP OK: $(wc -l < "$TMP/pages" | tr -d ' ') pages, every inline block hashed."
