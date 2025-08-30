// Platform-specific data (web)
import { useVideoContent } from '../i18n/videoContentManager';

// Thumbnails (use .webp files only)
export const getThumbnail = (videoId) => {
  try {
    switch (videoId) {
      case 1: return require('../thumbs/v1thumb.webp');
      case 2: return require('../thumbs/v2thumb.webp');
      case 3: return require('../thumbs/v3thumb.webp');
      case 4: return require('../thumbs/v4thumb.webp');
      case 5: return require('../thumbs/v5thumb.webp');
      case 6: return require('../thumbs/v6thumb.webp');
      case 7: return require('../thumbs/v7thumb.webp');
      default: return null;
    }
  } catch (_e) {
    return null;
  }
};

// Explicitly null for web to prevent Metro bundling large MP4s
export const getVideoUrl = (_videoId) => null;

// Hook-based video data that uses translations
export const useVideoData = () => {
  const { getVideoData, getAllVideoData, getVideoTitle, getVideoDiscussion } = useVideoContent();
  
  const getVideoMetadata = () => getAllVideoData();
  
  const getVideoDataWithAssets = (videoId) => {
    const videoData = getVideoData(videoId);
    if (!videoData) return null;
    
    return { 
      ...videoData, 
      thumbnail: getThumbnail(videoId), 
      videoUrl: getVideoUrl(videoId) 
    };
  };
  
  return {
    getVideoMetadata,
    getVideoData: getVideoDataWithAssets,
    getVideoTitle,
    getVideoDiscussion,
    getThumbnail,
    getVideoUrl
  };
};

// Legacy exports for backward compatibility
export const getVideoMetadata = () => {
  // This will be replaced by the hook-based approach
  // For now, return basic structure
  return Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    title: `Video #${i + 1}`,
    discussion: ''
  }));
};

export const getVideoData = (videoId) => {
  const meta = getVideoMetadata().find(v => v.id === videoId);
  if (!meta) return null;
  return { ...meta, thumbnail: getThumbnail(videoId), videoUrl: getVideoUrl(videoId) };
};

export const videos = getVideoMetadata().map(v => ({ ...v, thumbnail: getThumbnail(v.id), videoUrl: null }));


