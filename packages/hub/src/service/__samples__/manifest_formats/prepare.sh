#!/bin/sh

__filename=`realpath $0`
__dirname=`dirname $__filename`

manifest_base="$__dirname/manifest.json"

# formats [yaml|y|json|j|props|p|csv|c|tsv|t|xml|x|base64|uri|toml|shell|s|lua|l]
formats=(
  yaml
  props
  xml
  shell
  lua
)

for format in ${formats[*]}
do
  cat $manifest_base | yq -p json -o $format > $__dirname/manifest.$format
done
