import { useTranslation } from 'react-i18next';
import { useMemo, useCallback } from 'react';

// Import video content translations
import enVideoContent from './videoContent/en.json';
import esVideoContent from './videoContent/es.json';
import idVideoContent from './videoContent/id.json';
import arVideoContent from './videoContent/ar.json';
import frVideoContent from './videoContent/fr.json';
import hiVideoContent from './videoContent/hi.json';
import zhVideoContent from './videoContent/zh.json';

// Map of language codes to video content
const videoContentMap = {
  en: enVideoContent,
  es: esVideoContent,
  id: idVideoContent,
  ar: arVideoContent,
  fr: frVideoContent,
  hi: hiVideoContent,
  zh: zhVideoContent,
};

export const useVideoContent = () => {
  const { i18n } = useTranslation();
  
  // Memoize the video content based on current language
  const videoContent = useMemo(() => {
    const currentLanguage = i18n.language;
    return videoContentMap[currentLanguage] || videoContentMap.en;
  }, [i18n.language]);
  
  const getVideoTitle = useCallback((videoId) => {
    const video = videoContent.videos[videoId.toString()];
    return video ? video.title : `Video #${videoId}`;
  }, [videoContent]);
  
  const getVideoDiscussion = useCallback((videoId) => {
    const video = videoContent.videos[videoId.toString()];
    return video ? video.discussion : '';
  }, [videoContent]);
  
  const getVideoData = useCallback((videoId) => {
    const video = videoContent.videos[videoId.toString()];
    if (!video) {
      return {
        id: videoId,
        title: `Video #${videoId}`,
        discussion: ''
      };
    }
    
    return {
      id: videoId,
      title: video.title,
      discussion: video.discussion
    };
  }, [videoContent]);
  
  const getAllVideoData = useCallback(() => {
    return Object.keys(videoContent.videos).map(videoId => ({
      id: parseInt(videoId),
      title: videoContent.videos[videoId].title,
      discussion: videoContent.videos[videoId].discussion
    }));
  }, [videoContent]);
  
  return {
    getVideoTitle,
    getVideoDiscussion,
    getVideoData,
    getAllVideoData,
    currentLanguage: i18n.language
  };
};
