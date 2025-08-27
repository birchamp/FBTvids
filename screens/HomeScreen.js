import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { getVideoMetadata, getThumbnail } from '../data/videos';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('HomeScreen mounting...');
    try {
      // Load video metadata when component mounts
      const videoData = getVideoMetadata().map(video => ({
        ...video,
        thumbnail: getThumbnail(video.id)
      }));
      console.log('Video metadata loaded:', videoData.length, 'videos');
      setVideos(videoData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading video metadata:', error);
      setLoading(false);
    }
  }, []);

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => navigation.navigate('Video', { video: item })}
    >
      <View style={styles.thumbnailContainer}>
        {item.thumbnail ? (
          <Image 
            source={item.thumbnail}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={(error) => console.log('Thumbnail load error:', error)}
            onLoad={() => console.log('Thumbnail loaded successfully for video', item.id)}
          />
        ) : (
          <View style={styles.thumbnailFallback}>
            <Text style={styles.thumbnailText}>Video #{item.id}</Text>
          </View>
        )}
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoNumber}>Video #{item.id}</Text>
        <Text style={styles.videoTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  console.log('HomeScreen rendering, videos count:', videos.length, 'loading:', loading);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foundations BT Videos</Text>
        <Text style={styles.headerSubtitle}>
          Training videos for Bible translation
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
  },
  header: {
    padding: 20,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  videoInfo: {
    padding: 15,
  },
  videoNumber: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 24,
  },
  separator: {
    height: 15,
  },
});

export default HomeScreen;

