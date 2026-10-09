#!/usr/bin/env bash
# Crawl the Wayback snapshot of coffscolorectal.com.au (id_ = original markup).
set -u
TS=20170205011220
BASE="https://web.archive.org/web/${TS}id_/http://coffscolorectal.com.au"
cd "$(dirname "$0")"

: > assets.txt

while read -r path; do
  [ -z "$path" ] && continue
  out="html/$(echo "$path" | tr '/' '_').html"
  url="$BASE/$path/"
  if [ -s "$out" ]; then echo "skip  $path"; continue; fi
  curl -fsSL --max-time 90 "$url" -o "$out.tmp" \
    && mv "$out.tmp" "$out" \
    && echo "ok    $path" \
    || { echo "FAIL  $path"; rm -f "$out.tmp"; continue; }
  # collect wp-content asset URLs (src, href, srcset, url())
  grep -oE 'https?://coffscolorectal\.com\.au/wp-content/[^"'"'"' )>]+' "$out" >> assets.txt
  sleep 1
done < urls.txt

sort -u assets.txt -o assets.txt
echo "---- distinct assets: $(wc -l < assets.txt) ----"
cat assets.txt
