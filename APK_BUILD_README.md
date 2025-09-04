# FBT Videos APK Build Script

This script automates the process of building a production APK for the FBT Videos Android app.

## Prerequisites

Before running the script, ensure you have:

1. **Node.js and npm** installed
2. **EAS CLI** installed globally:
   ```bash
   npm install -g @expo/eas-cli
   ```

3. **Java JDK** (version 8 or later) installed

4. **Android SDK** (optional, for APK installation):
   - Set `ANDROID_HOME` or `ANDROID_SDK_ROOT` environment variable
   - Add Android SDK tools to your PATH

5. **Expo Account**: You need to be logged in to Expo:
   ```bash
   eas login
   ```

## Usage

### Basic Usage

Build APK and install to connected device:
```bash
./build-apk.sh
```

### Available Options

```bash
./build-apk.sh --help          # Show help message
./build-apk.sh --no-install    # Build APK without installing to device
./build-apk.sh --aab-only      # Build AAB only (skip APK conversion)
./build-apk.sh --clean         # Clean previous builds only
```

## What the Script Does

### 1. Prerequisites Check
- Verifies EAS CLI installation
- Checks Java availability
- Validates Android SDK setup (if available)

### 2. Build Process
- Cleans previous build artifacts
- Builds Android App Bundle (AAB) using EAS
- Converts AAB to universal APK using bundletool
- Signs the APK with a generated keystore

### 3. Installation (Optional)
- Automatically installs APK to connected Android devices
- Falls back gracefully if no devices are connected

### 4. Output
- **AAB file**: `build/app.aab` (for Google Play Store)
- **APK file**: `build/fbt-videos-app.apk` (for direct installation)
- **Build artifacts**: Various intermediate files

## Build Output

After successful completion, you'll find:

```
build/
├── app.aab              # Android App Bundle (for Play Store)
├── fbt-videos-app.apk   # Universal APK (for direct install)
└── app.apks            # APK set (intermediate file)
```

## Troubleshooting

### Common Issues

1. **EAS Login Required**
   ```bash
   eas login
   ```

2. **Java Not Found**
   - Install Java JDK 8 or later
   - Ensure `java` command is in your PATH

3. **Android SDK Not Found**
   - Set `ANDROID_HOME` environment variable
   - Add SDK tools to PATH

4. **Build Fails**
   - Check internet connection
   - Verify Expo project configuration
   - Ensure all dependencies are installed

### Manual APK Installation

If automatic installation fails, install manually:

```bash
# Connect your Android device
adb devices

# Install APK
adb install -r build/fbt-videos-app.apk
```

## Build Configuration

The script uses the following configuration (defined at the top of the script):

- **Build Profile**: `production`
- **Output Directory**: `./build`
- **APK Name**: `fbt-videos-app.apk`

To modify these settings, edit the variables at the top of `build-apk.sh`.

## Advanced Usage

### Custom Build Configuration

You can modify `eas.json` to customize the build:

```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Environment Variables

Set these for better Android integration:

```bash
export ANDROID_HOME=/path/to/android/sdk
export JAVA_HOME=/path/to/java/jdk
```

## Support

If you encounter issues:

1. Check the script output for specific error messages
2. Verify all prerequisites are met
3. Ensure your Expo project is properly configured
4. Check Expo documentation for build-related issues

## File Structure

After running the script, your project will have:

```
FBTvids/
├── build-apk.sh              # The build script
├── APK_BUILD_README.md       # This documentation
├── build/                    # Build output directory
│   ├── app.aab              # Android App Bundle
│   └── fbt-videos-app.apk   # Universal APK
├── bundletool.jar           # Bundletool utility
└── my-release-key.keystore  # Signing keystore
```
