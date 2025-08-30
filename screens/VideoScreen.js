import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getVideoUrl } from '../data/videos';
import { useVideoContent } from '../i18n/videoContentManager';
import IconButton from '../components/IconButton';

const { width, height } = Dimensions.get('window');

const VideoScreen = ({ route, navigation }) => {
  const { t, i18n } = useTranslation();
  const { getVideoData, getAllVideoData, getVideoTitle, getVideoDiscussion } = useVideoContent();
  const { video } = route.params;
  const [currentVideoIndex, setCurrentVideoIndex] = useState(video.id - 1);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscussionExpanded, setIsDiscussionExpanded] = useState(false);
  const videoRef = useRef(null);
  const discussionScrollRef = useRef(null);

  const loadVideo = () => {
    setIsLoading(true);
    const videoId = currentVideoIndex + 1;
    const videoData = getVideoData(videoId);
    const videoUrl = getVideoUrl(videoId);
    
    setCurrentVideo({
      ...videoData,
      videoUrl: videoUrl
    });
    // Reset discussion panel state when video changes
    setIsDiscussionExpanded(false);
    setTimeout(() => setIsLoading(false), 100);
  };

  const updateVideoText = () => {
    // Only update text content, not the video file
    if (currentVideo) {
      const videoId = currentVideoIndex + 1;
      const videoData = getVideoData(videoId);
      
      setCurrentVideo(prev => ({
        ...prev,
        title: videoData.title,
        discussion: videoData.discussion
      }));
    }
  };

  useEffect(() => {
    loadVideo();
  }, [currentVideoIndex]); // Load when video index changes

  useEffect(() => {
    // Only update text content when language changes, don't reload video
    updateVideoText();
  }, [i18n.language]); // Update text when language changes

  // Reset discussion scroll position when video changes
  useEffect(() => {
    if (discussionScrollRef.current) {
      discussionScrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [currentVideoIndex]);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, [currentVideoIndex]);

  const goToNextVideo = () => {
    if (currentVideoIndex < getAllVideoData().length - 1) {
      if (videoRef.current) videoRef.current.unloadAsync();
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      Alert.alert(
        t('video.navigation.alerts.endOfVideos'),
        t('video.navigation.alerts.endMessage')
      );
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      if (videoRef.current) videoRef.current.unloadAsync();
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else {
      Alert.alert(
        t('video.navigation.alerts.beginningOfVideos'),
        t('video.navigation.alerts.beginningMessage')
      );
    }
  };

  const handleVideoError = (error) => {
    console.log('Video error:', error);
    Alert.alert(
      t('video.navigation.alerts.videoError'),
      t('video.navigation.alerts.errorMessage'),
      [{ text: 'OK' }]
    );
  };

  const toggleDiscussionExpanded = () => {
    setIsDiscussionExpanded(!isDiscussionExpanded);
  };

  if (!currentVideo) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="videocam-outline" size={48} color="#fff" />
          <Text style={styles.loadingText}>{t('video.loading')}</Text>
        </View>
      </View>
    );
  }

  const videoSource = currentVideo.videoUrl || null; // number (native) or null (web)

  return (
    <View style={styles.container}>
      <View style={[
        styles.videoContainer,
        isDiscussionExpanded && styles.videoContainerCollapsed
      ]}>
        {!isLoading && videoSource && (
          <Video
            ref={videoRef}
            style={styles.video}
            source={videoSource}
            useNativeControls
            resizeMode="contain"
            isLooping={false}
            onError={handleVideoError}
            shouldPlay={true}
            isMuted={false}
            onLoad={() => console.log('Video loaded successfully')}
            onLoadStart={() => console.log('Video loading started')}
          />
        )}

        <View style={styles.videoTitleContainer}>
          <Ionicons name="play-circle" size={20} color="#fff" style={styles.videoTitleIcon} />
          <Text style={styles.videoTitle}>
            {t('video.videoTitle', { number: currentVideo.id, title: currentVideo.title })}
          </Text>
        </View>

        {isLoading && (
          <View style={styles.videoFallback}>
            <Ionicons name="refresh" size={48} color="#fff" />
            <Text style={styles.videoFallbackText}>{t('video.loading')}</Text>
          </View>
        )}

        {!isLoading && !videoSource && (
          <View style={styles.videoFallback}>
            <Ionicons name="warning" size={48} color="#fff" />
            <Text style={styles.videoFallbackText}>{t('video.notAvailable')}</Text>
          </View>
        )}
      </View>

      <View style={[
        styles.discussionContainer,
        isDiscussionExpanded && styles.discussionContainerExpanded
      ]}>
        <TouchableOpacity 
          style={styles.discussionHeader}
          onPress={toggleDiscussionExpanded}
          activeOpacity={0.7}
          accessibilityLabel={t('video.discussion.title')}
          accessibilityRole="button"
        >
          <Ionicons 
            name={isDiscussionExpanded ? "chevron-down" : "chevron-up"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.discussionTitle}>
            {t('video.discussion.title')}
          </Text>
          <Ionicons 
            name={isDiscussionExpanded ? "chevron-down" : "chevron-up"} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>

        <ScrollView 
          ref={discussionScrollRef}
          style={styles.discussionScroll} 
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.discussionText}>{currentVideo.discussion}</Text>
        </ScrollView>

        <View style={styles.navigationContainer}>
          <IconButton
            name="chevron-back"
            size={24}
            color="#fff"
            onPress={goToPreviousVideo}
            disabled={currentVideoIndex === 0}
            style={[styles.navButton, currentVideoIndex === 0 && styles.navButtonDisabled]}
            accessibilityLabel={t('video.navigation.previous')}
          />

          <View style={styles.videoCounterContainer}>
            <Ionicons name="list" size={16} color="#2c3e50" />
            <Text style={styles.videoCounter}>
              {t('video.navigation.counter', { 
                current: currentVideoIndex + 1, 
                total: getAllVideoData().length 
              })}
            </Text>
          </View>

          <IconButton
            name="chevron-forward"
            size={24}
            color="#fff"
            onPress={goToNextVideo}
            disabled={currentVideoIndex === getAllVideoData().length - 1}
            style={[styles.navButton, currentVideoIndex === getAllVideoData().length - 1 && styles.navButtonDisabled]}
            accessibilityLabel={t('video.navigation.next')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#000' 
  },
  loadingText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    marginTop: 10,
  },
  videoContainer: { 
    backgroundColor: '#000', 
    position: 'relative', 
    width: '100%', 
    height: height * 0.35, 
    minHeight: 180 
  },
  videoContainerCollapsed: {
    height: height * 0.12,
    minHeight: 60
  },
  video: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: '#000', 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  },
  videoTitleContainer: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    right: 10, 
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
    padding: 12, 
    borderRadius: 8, 
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoTitleIcon: {
    marginRight: 8,
  },
  videoTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center',
    flex: 1,
  },
  videoFallback: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
    zIndex: 5 
  },
  videoFallbackText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    lineHeight: 24,
    marginTop: 10,
  },
  discussionContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    overflow: 'hidden', 
    marginTop: -5 
  },
  discussionContainerExpanded: {
    flex: 1,
    marginTop: -5
  },
  discussionHeader: { 
    backgroundColor: '#2c3e50', 
    padding: 15, 
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discussionTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  discussionScroll: { flex: 1, padding: 20 },
  discussionText: { fontSize: 16, lineHeight: 24, color: '#2c3e50' },
  navigationContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#ecf0f1', 
    borderTopWidth: 1, 
    borderTopColor: '#bdc3c7' 
  },
  navButton: { 
    backgroundColor: '#3498db', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 8, 
    minWidth: 100, 
    alignItems: 'center' 
  },
  navButtonDisabled: { 
    backgroundColor: '#bdc3c7' 
  },
  videoCounterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoCounter: { 
    fontSize: 16, 
    color: '#2c3e50', 
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default VideoScreen;
