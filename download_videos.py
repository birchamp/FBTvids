#!/usr/bin/env python3
"""
FBT Videos Download Script (Python Version)
This script downloads all 7 FBT training videos from VideoPress
"""

import os
import sys
import requests
from urllib.parse import urlparse
import time

def download_video(url, filename, title):
    """Download a video with progress tracking"""
    print(f"📥 Downloading: {title}")
    print(f"   URL: {url}")
    print(f"   Saving as: {filename}")
    
    try:
        # Set up headers to mimic a browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        # Make the request with streaming
        response = requests.get(url, headers=headers, stream=True, timeout=30)
        response.raise_for_status()
        
        # Get file size for progress tracking
        total_size = int(response.headers.get('content-length', 0))
        
        # Create the videos directory if it doesn't exist
        os.makedirs('assets/videos', exist_ok=True)
        
        filepath = os.path.join('assets/videos', filename)
        
        # Download with progress
        downloaded = 0
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    
                    # Show progress
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        print(f"\r   Progress: {percent:.1f}% ({downloaded}/{total_size} bytes)", end='', flush=True)
        
        print()  # New line after progress
        
        # Get final file size
        final_size = os.path.getsize(filepath)
        size_mb = final_size / (1024 * 1024)
        
        print(f"   ✅ Successfully downloaded {filename}")
        print(f"   📊 File size: {size_mb:.1f} MB")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Failed to download {filename}: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Error downloading {filename}: {e}")
        return False

def main():
    """Main function to download all videos"""
    print("🎥 Starting FBT Videos Download (Python)...")
    print("=" * 50)
    
    # Video information: (url, filename, title)
    videos = [
        ("https://videopress.com/v/VIuq2fIa", "video1.mp4", "Can we translate the Bible?"),
        ("https://videopress.com/v/okSnm9pU", "video2.mp4", "How do we address translation issues?"),
        ("https://videopress.com/v/nKbT6pGU", "video3.mp4", "How do we get started?"),
        ("https://videopress.com/v/2Xj9JI1e", "video4.mp4", "How do we translate?"),
        ("https://videopress.com/v/wXq4DaKl", "video5.mp4", "How do we know it is a good quality translation?"),
        ("https://videopress.com/v/ONOwA09o", "video6.mp4", "How do we know the Translation is finished?"),
        ("https://videopress.com/v/1ONQZd6G", "video7.mp4", "How do we share Bible Translation?"),
    ]
    
    successful = 0
    failed = 0
    
    # Check if requests is available
    try:
        import requests
    except ImportError:
        print("❌ Error: requests library is not installed.")
        print("   Install it with: pip install requests")
        sys.exit(1)
    
    print("🔍 Checking VideoPress URLs...")
    print()
    
    # Download each video
    for url, filename, title in videos:
        # Check if file already exists
        if os.path.exists(os.path.join('assets/videos', filename)):
            print(f"⏭️  Skipping {filename} (already exists)")
            print()
            successful += 1
            continue
        
        # Download the video
        if download_video(url, filename, title):
            successful += 1
        else:
            failed += 1
        
        print()
        time.sleep(1)  # Small delay between downloads
    
    # Summary
    print("=" * 50)
    print("📊 Download Summary:")
    print(f"   ✅ Successful: {successful}")
    print(f"   ❌ Failed: {failed}")
    print("   📁 Location: assets/videos/")
    print()
    
    # List downloaded files
    if successful > 0:
        print("📋 Downloaded files:")
        videos_dir = 'assets/videos'
        if os.path.exists(videos_dir):
            for file in os.listdir(videos_dir):
                if file.endswith('.mp4'):
                    filepath = os.path.join(videos_dir, file)
                    size = os.path.getsize(filepath) / (1024 * 1024)
                    print(f"   {file} ({size:.1f} MB)")
        print()
    
    # Final message
    if failed == 0 and successful == 7:
        print("🎉 All videos downloaded successfully!")
        print()
        print("🔄 Next steps:")
        print("   1. Update data/videos.js to use local files")
        print("   2. Test the app with: npm start")
        print("   3. Enjoy offline video playback!")
    else:
        print("⚠️  Some videos failed to download.")
        print("   This might be due to:")
        print("   - Network connectivity issues")
        print("   - VideoPress access restrictions")
        print("   - File format changes")
        print()
        print("💡 Try downloading manually from the VideoPress URLs:")
        for url, filename, title in videos:
            print(f"   {filename}: {url}")
    
    print()
    print("📚 For manual download instructions, see: VIDEO_SETUP.md")

if __name__ == "__main__":
    main()

