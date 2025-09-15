#!/bin/bash

# Playwright Cache Helper Script
# Helps manage and verify Playwright browser installations in CI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a browser is installed
# Uses shared logic from debug script for consistency
check_browser() {
    local browser=$1
    print_status $BLUE "🔍 Checking $browser installation..."
    
    # Use the same comprehensive logic as debug script
    local dry_run_output=$(pnpm exec playwright install --dry-run $browser 2>&1)
    local is_installed=false
    
    # Method 1: Check for "is already installed" message
    if echo "$dry_run_output" | grep -q "is already installed"; then
        is_installed=true
    fi
    
    # Method 2: Check if dry-run shows no download URLs (means already installed)
    if ! echo "$dry_run_output" | grep -q "Download url:"; then
        is_installed=true
    fi
    
    # Method 3: Check cache directory for browser files
    local cache_dir=""
    if [[ "$OSTYPE" == "darwin"* ]]; then
        cache_dir="$HOME/Library/Caches/ms-playwright"
    else
        cache_dir="$HOME/.cache/ms-playwright"
    fi
    
    if [ -d "$cache_dir" ] && find "$cache_dir" -name "*$browser*" -type d | grep -q "$browser"; then
        is_installed=true
    fi
    
    if [ "$is_installed" = true ]; then
        print_status $GREEN "✅ $browser is installed and available"
        return 0
    else
        print_status $YELLOW "❌ $browser is not installed"
        return 1
    fi
}

# Function to install a browser
install_browser() {
    local browser=$1
    print_status $BLUE "📦 Installing $browser..."
    
    if pnpm exec playwright install $browser --with-deps; then
        print_status $GREEN "✅ $browser installation completed"
        return 0
    else
        print_status $RED "❌ $browser installation failed"
        return 1
    fi
}

# Function to verify cache directories
verify_cache_dirs() {
    print_status $BLUE "🔍 Verifying cache directories..."
    
    # Determine OS-specific cache directories
    local cache_dirs=()
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS paths
        cache_dirs=(
            "$HOME/Library/Caches/ms-playwright"
            "$HOME/.local/share/ms-playwright"
            "node_modules/playwright-core/.local-browsers"
        )
    else
        # Linux paths
        cache_dirs=(
            "$HOME/.cache/ms-playwright"
            "$HOME/.local/share/ms-playwright"
            "node_modules/playwright-core/.local-browsers"
        )
    fi
    
    for dir in "${cache_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_status $GREEN "✅ Found: $dir"
            ls -la "$dir" 2>/dev/null | head -5 || true
        else
            print_status $YELLOW "❌ Missing: $dir"
        fi
    done
}

# Function to get cache size
get_cache_size() {
    print_status $BLUE "📊 Calculating cache size..."
    
    # Determine OS-specific cache directories
    local cache_dirs=()
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS paths
        cache_dirs=(
            "$HOME/Library/Caches/ms-playwright"
            "$HOME/.local/share/ms-playwright"
            "node_modules/playwright-core/.local-browsers"
        )
    else
        # Linux paths
        cache_dirs=(
            "$HOME/.cache/ms-playwright"
            "$HOME/.local/share/ms-playwright"
            "node_modules/playwright-core/.local-browsers"
        )
    fi
    
    for dir in "${cache_dirs[@]}"; do
        if [ -d "$dir" ]; then
            local size=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0")
            print_status $GREEN "📁 $dir: $size"
        fi
    done
}

# Main function
main() {
    local action=${1:-"check"}
    local browser=${2:-"all"}
    
    print_status $BLUE "🎭 Playwright Cache Helper"
    print_status $BLUE "Action: $action, Browser: $browser"
    echo
    
    case $action in
        "check")
            verify_cache_dirs
            echo
            
            if [ "$browser" = "all" ]; then
                local browsers=("chromium" "firefox" "webkit")
                for b in "${browsers[@]}"; do
                    check_browser $b
                done
            else
                check_browser $browser
            fi
            
            echo
            get_cache_size
            ;;
            
        "install")
            if [ "$browser" = "all" ]; then
                local browsers=("chromium" "firefox" "webkit")
                for b in "${browsers[@]}"; do
                    if ! check_browser $b; then
                        install_browser $b
                    fi
                done
            else
                if ! check_browser $browser; then
                    install_browser $browser
                fi
            fi
            ;;
            
        "smart-install")
            # Smart install: only install if not cached or cache is invalid
            local cache_hit=${CACHE_HIT:-"false"}
            
            if [ "$cache_hit" = "true" ]; then
                print_status $GREEN "✅ Cache hit detected, verifying browsers..."
                
                if [ "$browser" = "all" ]; then
                    local browsers=("chromium" "firefox" "webkit")
                    local missing_browsers=()
                    
                    for b in "${browsers[@]}"; do
                        if ! check_browser $b; then
                            missing_browsers+=($b)
                        fi
                    done
                    
                    if [ ${#missing_browsers[@]} -eq 0 ]; then
                        print_status $GREEN "🎉 All browsers available from cache!"
                    else
                        print_status $YELLOW "⚠️ Installing missing browsers: ${missing_browsers[*]}"
                        for b in "${missing_browsers[@]}"; do
                            install_browser $b
                        done
                    fi
                else
                    if ! check_browser $browser; then
                        install_browser $browser
                    else
                        print_status $GREEN "🎉 $browser available from cache!"
                    fi
                fi
            else
                print_status $YELLOW "❌ Cache miss, installing browsers..."
                if [ "$browser" = "all" ]; then
                    local browsers=("chromium" "firefox" "webkit")
                    for b in "${browsers[@]}"; do
                        install_browser $b
                    done
                else
                    install_browser $browser
                fi
            fi
            ;;
            
        "clean")
            print_status $YELLOW "🧹 Cleaning Playwright cache..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS paths
                rm -rf "$HOME/Library/Caches/ms-playwright" || true
                rm -rf "$HOME/.local/share/ms-playwright" || true
            else
                # Linux paths
                rm -rf "$HOME/.cache/ms-playwright" || true
                rm -rf "$HOME/.local/share/ms-playwright" || true
            fi
            rm -rf "node_modules/playwright-core/.local-browsers" || true
            print_status $GREEN "✅ Cache cleaned"
            ;;
            
        *)
            print_status $RED "❌ Unknown action: $action"
            echo "Usage: $0 [check|install|smart-install|clean] [browser|all]"
            echo "Examples:"
            echo "  $0 check all"
            echo "  $0 install webkit"
            echo "  $0 smart-install chromium"
            echo "  $0 clean"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"