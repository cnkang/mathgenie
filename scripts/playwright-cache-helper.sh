#!/bin/bash

# Playwright Cache Helper Script
# Helps manage and verify Playwright browser installations in CI

set -e

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Supported browsers
readonly BROWSERS=("chromium" "firefox" "webkit")

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to get cache directory based on OS
get_primary_cache_dir() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "$HOME/Library/Caches/ms-playwright"
    else
        echo "$HOME/.cache/ms-playwright"
    fi
}

# Function to check if browser is installed via dry-run output
is_browser_installed_via_dry_run() {
    local browser=$1
    local dry_run_output
    
    print_status "$BLUE" "   🔍 Running dry-run check for $browser..."
    dry_run_output=$(pnpm exec playwright install --dry-run "$browser" 2>&1)
    
    # Show relevant parts of dry-run output for debugging
    echo "$dry_run_output" | grep -E "(already installed|Download url|Install location)" | head -5
    
    # Check for "is already installed" message or absence of download URLs
    if echo "$dry_run_output" | grep -q "is already installed"; then
        print_status "$GREEN" "   ✅ Dry-run confirms $browser is already installed"
        return 0
    fi
    
    if ! echo "$dry_run_output" | grep -q "Download url:"; then
        print_status "$GREEN" "   ✅ Dry-run shows no download needed for $browser"
        return 0
    fi
    
    print_status "$YELLOW" "   ❌ Dry-run indicates $browser needs to be downloaded"
    return 1
}

# Function to check if browser exists in any cache directory
is_browser_in_cache() {
    local browser=$1
    
    print_status "$BLUE" "   🔍 Checking cache directories for $browser..."
    
    # Check all possible cache directories
    while IFS= read -r dir; do
        print_status "$BLUE" "   📁 Checking: $dir"
        if [[ -d "$dir" ]]; then
            local browser_dirs
            browser_dirs=$(find "$dir" -name "*$browser*" -type d 2>/dev/null)
            if [[ -n "$browser_dirs" ]]; then
                print_status "$GREEN" "   ✅ Found $browser in: $dir"
                echo "$browser_dirs" | head -3
                return 0
            else
                print_status "$YELLOW" "   ❌ No $browser found in: $dir"
            fi
        else
            print_status "$YELLOW" "   ❌ Directory does not exist: $dir"
        fi
    done < <(get_cache_directories)
    
    return 1
}

# Function to check if a browser is installed
check_browser() {
    local browser=$1
    print_status "$BLUE" "🔍 Checking $browser installation..."
    
    # Check via multiple methods for reliability
    # First check cache directories (faster)
    if is_browser_in_cache "$browser"; then
        print_status "$GREEN" "✅ $browser is installed and available (found in cache)"
        return 0
    fi
    
    # Then check via dry-run (more reliable but slower)
    if is_browser_installed_via_dry_run "$browser"; then
        print_status "$GREEN" "✅ $browser is installed and available (verified via dry-run)"
        return 0
    fi
    
    print_status "$YELLOW" "❌ $browser is not installed"
    return 1
}

# Function to install a browser
install_browser() {
    local browser=$1
    print_status "$BLUE" "📦 Installing $browser..."
    
    if pnpm exec playwright install "$browser" --with-deps; then
        print_status "$GREEN" "✅ $browser installation completed"
        return 0
    else
        print_status "$RED" "❌ $browser installation failed"
        return 1
    fi
}

# Function to get browser list based on input
get_browser_list() {
    local browser_input=$1
    if [ "$browser_input" = "all" ]; then
        printf '%s\n' "${BROWSERS[@]}"
    else
        echo "$browser"
    fi
}

# Function to check and install browsers if needed
check_and_install_browsers() {
    local browser_list=($@)
    
    for browser in "${browser_list[@]}"; do
        if ! check_browser "$browser"; then
            install_browser "$browser"
        fi
    done
}

# Function to install all browsers
install_all_browsers() {
    local browser_list=($@)
    
    for browser in "${browser_list[@]}"; do
        install_browser "$browser"
    done
}

# Function to verify cache directories
verify_cache_dirs() {
    print_status "$BLUE" "🔍 Verifying cache directories..."
    
    while IFS= read -r dir; do
        if [[ -d "$dir" ]]; then
            print_status "$GREEN" "✅ Found: $dir"
            local file_count
            file_count=$(find "$dir" -maxdepth 2 -type d 2>/dev/null | wc -l)
            print_status "$BLUE" "   📁 Contains $file_count directories"
            find "$dir" -maxdepth 2 -name "*chromium*" -o -name "*firefox*" -o -name "*webkit*" 2>/dev/null | head -3 || true
        else
            print_status "$YELLOW" "❌ Missing: $dir"
        fi
    done < <(get_cache_directories)
}

# Function to get OS-specific cache directories
get_cache_directories() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS paths
        echo "$HOME/Library/Caches/ms-playwright"
        echo "$HOME/.local/share/ms-playwright"
        echo "node_modules/playwright-core/.local-browsers"
    else
        # Linux paths
        echo "$HOME/.cache/ms-playwright"
        echo "$HOME/.local/share/ms-playwright"
        echo "node_modules/playwright-core/.local-browsers"
    fi
}

# Function to get cache size
get_cache_size() {
    print_status "$BLUE" "📊 Calculating cache size..."
    
    while IFS= read -r dir; do
        if [[ -d "$dir" ]]; then
            local size
            size=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0")
            print_status "$GREEN" "📁 $dir: $size"
        fi
    done < <(get_cache_directories)
}

# Populates the BROWSER_LIST array based on input
populate_browser_list() {
    local browser_input=$1
    BROWSER_LIST=()
    while IFS= read -r b; do
        BROWSER_LIST+=("$b")
    done < <(get_browser_list "$browser_input")
}

# Function to handle check action
handle_check_action() {
    local browser=$1
    
    verify_cache_dirs
    echo
    
    while IFS= read -r b; do
        check_browser "$b"
    done < <(get_browser_list "$browser")
    
    echo
    get_cache_size
}

# Function to handle install action
handle_install_action() {
    local browser=$1
    populate_browser_list "$browser"
    check_and_install_browsers "${BROWSER_LIST[@]}"
}

# Function to handle smart install with cache hit
handle_cache_hit() {
    local browser=$1
    
    print_status "$GREEN" "✅ Cache hit detected, verifying browsers..."
    
    populate_browser_list "$browser"
    
    local missing_browsers=()
    for b in "${BROWSER_LIST[@]}"; do
        if ! check_browser "$b"; then
            missing_browsers+=("$b")
        fi
    done
    
    if [[ ${#missing_browsers[@]} -eq 0 ]]; then
        print_status "$GREEN" "🎉 All browsers available from cache!"
    else
        print_status "$YELLOW" "⚠️ Installing missing browsers: ${missing_browsers[*]}"
        install_all_browsers "${missing_browsers[@]}"
    fi
}

# Function to handle smart install with cache miss
handle_cache_miss() {
    local browser=$1
    
    print_status "$YELLOW" "❌ Cache miss, installing browsers..."
    
    populate_browser_list "$browser"
    
    install_all_browsers "${BROWSER_LIST[@]}"
}

# Function to handle smart-install action
handle_smart_install_action() {
    local browser=$1
    
    # Show environment info for debugging
    print_status "$BLUE" "🔍 Environment debugging info:"
    echo "   PWD: $(pwd)"
    echo "   HOME: $HOME"
    echo "   USER: ${USER:-unknown}"
    echo "   PLAYWRIGHT_BROWSERS_PATH: ${PLAYWRIGHT_BROWSERS_PATH:-not set}"
    echo "   CI: ${CI:-not set}"
    
    # Show Playwright info
    print_status "$BLUE" "🎭 Playwright debugging info:"
    pnpm exec playwright install --dry-run 2>&1 | head -10 || true
    
    # Auto-detect cache hit by checking if any browsers are already installed
    local cache_hit="false"
    populate_browser_list "$browser"
    
    local installed_count=0
    for b in "${BROWSER_LIST[@]}"; do
        if check_browser "$b" >/dev/null 2>&1; then
            ((installed_count++))
        fi
    done
    
    if [[ $installed_count -gt 0 ]]; then
        cache_hit="true"
        print_status "$GREEN" "🎯 Auto-detected cache hit ($installed_count/${#BROWSER_LIST[@]} browsers found)"
    else
        print_status "$YELLOW" "🎯 Auto-detected cache miss (no browsers found)"
    fi
    
    if [[ "$cache_hit" == "true" ]]; then
        handle_cache_hit "$browser"
    else
        handle_cache_miss "$browser"
    fi
}

# Function to handle clean action
handle_clean_action() {
    print_status "$YELLOW" "🧹 Cleaning Playwright cache..."
    
    while IFS= read -r dir; do
        rm -rf "$dir" || true
    done < <(get_cache_directories)
    
    print_status "$GREEN" "✅ Cache cleaned"
}

# Function to show usage information
show_usage() {
    local action=$1
    print_status "$RED" "❌ Unknown action: $action"
    echo "Usage: $0 [check|install|smart-install|clean] [browser|all]"
    echo "Examples:"
    echo "  $0 check all"
    echo "  $0 install webkit"
    echo "  $0 smart-install chromium"
    echo "  $0 clean"
    exit 1
}

# Main function
main() {
    local action=${1:-"check"}
    local browser=${2:-"all"}
    
    print_status "$BLUE" "🎭 Playwright Cache Helper"
    print_status "$BLUE" "Action: $action, Browser: $browser"
    echo
    
    case $action in
        "check")
            handle_check_action "$browser"
            ;; 
        "install")
            handle_install_action "$browser"
            ;; 
        "smart-install")
            handle_smart_install_action "$browser"
            ;; 
        "clean")
            handle_clean_action
            ;; 
        *)
            show_usage "$action"
            ;; 
    esac
}

# Run main function with all arguments
main "$@"
