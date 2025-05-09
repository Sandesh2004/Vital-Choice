import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { useLanguage } from '../center_for_languages';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

const backgroundImage = require('../assets/med.jpg');
const motivationalQuotes = [
  "Breathe in calm, breathe out stress.",
  "Peace begins with a single breath.",
  "You are here. You are present. You are enough.",
  "Each breath is a fresh beginning.",
  "Inhale confidence, exhale doubt.",
];

// Create animated components
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BreatherScreen() {
  // Language support
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();

  // Timer states
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120); // Total seconds for timer
  
  // Animation states
  const breathProgress = useRef(new Animated.Value(0)).current;
  const [breathingPhase, setBreathingPhase] = useState('ready');
  const [breathingText, setBreathingText] = useState('Get Ready');
  
  // Timer interval ref
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const holdTimerRef = useRef(null);
  const cycleTimerRef = useRef(null);
  
  // Minute and second picker refs
  const [showMinutePicker, setShowMinutePicker] = useState(false);
  const [showSecondPicker, setShowSecondPicker] = useState(false);
  
  // Generate minute and second options
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  const secondOptions = Array.from({ length: 60 }, (_, i) => i);
  
  // Circle animation parameters
  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  // Add state to track initial duration
  const [initialDuration, setInitialDuration] = useState(0);

  const [sessionData, setSessionData] = useState({
    duration: 0,
    timestamp: null
  });
  
  // Get circle color based on breathing phase
  const getCircleColor = () => {
    switch(breathingPhase) {
      case 'inhale':
        return '#3498db'; // Blue
      case 'hold':
        return '#2ecc71'; // Green
      case 'exhale':
        return '#f1c40f'; // Yellow
      default:
        return '#95a5a6'; // Gray
    }
  };

  // Function to save breathing session data to backend
  const saveBreathingSession = async (durationInSeconds) => {
    try {
      const idToken = await AsyncStorage.getItem('authToken');
  
      if (!idToken) {
        console.log('User not logged in, cannot save breathing session');
        return;
      }
      
      // Save to backend
      const response = await fetch(`${BASE_URL}/api/user/save-breathing-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          duration: durationInSeconds,
          timestamp: new Date().toISOString()
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response:', errorData);
        throw new Error('Failed to save breathing session');
      }
      
    } catch (error) {
      console.error('Error saving breathing session:', error);
    }
  };

  // Update breathing text when language changes
  useEffect(() => {
    if (breathingPhase === 'ready') {
      setBreathingText(t('breatherscreen_get_ready'));
    } else if (breathingPhase === 'inhale') {
      setBreathingText(t('breatherscreen_inhale'));
    } else if (breathingPhase === 'hold') {
      setBreathingText(t('breatherscreen_hold'));
    } else if (breathingPhase === 'exhale') {
      setBreathingText(t('breatherscreen_exhale'));
    } else if (breathingPhase === 'completed') {
      setBreathingText(t('breatherscreen_completed'));
    }
  }, [currentLanguage, breathingPhase]);
  
  // Breathing animation
  const startBreathingAnimation = () => {
    // Reset to initial state
    breathProgress.setValue(0);
    setBreathingPhase('inhale');
    setBreathingText(t('breatherscreen_inhale'));
    
    // Create a NEW Animated.Value for each animation cycle
    const newBreathProgress = new Animated.Value(0);
    
    // Inhale animation (progress from 0 to 1)
    animationRef.current = Animated.timing(newBreathProgress, {
      toValue: 1,
      duration: 4000, // 4 seconds to inhale
      easing: Easing.linear,
      useNativeDriver: false, // Must be false for SVG animations
    });
    
    // Update the strokeDashoffset based on the new animated value
    newBreathProgress.addListener(({ value }) => {
      const offset = circumference * (1 - value);
      if (breathProgressRef.current) {
        breathProgressRef.current.setNativeProps({
          strokeDashoffset: offset
        });
      }
    });
    
    animationRef.current.start(({ finished }) => {
      if (!finished) {
        newBreathProgress.removeAllListeners();
        return; // Animation was stopped
      }
      
      // Hold animation (stay at 1)
      setBreathingPhase('hold');
      setBreathingText(t('breatherscreen_hold'));
      
      // Store the hold timer in the ref so we can clear it when paused
      holdTimerRef.current = setTimeout(() => {
        // Check if still running before proceeding
        if (!isRunning) {
          newBreathProgress.removeAllListeners();
          return;
        }
        
        // Exhale animation (reverse from 1 to 0)
        setBreathingPhase('exhale');
        setBreathingText(t('breatherscreen_exhale'));
        
        const exhaleProgress = new Animated.Value(1);
        
        // Update the strokeDashoffset for exhale
        exhaleProgress.addListener(({ value }) => {
          const offset = circumference * (1 - value);
          if (breathProgressRef.current) {
            breathProgressRef.current.setNativeProps({
              strokeDashoffset: offset
            });
          }
        });
        
        animationRef.current = Animated.timing(exhaleProgress, {
          toValue: 0,
          duration: 6000, // 6 seconds to exhale
          easing: Easing.linear,
          useNativeDriver: false, // Must be false for SVG animations
        });
        
        animationRef.current.start(({ finished: exhaleFinished }) => {
          exhaleProgress.removeAllListeners();
          
          if (!exhaleFinished) return; // Animation was stopped
          
          if (isRunning) {
            // Continue the cycle if still running
            cycleTimerRef.current = setTimeout(() => {
              if (isRunning) {
                startBreathingAnimation();
              }
            }, 500); // Small pause between cycles
          }
        });
      }, 4000); // 4 seconds hold
    });
  };

  // Set initial duration when timer is set
  useEffect(() => {
    if (!isRunning) {
      setInitialDuration(timerSeconds);
    }
  }, [timerSeconds, isRunning]);
  
  // Handle timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setBreathingPhase('ready');
            setBreathingText(t('breatherscreen_completed'));
            breathProgress.setValue(0);
            if (animationRef.current) {
              animationRef.current.stop();
            }
            // Save data when timer completes naturally
          saveBreathingSession(initialDuration, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Start breathing animation
      startBreathingAnimation();
    } else {
      clearInterval(timerRef.current);
      // Stop any ongoing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      // Clear any pending timers when paused
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
      
      // If manually stopped, reset breathing text
      if (timerSeconds > 0 && breathingPhase !== 'completed') {
        // Keep the current breathing phase when paused
        setBreathingText(
          breathingPhase === 'inhale' ? t('breatherscreen_inhale_paused') : 
          breathingPhase === 'hold' ? t('breatherscreen_hold_paused') : 
          breathingPhase === 'exhale' ? t('breatherscreen_exhale_paused') : 
          t('breatherscreen_paused')
        );
      }
    }
    
    return () => {
      clearInterval(timerRef.current);
      if (animationRef.current) {
        animationRef.current.stop();
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
      }
    };
  }, [isRunning, currentLanguage, initialDuration]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (animationRef.current) {
        animationRef.current.stop();
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
      }
      // Remove any lingering animation listeners
      breathProgress.removeAllListeners();
      // Reset animation values
      breathProgress.setValue(0);
    };
  }, []);
  
  // Update minutes and seconds display
  useEffect(() => {
    setMinutes(Math.floor(timerSeconds / 60));
    setSeconds(timerSeconds % 60);
  }, [timerSeconds]);
  
  // Timer controls
  const handleStart = () => {
    if (timerSeconds > 0) {
      setIsRunning(true);
    }
  };
  
  const handlePause = () => {
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setTimerSeconds(0);
    setMinutes(0);
    setSeconds(0);
    setBreathingPhase('ready');
    setBreathingText(t('breatherscreen_get_ready'));
    breathProgress.setValue(0);
    
    // Reset the circle's strokeDashoffset
    if (breathProgressRef.current) {
      breathProgressRef.current.setNativeProps({
        strokeDashoffset: circumference
      });
    }
    
    if (animationRef.current) {
      animationRef.current.stop();
    }
  };
  
  // Time selection handlers
  const handleMinuteSelect = (value) => {
    if (!isRunning) {
      setMinutes(value);
      setTimerSeconds(value * 60 + seconds);
      setShowMinutePicker(false);
    }
  };
  
  const handleSecondSelect = (value) => {
    if (!isRunning) {
      setSeconds(value);
      setTimerSeconds(minutes * 60 + value);
      setShowSecondPicker(false);
    }
  };
  
  // Random motivational quote
  const getRandomQuote = () => {
    const quotes = [
      t('breatherscreen_quote_1'),
      t('breatherscreen_quote_2'),
      t('breatherscreen_quote_3'),
      t('breatherscreen_quote_4'),
      t('breatherscreen_quote_5'),
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };
  const randomQuote = getRandomQuote();

  // Add a ref for the animated circle
  const breathProgressRef = useRef(null);

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>{t('breatherscreen_title')}</Text>
        
        {/* Timer Setting */}
        <View style={styles.timerContainer}>
          {/* Minutes */}
          <TouchableOpacity 
            style={styles.timeDisplay}
            onPress={() => !isRunning && setShowMinutePicker(true)}
            disabled={isRunning}
          >
            <Text style={[styles.timeText, isRunning && styles.disabledText]}>
              {minutes.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.timeSeparator}>:</Text>
          
          {/* Seconds */}
          <TouchableOpacity 
            style={styles.timeDisplay}
            onPress={() => !isRunning && setShowSecondPicker(true)}
            disabled={isRunning}
          >
            <Text style={[styles.timeText, isRunning && styles.disabledText]}>
              {seconds.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Control Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              styles.startButton, 
              (isRunning || timerSeconds === 0) && styles.disabledButton
            ]} 
            onPress={handleStart}
            disabled={isRunning || timerSeconds === 0}
          >
            <Text style={styles.buttonText}>{t('breatherscreen_start')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.pauseButton, !isRunning && styles.disabledButton]} 
            onPress={handlePause}
            disabled={!isRunning}
          >
            <Text style={styles.buttonText}>{t('breatherscreen_pause')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.resetButton]} 
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>{t('breatherscreen_reset')}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Breathing Circle Animation */}
        <View style={styles.breathingContainer}>
          <Text style={[
            styles.breathingInstruction,
            breathingPhase === 'inhale' && styles.inhaleText,
            breathingPhase === 'hold' && styles.holdText,
            breathingPhase === 'exhale' && styles.exhaleText
          ]}>
            {breathingText}
          </Text>
          
          <View style={styles.circleContainer}>
            {/* SVG Circle Animation */}
            <Svg width={280} height={280} viewBox="0 0 250 250">
              {/* Background Circle */}
              <Circle
                cx="125"
                cy="125"
                r={radius}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="10"
                fill="transparent"
              />
              
              {/* Progress Circle */}
              <Circle
                ref={breathProgressRef}
                cx="125"
                cy="125"
                r={radius}
                stroke={getCircleColor()}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference} // Start empty
                strokeLinecap="round"
                transform="rotate(-90, 125, 125)" // Start from top
              />
              
              {/* Starting Point Dot */}
              <Circle
                cx="125"
                cy="5" // Top of the circle (12 o'clock position)
                r="8"
                fill={getCircleColor()}
              />
            </Svg>
            
            {/* Inner Circle */}
            <View 
              style={[
                styles.innerCircle,
                { backgroundColor: getCircleColor() }
              ]}
            />
          </View>
        </View>
        
        {/* Motivational Quote */}
        <Text style={styles.quote}>"{randomQuote}"</Text>
        
        {/* Minute Picker Modal */}
        {showMinutePicker && (
          <View style={styles.pickerModalOverlay}>
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>{t('breatherscreen_select_minutes')}</Text>
              <FlatList
                data={minuteOptions}
                keyExtractor={(item) => `minute-${item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, item === minutes && styles.selectedPickerItem]}
                    onPress={() => handleMinuteSelect(item)}
                  >
                    <Text style={[styles.pickerItemText, item === minutes && styles.selectedPickerItemText]}>
                      {item.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
                style={styles.pickerList}
                initialScrollIndex={minutes}
                getItemLayout={(data, index) => ({
                  length: 50,
                  offset: 50 * index,
                  index,
                })}
              />
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => setShowMinutePicker(false)}
              >
                <Text style={styles.pickerCloseButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Second Picker Modal */}
        {showSecondPicker && (
          <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>{t('breatherscreen_select_seconds')}</Text>
            <FlatList
              data={secondOptions}
              keyExtractor={(item) => `second-${item}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, item === seconds && styles.selectedPickerItem]}
                  onPress={() => handleSecondSelect(item)}
                >
                  <Text style={[styles.pickerItemText, item === seconds && styles.selectedPickerItemText]}>
                    {item.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              style={styles.pickerList}
              initialScrollIndex={seconds}
              getItemLayout={(data, index) => ({
                length: 50,
                offset: 50 * index,
                index,
              })}
            />
            <TouchableOpacity
              style={styles.pickerCloseButton}
              onPress={() => setShowSecondPicker(false)}
            >
              <Text style={styles.pickerCloseButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 25,
    padding: 15,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  timeDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 90,
    height: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  timeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  disabledText: {
    opacity: 0.7,
  },
  timeSeparator: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  controlButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  startButton: {
    backgroundColor: '#2ecc71',
  },
  pauseButton: {
    backgroundColor: '#f39c12',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    height: 350,
  },
  breathingInstruction: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  inhaleText: {
    color: '#3498db',
  },
  holdText: {
    color: '#2ecc71',
  },
  exhaleText: {
    color: '#f1c40f',
  },
  circleContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    opacity: 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  patternGuide: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  patternStep: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '30%',
  },
  activeStep: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  patternText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  patternTime: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 5,
  },
  quote: {
    fontStyle: 'italic',
    fontSize: 20,
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    overflow: 'hidden',
    width: '90%',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  // Picker Modal Styles
  pickerModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  pickerList: {
    width: '100%',
    maxHeight: 250,
  },
  pickerItem: {
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  selectedPickerItem: {
    backgroundColor: '#3498db',
    borderRadius: 10,
  },
  pickerItemText: {
    fontSize: 24,
    color: '#2c3e50',
  },
  selectedPickerItemText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  pickerCloseButton: {
    marginTop: 20,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  pickerCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});