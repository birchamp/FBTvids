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
import { getVideoData, getVideoMetadata } from '../data/videos';

const { width, height } = Dimensions.get('window');

const VideoScreen = ({ route, navigation }) => {
  const { video } = route.params;
  const [currentVideoIndex, setCurrentVideoIndex] = useState(video.id - 1);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      const videoId = currentVideoIndex + 1;
      const videoData = getVideoData(videoId);
      setCurrentVideo(videoData);
      setTimeout(() => setIsLoading(false), 100);
    };
    loadVideo();
  }, [currentVideoIndex]);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, [currentVideoIndex]);

  const goToNextVideo = () => {
    if (currentVideoIndex < getVideoMetadata().length - 1) {
      if (videoRef.current) videoRef.current.unloadAsync();
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      Alert.alert('End of Videos', 'This is the last video in the series.');
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      if (videoRef.current) videoRef.current.unloadAsync();
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else {
      Alert.alert('Beginning of Videos', 'This is the first video in the series.');
    }
  };

  const handleVideoError = (error) => {
    console.log('Video error:', error);
    Alert.alert('Video Error', 'There was an error loading the video.', [{ text: 'OK' }]);
  };

  if (!currentVideo) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </View>
    );
  }

  const videoSource = currentVideo.videoUrl || null; // number (native) or null (web)

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
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
          <Text style={styles.videoTitle}>
            Video #{currentVideo.id}: {currentVideo.title}
          </Text>
        </View>

        {isLoading && (
          <View style={styles.videoFallback}>
            <Text style={styles.videoFallbackText}>Loading Video...</Text>
          </View>
        )}

        {!isLoading && !videoSource && (
          <View style={styles.videoFallback}>
            <Text style={styles.videoFallbackText}>Video not available on this platform</Text>
          </View>
        )}
      </View>

      <View style={styles.discussionContainer}>
        <View style={styles.discussionHeader}>
          <Text style={styles.discussionTitle}>Discussion Questions</Text>
        </View>

        <ScrollView style={styles.discussionScroll} showsVerticalScrollIndicator={true}>
          <Text style={styles.discussionText}>{currentVideo.discussion}</Text>
        </ScrollView>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentVideoIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPreviousVideo}
            disabled={currentVideoIndex === 0}
          >
            <Text style={[styles.navButtonText, currentVideoIndex === 0 && styles.navButtonTextDisabled]}>← Previous</Text>
          </TouchableOpacity>

          <Text style={styles.videoCounter}>{currentVideoIndex + 1} of {getVideoMetadata().length}</Text>

          <TouchableOpacity
            style={[styles.navButton, currentVideoIndex === getVideoMetadata().length - 1 && styles.navButtonDisabled]}
            onPress={goToNextVideo}
            disabled={currentVideoIndex === getVideoMetadata().length - 1}
          >
            <Text style={[styles.navButtonText, currentVideoIndex === getVideoMetadata().length - 1 && styles.navButtonTextDisabled]}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  videoContainer: { backgroundColor: '#000', position: 'relative', width: '100%', height: height * 0.45, minHeight: 200 },
  video: { width: '100%', height: '100%', backgroundColor: '#000', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  videoTitleContainer: { position: 'absolute', top: 10, left: 10, right: 10, backgroundColor: 'rgba(0, 0, 0, 0.8)', padding: 12, borderRadius: 8, zIndex: 10 },
  videoTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  videoFallback: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 5 },
  videoFallbackText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', lineHeight: 24 },
  discussionContainer: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', marginTop: -15 },
  discussionHeader: { backgroundColor: '#2c3e50', padding: 15, alignItems: 'center' },
  discussionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  discussionScroll: { flex: 1, padding: 20 },
  discussionText: { fontSize: 16, lineHeight: 24, color: '#2c3e50' },
  navigationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#ecf0f1', borderTopWidth: 1, borderTopColor: '#bdc3c7' },
  navButton: { backgroundColor: '#3498db', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  navButtonDisabled: { backgroundColor: '#bdc3c7' },
  navButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  navButtonTextDisabled: { color: '#7f8c8d' },
  videoCounter: { fontSize: 16, color: '#2c3e50', fontWeight: 'bold' },
});

export default VideoScreen;
