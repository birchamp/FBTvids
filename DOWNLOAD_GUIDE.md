# Video Download Guide

## 🎥 Quick Start

Choose one of these methods to download the FBT videos:

### Method 1: Bash Script (Recommended)
```bash
./download_videos.sh
```

### Method 2: Python Script (Alternative)
```bash
./download_videos.py
```

### Method 3: Manual Download
See `VIDEO_SETUP.md` for manual download instructions.

## 📋 Prerequisites

### For Bash Script:
- `curl` (usually pre-installed on macOS/Linux)
- If not installed: `brew install curl` (macOS) or `sudo apt-get install curl` (Ubuntu)

### For Python Script:
- Python 3.6+
- `requests` library: `pip install requests`

## 🚀 Usage

### Step 1: Run the Download Script
```bash
# Option A: Bash script
./download_videos.sh

# Option B: Python script  
./download_videos.py
```

### Step 2: Wait for Downloads
The script will:
- ✅ Create `assets/videos/` directory
- ✅ Download all 7 videos with progress tracking
- ✅ Skip files that already exist
- ✅ Show file sizes and download status

### Step 3: Verify Downloads
```bash
ls -lh assets/videos/
```

Expected output:
```
video1.mp4  # Can we translate the Bible?
video2.mp4  # How do we address translation issues?
video3.mp4  # How do we get started?
video4.mp4  # How do we translate?
video5.mp4  # How do we know it is a good quality translation?
video6.mp4  # How do we know the Translation is finished?
video7.mp4  # How do we share Bible Translation?
```

## 🔧 Troubleshooting

### Script Fails to Run
```bash
# Make scripts executable
chmod +x download_videos.sh
chmod +x download_videos.py
```

### Download Errors
- **Network issues**: Check your internet connection
- **VideoPress restrictions**: Try the Python script instead
- **File permissions**: Ensure you have write access to the directory

### Python Script Issues
```bash
# Install required library
pip install requests

# Or if using pip3
pip3 install requests
```

### Partial Downloads
- Script will skip existing files
- Delete partial files and re-run: `rm assets/videos/video1.mp4`
- Check file sizes (should be several MB each)

## 📊 Expected Results

### File Sizes
Each video should be approximately:
- **video1.mp4**: ~15-30 MB
- **video2.mp4**: ~15-30 MB  
- **video3.mp4**: ~15-30 MB
- **video4.mp4**: ~15-30 MB
- **video5.mp4**: ~15-30 MB
- **video6.mp4**: ~15-30 MB
- **video7.mp4**: ~15-30 MB

### Total Size
- **All videos**: ~100-200 MB
- **App with videos**: ~150-250 MB

## 🔄 After Download

### Step 1: Update App Configuration
Edit `data/videos.js` to use local files:

```javascript
// Change from:
videoUrl: "https://videopress.com/v/VIuq2fIa",

// To:
videoUrl: require('../assets/videos/video1.mp4'),
```

### Step 2: Test the App
```bash
npm start
```

### Step 3: Enjoy Offline Videos
- ✅ No internet required
- ✅ No CORS issues
- ✅ Faster loading
- ✅ Better reliability

## 🆘 Manual Download

If scripts fail, download manually:

1. **Visit each VideoPress URL** in your browser
2. **Right-click** on the video and "Save As"
3. **Rename** files to match expected names
4. **Place** in `assets/videos/` directory

### VideoPress URLs:
- Video 1: https://videopress.com/v/VIuq2fIa
- Video 2: https://videopress.com/v/okSnm9pU
- Video 3: https://videopress.com/v/nKbT6pGU
- Video 4: https://videopress.com/v/2Xj9JI1e
- Video 5: https://videopress.com/v/wXq4DaKl
- Video 6: https://videopress.com/v/ONOwA09o
- Video 7: https://videopress.com/v/1ONQZd6G

## 📱 Benefits of Offline Videos

- ✅ **No internet required** - Works completely offline
- ✅ **No CORS issues** - No web browser restrictions
- ✅ **Faster loading** - No network delays
- ✅ **Better reliability** - No connection problems
- ✅ **Consistent experience** - Same performance everywhere

## 🎯 Success Checklist

- [ ] All 7 videos downloaded to `assets/videos/`
- [ ] File sizes are reasonable (10-50 MB each)
- [ ] `data/videos.js` updated to use local files
- [ ] App starts without errors: `npm start`
- [ ] Videos play offline in the app

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Try both bash and Python scripts
3. Use manual download as fallback
4. Check file permissions and network connectivity

