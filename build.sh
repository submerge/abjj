#!/bin/bash
output="./output"
static="${output}/static"
rm -rf "${static}"
fis release --md5 --domains --pack  --root "./" --dest "${output}"
rm -rf "${output}/modules"
rm -rf "${static}/modules"
rm -rf  "${static}/bower.json"
rm -rf  "${static}/map.json"
rm -rf  "${static}/package.json"

mv ${output}/index.html ${output}/aibujiangjiu.html
