#!/bin/bash

# SecureFiles 客户端应用构建脚本
# 支持三大平台桌面端和移动端构建

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查构建依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 构建桌面端客户端
build_desktop_client() {
    local platform=$1
    
    log_info "开始构建桌面端客户端 (${platform})..."
    
    cd client-app
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装桌面端依赖..."
        npm install
    fi
    
    # 构建应用
    log_info "构建应用..."
    npm run build
    
    # 打包分发
    case $platform in
        "win")
            log_info "打包 Windows 应用..."
            npm run dist:win
            ;;
        "mac")
            log_info "打包 macOS 应用..."
            npm run dist:mac
            ;;
        "linux")
            log_info "打包 Linux 应用..."
            npm run dist:linux
            ;;
        "all")
            log_info "打包所有平台应用..."
            npm run dist:win
            npm run dist:mac
            npm run dist:linux
            ;;
        *)
            log_error "不支持的平台: $platform"
            exit 1
            ;;
    esac
    
    cd ..
    log_success "桌面端客户端构建完成"
}

# 构建移动端客户端
build_mobile_client() {
    local platform=$1
    
    log_info "开始构建移动端客户端 (${platform})..."
    
    cd mobile-app
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装移动端依赖..."
        npm install
    fi
    
    case $platform in
        "ios")
            log_info "构建 iOS 应用..."
            # 检查 Xcode
            if ! command -v xcodebuild &> /dev/null; then
                log_error "Xcode 未安装或未配置"
                exit 1
            fi
            npm run build:ios
            ;;
        "android")
            log_info "构建 Android 应用..."
            # 检查 Android SDK
            if [ -z "$ANDROID_HOME" ]; then
                log_error "ANDROID_HOME 环境变量未设置"
                exit 1
            fi
            npm run build:android
            ;;
        "all")
            log_info "构建所有移动端应用..."
            npm run build:ios
            npm run build:android
            ;;
        *)
            log_error "不支持的平台: $platform"
            exit 1
            ;;
    esac
    
    cd ..
    log_success "移动端客户端构建完成"
}

# 清理构建文件
clean_build() {
    log_info "清理构建文件..."
    
    # 清理桌面端
    if [ -d "client-app/dist" ]; then
        rm -rf client-app/dist
        log_info "清理桌面端构建文件"
    fi
    
    # 清理移动端
    if [ -d "mobile-app/android/app/build" ]; then
        rm -rf mobile-app/android/app/build
        log_info "清理 Android 构建文件"
    fi
    
    if [ -d "mobile-app/ios/build" ]; then
        rm -rf mobile-app/ios/build
        log_info "清理 iOS 构建文件"
    fi
    
    log_success "构建文件清理完成"
}

# 显示帮助信息
show_help() {
    echo "SecureFiles 客户端应用构建脚本"
    echo ""
    echo "用法: $0 [选项] [平台]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -c, --clean    清理构建文件"
    echo "  -d, --desktop  构建桌面端客户端"
    echo "  -m, --mobile   构建移动端客户端"
    echo "  -a, --all      构建所有客户端"
    echo ""
    echo "平台:"
    echo "  桌面端: win, mac, linux, all"
    echo "  移动端: ios, android, all"
    echo ""
    echo "示例:"
    echo "  $0 -d win       构建 Windows 桌面端"
    echo "  $0 -m ios       构建 iOS 移动端"
    echo "  $0 -a all       构建所有平台"
    echo "  $0 -c           清理构建文件"
}

# 主函数
main() {
    local action=""
    local platform=""
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--clean)
                action="clean"
                shift
                ;;
            -d|--desktop)
                action="desktop"
                shift
                if [[ $# -gt 0 ]]; then
                    platform=$1
                    shift
                fi
                ;;
            -m|--mobile)
                action="mobile"
                shift
                if [[ $# -gt 0 ]]; then
                    platform=$1
                    shift
                fi
                ;;
            -a|--all)
                action="all"
                shift
                if [[ $# -gt 0 ]]; then
                    platform=$1
                    shift
                fi
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查参数
    if [ -z "$action" ]; then
        log_error "请指定构建操作"
        show_help
        exit 1
    fi
    
    # 执行操作
    case $action in
        "clean")
            clean_build
            ;;
        "desktop")
            if [ -z "$platform" ]; then
                log_error "请指定桌面端平台"
                exit 1
            fi
            check_dependencies
            build_desktop_client $platform
            ;;
        "mobile")
            if [ -z "$platform" ]; then
                log_error "请指定移动端平台"
                exit 1
            fi
            check_dependencies
            build_mobile_client $platform
            ;;
        "all")
            if [ -z "$platform" ]; then
                platform="all"
            fi
            check_dependencies
            build_desktop_client $platform
            build_mobile_client $platform
            ;;
    esac
    
    log_success "所有构建任务完成！"
}

# 运行主函数
main "$@" 