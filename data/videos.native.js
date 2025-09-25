import { Platform } from 'react-native';
import { getAssetPackVideoUri } from '../native/assetPack';
import { useVideoContent } from '../i18n/videoContentManager';

const VIDEO_FILE_MAP = {
  1: 'video1.mp4',
  2: 'video2.mp4',
  3: 'video3.mp4',
  4: 'video4.mp4',
  5: 'video5.mp4',
  6: 'video6.mp4',
  7: 'video7.mp4',
};

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
  } catch (_error) {
    console.warn(`Failed to load thumbnail for video ${videoId}`);
    return null;
  }
};

export const getVideoFileName = (videoId) => VIDEO_FILE_MAP[videoId] ?? null;

export const getVideoUrl = async (videoId) => {
  if (Platform.OS !== 'android') {
    return null;
  }

  const fileName = getVideoFileName(videoId);
  if (!fileName) {
    return null;
  }

  const uri = await getAssetPackVideoUri(fileName);
  if (!uri) {
    return null;
  }

  return { uri };
};

export const useVideoData = () => {
  const { getVideoData, getAllVideoData, getVideoTitle, getVideoDiscussion } = useVideoContent();

  const getVideoMetadata = () => getAllVideoData();

  const getVideoDataWithAssets = async (videoId) => {
    const videoData = getVideoData(videoId);
    if (!videoData) return null;

    const videoSource = await getVideoUrl(videoId);
    return {
      ...videoData,
      thumbnail: getThumbnail(videoId),
      videoUrl: videoSource,
    };
  };

  return {
    getVideoMetadata,
    getVideoData: getVideoDataWithAssets,
    getVideoTitle,
    getVideoDiscussion,
    getThumbnail,
    getVideoUrl,
  };
};
