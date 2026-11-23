#!/usr/bin/env bash
# Rebuild the Source Serif 4 web fonts in src/assets/fonts.
#
# The Google Fonts build of Source Serif 4 ships without small caps or
# old-style figures, and the page uses both. This script starts from
# Adobe's own variable fonts (SIL OFL 1.1) and writes three files:
#
#   source-serif-4-text-roman    optical size 20, weight 350-650
#   source-serif-4-text-italic   optical size 20, weight 350-650
#   source-serif-4-display       optical size 60, weight 350-650, basic Latin
#
# The optical-size axis is pinned, not shipped, so the page uses the
# two masters as drawn: text for everything set small, display for the
# two largest headings. Upstream's full axis renders correctly wherever
# glyphs are positioned at sub-pixel precision (macOS, iOS, Windows).
# Under a hinted Linux renderer, which snaps advances to whole pixels,
# the caption end of the axis closed the space after a comma or full
# stop ("of it.This one") in our tests, and the text master did not.
# Pinning costs the caption cut and buys the same spacing everywhere,
# in files less than half the size.
#
# Needs: curl, uv (https://docs.astral.sh/uv/). Run from the repo root.
set -euo pipefail

out="src/assets/fonts"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

release="https://github.com/adobe-fonts/source-serif/raw/release/VAR"
unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,\
U+2009,U+200A,U+2010-2015,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,\
U+2032-2033,U+2039-203A,U+2044,U+2070,U+2074-2079,U+2080-2089,U+20AC,U+2116,\
U+2122,U+2190-2193,U+2212,U+2215,U+221E,U+2248,U+2260,U+2264-2265,\
U+0394,U+03B1,U+03C3,U+2016,U+207B,U+221A"
features="kern,liga,ccmp,locl,mark,mkmk,smcp,c2sc,onum,lnum,tnum,pnum,sups,sinf,case,zero,frac,numr,dnom,ordn"

uv venv -q "$work/venv"
uv pip install -q --python "$work/venv/bin/python" fonttools brotli
py="$work/venv/bin/python"

display_unicodes="U+0020-007E,U+00A0,U+2013-2014,U+2018-2019,U+201C-201D,U+2026"
display_features="kern,liga,ccmp,lnum,pnum"

for style in Roman Italic; do
  curl -fsSL -o "$work/$style.ttf" "$release/SourceSerif4Variable-$style.ttf"
  lower="$(printf '%s' "$style" | tr '[:upper:]' '[:lower:]')"
  "$py" -I -m fontTools.varLib.instancer "$work/$style.ttf" wght=350:650 opsz=20 -q -o "$work/$style-text.ttf"
  "$py" -I -m fontTools.subset "$work/$style-text.ttf" \
    --unicodes="$unicodes" \
    --layout-features="$features" \
    --flavor=woff2 \
    --output-file="$out/source-serif-4-text-$lower.woff2"
done

"$py" -I -m fontTools.varLib.instancer "$work/Roman.ttf" wght=350:650 opsz=60 -q -o "$work/display.ttf"
"$py" -I -m fontTools.subset "$work/display.ttf" \
  --unicodes="$display_unicodes" \
  --layout-features="$display_features" \
  --flavor=woff2 \
  --output-file="$out/source-serif-4-display.woff2"

ls -l "$out"
