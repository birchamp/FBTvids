#!/bin/bash

# FBT Videos APK Build Script
# This script builds a production APK for Android using EAS Build

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="FBT Videos"
BUILD_PROFILE="production"
OUTPUT_DIR="./build"
APK_NAME="fbt-videos-app.apk"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if EAS CLI is installed
    if ! command_exists eas; then
        print_error "EAS CLI is not installed. Installing..."
        npm install -g @expo/eas-cli
    fi

    # Check if Java is installed (needed for bundletool)
    if ! command_exists java; then
        print_error "Java is not installed. Please install Java JDK 8 or later."
        exit 1
    fi

    # Check if Android SDK is available
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        print_warning "Android SDK not found in environment variables."
        print_warning "Make sure ANDROID_HOME or ANDROID_SDK_ROOT is set."
    fi

    print_success "Prerequisites check completed."
}

# Function to clean previous builds
clean_previous_builds() {
    print_status "Cleaning previous builds..."

    # Remove old build artifacts
    rm -f *.aab *.apks *.apk
    rm -rf "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"

    print_success "Cleaned previous builds."
}

# Function to build AAB using EAS
build_aab() {
    print_status "Building Android App Bundle (AAB) with EAS..."

    # Check if user is logged in to EAS
    if ! eas whoami >/dev/null 2>&1; then
        print_warning "Not logged in to EAS. Please login first:"
        print_warning "eas login"
        exit 1
    fi

    # Build the AAB
    print_status "Starting EAS build for Android..."
    eas build --platform android --profile "$BUILD_PROFILE" --local --output "$OUTPUT_DIR/app.aab"

    # Check if build was successful
    if [ ! -f "$OUTPUT_DIR/app.aab" ]; then
        print_error "EAS build failed. Check the build logs above."
        exit 1
    fi

    print_success "AAB build completed successfully."
}

# Function to convert AAB to APK
convert_aab_to_apk() {
    print_status "Converting AAB to APK..."

    # Download bundletool if not present
    if [ ! -f "bundletool.jar" ]; then
        print_status "Downloading bundletool..."
        curl -L -o bundletool.jar https://github.com/google/bundletool/releases/download/1.17.2/bundletool-all-1.17.2.jar
    fi

    # Create keystore if not exists
    if [ ! -f "my-release-key.keystore" ]; then
        print_status "Creating signing keystore..."
        keytool -genkey -v -keystore my-release-key.keystore \
            -alias my-key-alias \
            -keyalg RSA \
            -keysize 2048 \
            -validity 10000 \
            -storepass password \
            -keypass password \
            -dname "CN=Unknown, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=Unknown" \
            -noprompt
    fi

    # Build universal APK from AAB
    print_status "Building universal APK..."
    java -jar bundletool.jar build-apks \
        --bundle="$OUTPUT_DIR/app.aab" \
        --output="$OUTPUT_DIR/app.apks" \
        --ks=my-release-key.keystore \
        --ks-pass=pass:password \
        --ks-key-alias=my-key-alias \
        --key-pass=pass:password \
        --mode=universal

    # Extract the universal APK
    print_status "Extracting universal APK..."
    unzip -q "$OUTPUT_DIR/app.apks" universal.apk
    mv universal.apk "$OUTPUT_DIR/$APK_NAME"

    # Verify APK was created
    if [ ! -f "$OUTPUT_DIR/$APK_NAME" ]; then
        print_error "Failed to create APK file."
        exit 1
    fi

    print_success "APK created successfully: $OUTPUT_DIR/$APK_NAME"
}

# Function to install APK to connected device
install_apk() {
    local apk_path="$OUTPUT_DIR/$APK_NAME"

    if [ ! -f "$apk_path" ]; then
        print_error "APK file not found: $apk_path"
        return 1
    fi

    print_status "Checking for connected Android devices..."

    # Set Android SDK path if available
    if [ -n "$ANDROID_HOME" ]; then
        export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin"
    elif [ -n "$ANDROID_SDK_ROOT" ]; then
        export PATH="$PATH:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/tools/bin"
    fi

    # Check if adb is available
    if ! command_exists adb; then
        print_warning "ADB not found. Skipping APK installation."
        print_warning "To install manually: adb install $apk_path"
        return 1
    fi

    # Check for connected devices
    local devices=$(adb devices | grep -v "List" | grep "device$" | wc -l)
    if [ "$devices" -eq 0 ]; then
        print_warning "No Android devices connected. Skipping APK installation."
        print_warning "To install manually: adb install $apk_path"
        return 1
    fi

    print_status "Installing APK to connected device(s)..."
    if adb install -r "$apk_path"; then
        print_success "APK installed successfully!"
    else
        print_error "Failed to install APK."
        print_warning "You can try installing manually: adb install -r $apk_path"
        return 1
    fi
}

# Function to show build summary
show_summary() {
    local apk_path="$OUTPUT_DIR/$APK_NAME"
    local apk_size=""

    if [ -f "$apk_path" ]; then
        apk_size=$(du -h "$apk_path" | cut -f1)
    fi

    echo
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                      BUILD SUMMARY                           ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║ Project: $PROJECT_NAME"
    echo "║ APK Location: $apk_path"
    if [ -n "$apk_size" ]; then
        echo "║ APK Size: $apk_size"
    fi
    echo "║ Build Date: $(date)"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo
    print_success "🎉 APK build completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Test the APK on your Android device"
    echo "2. Upload to Google Play Store (if publishing)"
    echo "3. Distribute to beta testers (if needed)"
    echo
}

# Function to show usage
show_usage() {
    echo "FBT Videos APK Build Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --clean             Clean previous builds only"
    echo "  --no-install        Skip APK installation to device"
    echo "  --aab-only          Build AAB only (skip APK conversion)"
    echo
    echo "Examples:"
    echo "  $0                  # Build APK and install to device"
    echo "  $0 --no-install     # Build APK without installing"
    echo "  $0 --aab-only       # Build AAB only"
    echo "  $0 --clean          # Clean previous builds"
    echo
}

# Main script logic
main() {
    local skip_install=false
    local aab_only=false
    local clean_only=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_usage
                exit 0
                ;;
            --clean)
                clean_only=true
                ;;
            --no-install)
                skip_install=true
                ;;
            --aab-only)
                aab_only=true
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
        shift
    done

    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                FBT Videos APK Build Script                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo

    # Handle clean-only option
    if [ "$clean_only" = true ]; then
        clean_previous_builds
        print_success "Clean completed."
        exit 0
    fi

    # Run the build process
    check_prerequisites
    clean_previous_builds
    build_aab

    if [ "$aab_only" = false ]; then
        convert_aab_to_apk

        if [ "$skip_install" = false ]; then
            install_apk || true  # Don't fail if installation fails
        fi
    fi

    show_summary
}

# Run main function with all arguments
main "$@"
