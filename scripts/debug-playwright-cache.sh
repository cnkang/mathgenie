#!/bin/bash

# Debug Playwright Cache Script
# Helps debug cache issues in CI/CD environments
# Helps debug Playwright browser cache issues in CI/CD environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to print section header
print_section() {
    local title=$1
    echo
    print_status $CYAN "=========================================="
    print_status $CYAN "  $title"
    print_status $CYAN "=========================================="
}

# Function to check environment
check_environment() {
    print_section "Environment Information"
    
    print_status $BLUE "🔍 Operating System:"
    uname -a
    
    print_status $BLUE "🔍 Node.js Version:"
    node --version
    
    print_status $BLUE "🔍 pnpm Version:"
    pnpm --version
    
    print_status $BLUE "🔍 Playwright Version:"
    pnpm exec playwright --version
    
    print_status $BLUE "🔍 Environment Variables:"
    echo "CI: ${CI:-not set}"
    echo "PLAYWRIGHT_BROWSERS_PATH: ${PLAYWRIGHT_BROWSERS_PATH:-not set}"
    echo "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: ${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-not set}"
    echo "CACHE_HIT: ${CACHE_HIT:-not set}"
}

# Function to check cache directories
check_cache_directories() {
    print_section "Cache Directory Analysis"
    
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
        print_status $BLUE "📁 Checking: $dir"
        
        if [ -d "$dir" ]; then
            print_status $GREEN "  ✅ Directory exists"
            
            # Check size
            local size=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "unknown")
            print_status $GREEN "  📊 Size: $size"
            
            # List contents
            print_status $BLUE "  📋 Contents:"
            ls -la "$dir" 2>/dev/null | head -10 || echo "    (empty or inaccessible)"
            
            # Check for browser directories
            local browser_count=$(find "$dir" -maxdepth 2 -type d -name "*webkit*" -o -name "*chromium*" -o -name "*firefox*" 2>/dev/null | wc -l)
            print_status $GREEN "  🌐 Browser directories found: $browser_count"
            
        else
            print_status $RED "  ❌ Directory does not exist"
        fi
        echo
    done
}

# Cache for dry-run outputs to avoid repeated expensive calls
declare -A DRY_RUN_CACHE

# Reusable function to check if a browser is installed
is_browser_installed() {
    local browser="$1"
    
    # Use cached result if available
    if [[ -n "${DRY_RUN_CACHE[$browser]}" ]]; then
        local dry_run_output="${DRY_RUN_CACHE[$browser]}"
    else
        local dry_run_output=$(pnpm exec playwright install --dry-run "$browser" 2>&1)
        DRY_RUN_CACHE[$browser]="$dry_run_output"
    fi
    
    # Method 1: Check for "is already installed" message
    if echo "$dry_run_output" | grep -q "is already installed"; then
        return 0
    fi
    
    # Method 2: Check if dry-run shows no download URLs (means already installed)
    if ! echo "$dry_run_output" | grep -q "Download url:"; then
        return 0
    fi
    
    # Method 3: Check cache directory for browser files
    local cache_dir=""
    if [[ "$OSTYPE" == "darwin"* ]]; then
        cache_dir="$HOME/Library/Caches/ms-playwright"
    else
        cache_dir="$HOME/.cache/ms-playwright"
    fi
    
    if [ -d "$cache_dir" ] && find "$cache_dir" -name "*$browser*" -type d | grep -q "$browser"; then
        return 0
    fi
    
    return 1
}

# Function to check browser installations
check_browser_installations() {
    print_section "Browser Installation Status"
    
    local browsers=("chromium" "firefox" "webkit")
    
    for browser in "${browsers[@]}"; do
        print_status $BLUE "🔍 Checking $browser..."
        
        if is_browser_installed "$browser"; then
            print_status $GREEN "  ✅ $browser is installed and available"
        else
            print_status $RED "  ❌ $browser is not installed or not available"
        fi
        
        # Try to get browser path using cached result
        local dry_run_output="${DRY_RUN_CACHE[$browser]}"
        local browser_path=$(echo "$dry_run_output" | grep "Install location:" | head -1 | sed 's/.*Install location: *//' || echo "unknown")
        print_status $BLUE "  📍 Expected path: $browser_path"
        
        echo
    done
}

# Function to analyze cache effectiveness
analyze_cache_effectiveness() {
    print_section "Cache Effectiveness Analysis"
    
    local cache_hit=${CACHE_HIT:-"unknown"}
    print_status $BLUE "🔍 Cache Hit Status: $cache_hit"
    
    if [ "$cache_hit" = "true" ]; then
        print_status $GREEN "✅ Cache was reported as HIT"
        
        # Verify if browsers are actually available using the same logic as cache helper
        local available_browsers=0
        local total_browsers=3
        
        for browser in "chromium" "firefox" "webkit"; do
            if is_browser_installed "$browser"; then
                ((available_browsers++))
            fi
        done
        
        local effectiveness=$((available_browsers * 100 / total_browsers))
        print_status $BLUE "📊 Cache Effectiveness: $effectiveness% ($available_browsers/$total_browsers browsers available)"
        
        if [ $effectiveness -eq 100 ]; then
            print_status $GREEN "🎉 Cache is 100% effective!"
        elif [ $effectiveness -gt 0 ]; then
            print_status $YELLOW "⚠️ Cache is partially effective"
        else
            print_status $RED "❌ Cache is not effective (no browsers available despite cache hit)"
        fi
        
    elif [ "$cache_hit" = "false" ]; then
        print_status $YELLOW "❌ Cache was reported as MISS"
        print_status $BLUE "💡 This is expected for first runs or when cache keys change"
    else
        print_status $YELLOW "⚠️ Cache hit status is unknown"
    fi
}

# Function to provide recommendations
provide_recommendations() {
    print_section "Recommendations"
    
    local cache_hit=${CACHE_HIT:-"unknown"}
    local available_browsers=0
    
    for browser in "chromium" "firefox" "webkit"; do
        if is_browser_installed "$browser"; then
            ((available_browsers++))
        fi
    done
    
    if [ "$cache_hit" = "true" ] && [ $available_browsers -eq 3 ]; then
        print_status $GREEN "✅ Cache is working perfectly! No action needed."
    elif [ "$cache_hit" = "true" ] && [ $available_browsers -gt 0 ]; then
        print_status $YELLOW "⚠️ Cache is partially working:"
        print_status $BLUE "  • Some browsers are available from cache"
        print_status $BLUE "  • Missing browsers will be installed individually"
        print_status $BLUE "  • This is normal and efficient"
    elif [ "$cache_hit" = "true" ] && [ $available_browsers -eq 0 ]; then
        print_status $RED "❌ Cache hit but no browsers available:"
        print_status $BLUE "  • Cache key might be incorrect"
        print_status $BLUE "  • Cache paths might be wrong"
        print_status $BLUE "  • Browser installation might have failed previously"
        print_status $BLUE "  • Consider updating cache key version"
    elif [ "$cache_hit" = "false" ]; then
        print_status $BLUE "ℹ️ Cache miss is normal for:"
        print_status $BLUE "  • First runs"
        print_status $BLUE "  • Dependency updates"
        print_status $BLUE "  • Configuration changes"
        print_status $BLUE "  • Cache expiration"
    else
        print_status $YELLOW "⚠️ Unable to determine cache status"
        print_status $BLUE "  • Check CI environment variables"
        print_status $BLUE "  • Verify cache configuration"
    fi
    
    echo
    print_status $BLUE "💡 General Tips:"
    print_status $BLUE "  • Include Playwright config files in cache key"
    print_status $BLUE "  • Use version suffix in cache key for major changes"
    print_status $BLUE "  • Monitor cache hit rates in CI logs"
    print_status $BLUE "  • Verify browser availability before running tests"
}

# Function to generate cache key info
generate_cache_key_info() {
    print_section "Cache Key Information"
    
    print_status $BLUE "🔑 Current cache key components:"
    
    # Simulate cache key generation
    local os=$(uname -s)
    print_status $BLUE "  • OS: $os"
    
    if [ -f "pnpm-lock.yaml" ]; then
        local pnpm_hash=$(sha256sum pnpm-lock.yaml | cut -d' ' -f1 | head -c 8)
        print_status $BLUE "  • pnpm-lock.yaml hash: $pnpm_hash..."
    fi
    
    if [ -f "package.json" ]; then
        local pkg_hash=$(sha256sum package.json | cut -d' ' -f1 | head -c 8)
        print_status $BLUE "  • package.json hash: $pkg_hash..."
    fi
    
    local config_files=$(find . -name "playwright*.config.ts" -type f 2>/dev/null)
    if [ -n "$config_files" ]; then
        print_status $BLUE "  • Playwright config files:"
        for config in $config_files; do
            local config_hash=$(sha256sum "$config" | cut -d' ' -f1 | head -c 8)
            print_status $BLUE "    - $config: $config_hash..."
        done
    fi
    
    print_status $BLUE "💡 Recommended cache key format:"
    print_status $BLUE "  \${{ runner.os }}-playwright-\${{ matrix.browser }}-\${{ hashFiles('**/pnpm-lock.yaml', '**/package.json', '**/playwright*.config.ts') }}-v2"
}

# Main function
main() {
    print_status $CYAN "🎭 Playwright Cache Debug Tool"
    print_status $CYAN "=============================="
    
    check_environment
    check_cache_directories
    check_browser_installations
    analyze_cache_effectiveness
    generate_cache_key_info
    provide_recommendations
    
    print_section "Debug Complete"
    print_status $GREEN "✅ Debug analysis completed!"
    print_status $BLUE "💡 Use this information to optimize your cache configuration."
}

# Run main function
main "$@"