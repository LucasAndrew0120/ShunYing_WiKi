#!/bin/bash
set -e

DEPLOY_BRANCH="gh-pages"
BUILD_DIR="site"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "错误：必须在 main 分支下运行（当前分支: $CURRENT_BRANCH）"
    exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "错误：工作区有未提交的修改，请先提交或暂存"
    exit 1
fi

echo "=== 正在用 MkDocs 构建站点 ==="
mkdocs build

echo "=== 正在部署到 $DEPLOY_BRANCH 分支 ==="

TEMP_DIR="${TMPDIR:-/tmp}/wiki-deploy-$$"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
cp -r "$BUILD_DIR"/* "$TEMP_DIR/"

if git rev-parse --verify "$DEPLOY_BRANCH" >/dev/null 2>&1; then
    git checkout "$DEPLOY_BRANCH"
    git rm -rf . 2>/dev/null || true
else
    git checkout --orphan "$DEPLOY_BRANCH"
    git rm -rf . 2>/dev/null || true
    git clean -fxd 2>/dev/null || true
fi

rm -rf ./* 2>/dev/null || true

cp -r "$TEMP_DIR"/* .
touch .nojekyll

git add -A
if git diff --cached --quiet; then
    echo "没有需要部署的变更"
else
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

if git remote get-url origin >/dev/null 2>&1; then
    git push origin "$DEPLOY_BRANCH" -f
    echo "=== 已推送到 origin/$DEPLOY_BRANCH ==="
else
    echo "=== 未配置远程仓库 origin，跳过推送 ==="
    echo "=== 请用以下命令设置远程仓库: git remote add origin <仓库地址> ==="
fi

git checkout "$CURRENT_BRANCH"
rm -rf "$TEMP_DIR"

echo "=== 部署完成 ==="
