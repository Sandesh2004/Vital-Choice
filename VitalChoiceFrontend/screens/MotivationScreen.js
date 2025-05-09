import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Animated,
} from 'react-native';

// Quotes and background images
const quoteImagePairs = [
  {
    quote: "Every day without tobacco is a victory for your health.",
    image: require('../assets/harmful2.jpg'),
  },
  {
    quote: "Your future is smoke-free and bright!",
    image: require('../assets/harmful3.jpg'),
  },
  {
    quote: "Breathe better, live longer — say no to tobacco.",
    image: require('../assets/harmful4.jpg'),
  },
  {
    quote: "Each smoke-free moment is a win for your body.",
    image: require('../assets/harmful5.jpg'),
  },
  {
    quote: "Start the day with strength — without tobacco.",
    image: require('../assets/harmful6.jpg'),
  },
];

export default function MotivationScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  const currentItem = quoteImagePairs[currentIndex];

  const animate = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animate();
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < quoteImagePairs.length - 1 ? prevIndex + 1 : 0
    );
  };

  return (
    <ImageBackground
      source={currentItem.image}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          "{currentItem.quote}"
        </Animated.Text>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // semi-transparent white
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    color: '#000000',
    fontStyle: 'TimesNewRoman',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#1565c0',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});