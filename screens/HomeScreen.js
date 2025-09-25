import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getThumbnail } from '../data/videos';
import { useVideoContent } from '../i18n/videoContentManager';


const HomeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { getAllVideoData } = useVideoContent();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVideos = () => {
    try {
      // Load video metadata with translations
      const videoData = getAllVideoData().map(video => ({
        ...video,
        thumbnail: getThumbnail(video.id)
      }));
      setVideos(videoData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading video metadata:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []); // Initial load

  useEffect(() => {
    // Reload videos when language changes
    loadVideos();
  }, [i18n.language]); // Reload when language changes

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => navigation.navigate('Video', { video: item })}
      accessibilityLabel={`${t('home.videoNumber', { number: item.id })} - ${item.title}`}
      accessibilityRole="button"
    >
      <View style={styles.thumbnailContainer}>
        {item.thumbnail ? (
          <Image 
            source={item.thumbnail}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={(error) => {}}
            onLoad={() => {}}
          />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Ionicons name="play-circle" size={48} color="#fff" />
            <Text style={styles.thumbnailText}>
              {t('home.thumbnailFallback', { number: item.id })}
            </Text>
          </View>
        )}
        <View style={styles.playIconOverlay}>
          <Ionicons name="play" size={32} color="#fff" />
        </View>
      </View>
      <View style={styles.videoInfo}>
        <View style={styles.videoHeader}>
          <Ionicons name="videocam" size={16} color="#7f8c8d" />
          <Text style={styles.videoNumber}>
            {t('home.videoNumber', { number: item.id })}
          </Text>
        </View>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <View style={styles.videoMeta}>
          <Ionicons name="time-outline" size={14} color="#7f8c8d" />
          <Text style={styles.videoMetaText}>Training Video</Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color="#34495e" />
          <Text style={styles.loadingText}>{t('home.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="school" size={32} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>{t('app.name')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('app.subtitle')}
        </Text>
      </View>
      
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#34495e',
    marginTop: 10,
  },
  header: {
    padding: 20,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
  },
  headerIconContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#3498db',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3498db',
  },
  thumbnailFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.9)',
    zIndex: 1,
  },
  thumbnailText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  playIconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  videoInfo: {
    padding: 15,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  videoNumber: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 24,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoMetaText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  separator: {
    height: 15,
  },
});

export default HomeScreen;

