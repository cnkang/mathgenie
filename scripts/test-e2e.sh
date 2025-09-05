#!/bin/bash

# E2E Test Runner Script for MathGenie
# This script provides different ways to run the e2e tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required commands exist
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed. Please install Node.js first."
        exit 1
    fi
    
    print_success "All dependencies are available."
}

# Function to install playwright browsers if needed
install_browsers() {
    print_status "Installing Playwright browsers..."
    npx playwright install
    print_success "Playwright browsers installed."
}

# Function to build the project
build_project() {
    print_status "Building the project..."
    pnpm build
    print_success "Project built successfully."
}

# Function to start the preview server
start_server() {
    print_status "Starting preview server..."
    
    # Check if server is already running
    if curl -s http://localhost:4173 > /dev/null 2>&1; then
        print_warning "Server already running on port 4173"
        return 0
    fi
    
    # Start server in background
    pnpm preview &
    SERVER_PID=$!
    
    # Wait for server to start with retry logic
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:4173 > /dev/null 2>&1; then
            print_success "Preview server started on http://localhost:4173"
            return 0
        fi
        
        print_status "Waiting for server to start... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "Failed to start preview server after $max_attempts attempts"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
}

# Function to stop the server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        print_status "Stopping preview server..."
        kill $SERVER_PID 2>/dev/null || true
        # Wait a bit for graceful shutdown
        sleep 2
        # Force kill if still running
        kill -9 $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
        print_success "Preview server stopped."
    fi
}

# Function to run mobile device tests
run_mobile_tests() {
    local device_type=$1
    local config=${2:-playwright.config.ts}
    
    print_status "Running mobile tests for $device_type..."
    
    case $device_type in
        "all")
            MOBILE_TESTS=true npx playwright test --config=$config
            ;;
        "iphone")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="iPhone"
            ;;
        "iphone16")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="iPhone 16"
            ;;
        "iphone15")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="iPhone 15"
            ;;
        "ipad")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="iPad"
            ;;
        "android")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="Galaxy|Pixel|OnePlus"
            ;;
        "android-phones")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="Galaxy S24|Pixel 8|OnePlus 12"
            ;;
        "android-tablets")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="Galaxy Tab|Pixel Tablet"
            ;;
        "galaxy")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="Galaxy"
            ;;
        "pixel")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="Pixel"
            ;;
        "portrait")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="Portrait"
            ;;
        "landscape")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="Landscape"
            ;;
        "latest")
            MOBILE_TESTS=true npx playwright test --config=$config --grep="iPhone 16|iPhone 15 Pro Max|Galaxy S24|Pixel 8"
            ;;
        *)
            print_error "Unknown mobile device type: $device_type"
            print_status "Available types: all, iphone, iphone16, iphone15, ipad, android, android-phones, android-tablets, galaxy, pixel, portrait, landscape, latest"
            exit 1
            ;;
    esac
}

# Function to run specific test suites
run_test_suite() {
    local suite=$1
    local browser=${2:-chromium}
    
    print_status "Running $suite tests on $browser..."
    
    case $suite in
        "error-handling")
            npx playwright test tests/e2e/error-handling.spec.ts --project=$browser
            ;;
        "localstorage")
            npx playwright test tests/e2e/localstorage-persistence.spec.ts --project=$browser
            ;;
        "presets")
            npx playwright test tests/e2e/presets-functionality.spec.ts --project=$browser
            ;;
        "integration")
            npx playwright test tests/e2e/integration.spec.ts --project=$browser
            ;;
        "accessibility")
            npx playwright test tests/e2e/accessibility-unified.spec.ts --project=$browser
            ;;
        "accessibility-comprehensive")
            npx playwright test tests/e2e/accessibility-unified.spec.ts --project=$browser
            ;;
        "accessibility-mobile")
            npx playwright test tests/e2e/accessibility-unified.spec.ts --project=$browser
            ;;
        "accessibility-themes")
            npx playwright test tests/e2e/accessibility-unified.spec.ts --project=$browser
            ;;
        "accessibility-all")
            npx playwright test tests/e2e/accessibility-unified.spec.ts --project=$browser
            ;;
        "basic")
            npx playwright test tests/e2e/basic.spec.ts --project=$browser
            ;;
        "all")
            npx playwright test tests/e2e/ --project=$browser
            ;;
        *)
            print_error "Unknown test suite: $suite"
            print_status "Available suites: error-handling, localstorage, presets, integration, accessibility, accessibility-comprehensive, accessibility-mobile, accessibility-themes, accessibility-all, basic, all"
            exit 1
            ;;
    esac
}

# Function to run tests in different modes
run_tests() {
    local mode=$1
    local suite=${2:-all}
    local browser=${3:-chromium}
    
    case $mode in
        "headed")
            print_status "Running tests in headed mode..."
            npx playwright test tests/e2e/ --project=$browser --headed
            ;;
        "debug")
            print_status "Running tests in debug mode..."
            npx playwright test tests/e2e/ --project=$browser --debug
            ;;
        "ui")
            print_status "Opening Playwright UI..."
            npx playwright test --ui
            ;;
        "suite")
            run_test_suite $suite $browser
            ;;
        "mobile")
            run_mobile_tests $suite
            ;;
        "mobile-e2e")
            run_mobile_tests $suite "playwright.e2e.config.ts"
            ;;
        "quick")
            print_status "Running quick test suite (basic functionality)..."
            run_test_suite "basic" $browser
            ;;
        "full")
            print_status "Running full test suite..."
            run_test_suite "all" $browser
            ;;
        *)
            print_error "Unknown mode: $mode"
            print_status "Available modes: headed, debug, ui, suite, mobile, mobile-e2e, quick, full"
            exit 1
            ;;
    esac
}

# Function to generate test report
generate_report() {
    print_status "Generating test report..."
    npx playwright show-report
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup                    - Install dependencies and browsers"
    echo "  quick                    - Run basic functionality tests"
    echo "  full                     - Run all tests"
    echo "  suite <name> [browser]   - Run specific test suite"
    echo "  mobile <device>          - Run mobile device tests"
    echo "  mobile-e2e <device>      - Run mobile E2E tests"
    echo "  headed [suite] [browser] - Run tests in headed mode"
    echo "  debug [suite] [browser]  - Run tests in debug mode"
    echo "  ui                       - Open Playwright UI"
    echo "  report                   - Show test report"
    echo "  help                     - Show this help message"
    echo ""
    echo "Test Suites:"
    echo "  error-handling          - Error message and validation tests"
    echo "  localstorage           - localStorage persistence tests"
    echo "  presets                - Presets functionality tests"
    echo "  integration            - Integration tests"
    echo "  accessibility          - Unified WCAG 2.2 AAA accessibility tests
  accessibility-comprehensive - Same as accessibility (unified test)
  accessibility-mobile       - Same as accessibility (unified test)
  accessibility-themes       - Same as accessibility (unified test)
  accessibility-all          - Same as accessibility (unified test)"
    echo "  basic                  - Basic functionality tests"
    echo "  all                    - All test suites"
    echo ""
    echo "Browsers:"
    echo "  chromium (default)     - Google Chrome/Chromium"
    echo "  firefox                - Mozilla Firefox"
    echo "  webkit                 - Safari WebKit"
    echo ""
    echo "Mobile Devices:"
    echo "  all                    - All mobile devices"
    echo "  iphone                 - All iPhone models"
    echo "  iphone16               - iPhone 16 series"
    echo "  iphone15               - iPhone 15 series"
    echo "  ipad                   - All iPad models"
    echo "  android                - All Android devices"
    echo "  android-phones         - Android phones only"
    echo "  android-tablets        - Android tablets only"
    echo "  galaxy                 - Samsung Galaxy devices"
    echo "  pixel                  - Google Pixel devices"
    echo "  portrait               - Portrait orientation devices"
    echo "  landscape              - Landscape orientation devices"
    echo "  latest                 - Latest devices (iPhone 16, Galaxy S24, Pixel 8)"
    echo ""
    echo "Examples:"
    echo "  $0 setup                           # Install dependencies"
    echo "  $0 quick                           # Run basic tests"
    echo "  $0 full                            # Run all tests"
    echo "  $0 suite error-handling            # Run error handling tests"
    echo "  $0 suite presets firefox           # Run presets tests on Firefox"
    echo "  $0 suite accessibility             # Run unified WCAG 2.2 AAA accessibility tests"
    echo "  $0 suite accessibility-all         # Run unified accessibility tests (same as above)"
    echo "  $0 mobile iphone16                 # Run iPhone 16 tests"
    echo "  $0 mobile ipad                     # Run iPad tests"
    echo "  $0 mobile android                  # Run Android tests"
    echo "  $0 mobile galaxy                   # Run Samsung Galaxy tests"
    echo "  $0 mobile pixel                    # Run Google Pixel tests"
    echo "  $0 mobile-e2e latest              # Run E2E tests on latest devices"
    echo "  $0 headed basic                    # Run basic tests in headed mode"
    echo "  $0 debug integration               # Debug integration tests"
    echo "  $0 ui                              # Open Playwright UI"
}

# Trap to ensure server is stopped on exit
trap stop_server EXIT

# Main script logic
case ${1:-help} in
    "setup")
        check_dependencies
        install_browsers
        print_success "Setup completed successfully!"
        ;;
    "quick")
        check_dependencies
        build_project
        start_server
        run_tests "quick" "basic" ${2:-chromium}
        print_success "Quick tests completed!"
        ;;
    "full")
        check_dependencies
        build_project
        start_server
        run_tests "full" "all" ${2:-chromium}
        print_success "Full test suite completed!"
        ;;
    "suite")
        if [ -z "$2" ]; then
            print_error "Please specify a test suite name"
            show_usage
            exit 1
        fi
        check_dependencies
        build_project
        start_server
        run_tests "suite" $2 ${3:-chromium}
        print_success "Test suite '$2' completed!"
        ;;
    "mobile")
        if [ -z "$2" ]; then
            print_error "Please specify a mobile device type"
            show_usage
            exit 1
        fi
        check_dependencies
        build_project
        start_server
        run_tests "mobile" $2
        print_success "Mobile tests for '$2' completed!"
        ;;
    "mobile-e2e")
        if [ -z "$2" ]; then
            print_error "Please specify a mobile device type"
            show_usage
            exit 1
        fi
        check_dependencies
        build_project
        start_server
        run_tests "mobile-e2e" $2
        print_success "Mobile E2E tests for '$2' completed!"
        ;;
    "headed")
        check_dependencies
        build_project
        start_server
        run_tests "headed" ${2:-all} ${3:-chromium}
        print_success "Headed tests completed!"
        ;;
    "debug")
        check_dependencies
        build_project
        start_server
        run_tests "debug" ${2:-all} ${3:-chromium}
        print_success "Debug session completed!"
        ;;
    "ui")
        check_dependencies
        build_project
        start_server
        run_tests "ui"
        ;;
    "report")
        generate_report
        ;;
    "help"|"--help"|"-h")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac