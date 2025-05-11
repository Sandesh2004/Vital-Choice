import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
// If using Expo, you can use expo-av:
import { Audio } from 'expo-av';
import { BASE_URL } from '../config';

const MOODS = ['Stressed', 'Sad', 'Hopeful', 'Motivated'];

export default function SongListenerScreen() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    // Cleanup sound on unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (selectedMood) {
      fetchSongs(selectedMood);
    } else {
      setSongs([]);
    }
  }, [selectedMood]);

  const fetchSongs = async (mood) => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${BASE_URL}/api/user/songs?mood=${encodeURIComponent(mood)}`);
      const data = await response.json();
      setSongs(data.songs || []);
    } catch (error) {
      setSongs([]);
    }
    setLoading(false);
  };

  const playSong = async (song) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setPlayingSongId(null);
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: song.url });
      setSound(newSound);
      setPlayingSongId(song.id);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingSongId(null);
        }
      });
    } catch (e) {
      setPlayingSongId(null);
    }
  };

  const stopSong = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingSongId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/music2.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.headerTitle}>How are you feeling?</Text>
            <View style={styles.moodButtonContainer}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodButton,
                    selectedMood === mood && styles.moodButtonSelected,
                  ]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text
                    style={[
                      styles.moodButtonText,
                      selectedMood === mood && styles.moodButtonTextSelected,
                    ]}
                  >
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#3498DB" />
              ) : selectedMood ? (
                songs.length > 0 ? (
                  songs.map((song) => (
                    <View key={song.id} style={styles.songCard}>
                      <View style={styles.songRow}>
                        <Text style={styles.songTitle}>{song.title}</Text>
                        <TouchableOpacity
                          style={[
                            styles.playButton,
                            playingSongId === song.id && styles.playButtonActive,
                          ]}
                          onPress={() =>
                            playingSongId === song.id ? stopSong() : playSong(song)
                          }
                        >
                          <Text style={styles.playButtonText}>
                            {playingSongId === song.id ? 'Stop' : 'Play'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noResultsText}>No songs found for this mood.</Text>
                )
              ) : (
                <Text style={styles.instructionText}>
                  Select your mood to get song recommendations.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 ,backgroundColor: '#3498DB',},
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  container: { flex: 1, padding: 20 },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 24,
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  moodButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  moodButton: {
    backgroundColor: '#ffffffbb',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 24,
    margin: 8,
    elevation: 3,
  },
  moodButtonSelected: { backgroundColor: '#2ecc71' },
  moodButtonText: {
    color: '#2c3e50',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  moodButtonTextSelected: { color: '#fff' },
  scrollContainer: { paddingBottom: 30 },
  songCard: {
    backgroundColor: '#ffffffee',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 16,
  },
  playButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 22,
    elevation: 2,
  },
  playButtonActive: { backgroundColor: '#e74c3c' },
  playButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  noResultsText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 36,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  instructionText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});