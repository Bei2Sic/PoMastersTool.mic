@echo off
chcp 65001 >nul
setlocal

:: ================= 配置区域 =================
set REPO_URL=git@github.com:Bei2Sic/PoMastersTool.mic.git
set REPO_NAME=PoMastersTool.mic
set DIST_DIR=dist
set TARGET_BRANCH=gh-pages
@REM set TARGET_BRANCH=test
:: ===========================================

echo [0/4] 清理旧的构建目录...
:: /s 表示删除所有子目录，/q 表示安静模式(不询问)
if exist "%DIST_DIR%" (
    rd /s /q "%DIST_DIR%"
    echo 已删除旧的 %DIST_DIR% 目录
)

echo [1/4] 开始构建项目 (注入 base 参数)...
call npm run build -- --base=/%REPO_NAME%/

if %errorlevel% neq 0 (
    echo [错误] 构建失败。
    pause
    exit /b %errorlevel%
)

echo [2/4] 进入构建目录...
cd %DIST_DIR%

echo [3/4] 初始化临时 Git 仓库...
git init
git add -A
git commit -m "deploy: update github pages"

echo [4/4] 强制推送...
git push -f %REPO_URL% master:%TARGET_BRANCH%

echo.
echo [成功] 部署完成！
cd ..
pause
