#!/bin/bash

# FBT Videos Download Script
# This script downloads all 7 FBT training videos from VideoPress

echo "🎥 Starting FBT Videos Download..."
echo "=================================="

# Create videos directory if it doesn't exist
mkdir -p assets/videos

# Function to download video with progress
download_video() {
    local url=$1
    local filename=$2
    local title=$3
    
    echo "📥 Downloading: $title"
    echo "   URL: $url"
    echo "   Saving as: $filename"
    
    # Use curl to download with progress bar
    if curl -L -o "assets/videos/$filename" "$url" --progress-bar; then
        echo "   ✅ Successfully downloaded $filename"
        
        # Get file size
        if [ -f "assets/videos/$filename" ]; then
            size=$(du -h "assets/videos/$filename" | cut -f1)
            echo "   📊 File size: $size"
        fi
    else
        echo "   ❌ Failed to download $filename"
        return 1
    fi
    
    echo ""
}

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is not installed. Please install curl first."
    echo "   On macOS: brew install curl"
    echo "   On Ubuntu: sudo apt-get install curl"
    exit 1
fi

# Check if wget is available as alternative
if ! command -v wget &> /dev/null; then
    echo "⚠️  Warning: wget is not installed. Using curl only."
fi

echo "🔍 Checking VideoPress URLs..."
echo ""

# Array of video information: URL, filename, title
videos=(
    "https://videopress.com/v/VIuq2fIa|video1.mp4|Can we translate the Bible?"
    "https://videopress.com/v/okSnm9pU|video2.mp4|How do we address translation issues?"
    "https://videopress.com/v/nKbT6pGU|video3.mp4|How do we get started?"
    "https://videopress.com/v/2Xj9JI1e|video4.mp4|How do we translate?"
    "https://videopress.com/v/wXq4DaKl|video5.mp4|How do we know it is a good quality translation?"
    "https://videopress.com/v/ONOwA09o|video6.mp4|How do we know the Translation is finished?"
    "https://videopress.com/v/1ONQZd6G|video7.mp4|How do we share Bible Translation?"
)

# Counter for successful downloads
successful=0
failed=0

# Download each video
for video_info in "${videos[@]}"; do
    IFS='|' read -r url filename title <<< "$video_info"
    
    # Check if file already exists
    if [ -f "assets/videos/$filename" ]; then
        echo "⏭️  Skipping $filename (already exists)"
        echo ""
        ((successful++))
        continue
    fi
    
    # Try to download
    if download_video "$url" "$filename" "$title"; then
        ((successful++))
    else
        ((failed++))
    fi
done

echo "=================================="
echo "📊 Download Summary:"
echo "   ✅ Successful: $successful"
echo "   ❌ Failed: $failed"
echo "   📁 Location: assets/videos/"
echo ""

# List downloaded files
if [ $successful -gt 0 ]; then
    echo "📋 Downloaded files:"
    ls -lh assets/videos/*.mp4 2>/dev/null || echo "   No MP4 files found"
    echo ""
fi

# Check if all videos were downloaded
if [ $failed -eq 0 ] && [ $successful -eq 7 ]; then
    echo "🎉 All videos downloaded successfully!"
    echo ""
    echo "🔄 Next steps:"
    echo "   1. Update data/videos.js to use local files"
    echo "   2. Test the app with: npm start"
    echo "   3. Enjoy offline video playback!"
else
    echo "⚠️  Some videos failed to download."
    echo "   This might be due to:"
    echo "   - Network connectivity issues"
    echo "   - VideoPress access restrictions"
    echo "   - File format changes"
    echo ""
    echo "💡 Try downloading manually from the VideoPress URLs:"
    for video_info in "${videos[@]}"; do
        IFS='|' read -r url filename title <<< "$video_info"
        echo "   $filename: $url"
    done
fi

echo ""
echo "📚 For manual download instructions, see: VIDEO_SETUP.md"


