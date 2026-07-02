#!/bin/bash


echo "=== 正在用 MkDocs 构建站点 ==="
mkdocs build



echo "=== 部署完成 ==="

mkdocs serve
