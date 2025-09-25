import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import './i18n'; // Initialize i18n
import HomeScreen from './screens/HomeScreen';
import VideoScreen from './screens/VideoScreen';
import LanguageSelector from './components/LanguageSelector';

const Stack = createStackNavigator();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="warning" size={48} color="#e74c3c" />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, textAlign: 'center', color: '#666' }}>
            {this.state.error?.toString()}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => <LanguageSelector />,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: t('navigation.home'),
            headerLeft: () => (
              <View style={{ marginLeft: 15 }}>
                <Ionicons name="play-circle" size={24} color="#fff" />
              </View>
            ),
          }}
        />
        <Stack.Screen 
          name="Video" 
          component={VideoScreen} 
          options={{ 
            title: t('navigation.video'),
            headerLeft: () => (
              <View style={{ marginLeft: 15 }}>
                <Ionicons name="videocam" size={24} color="#fff" />
              </View>
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

