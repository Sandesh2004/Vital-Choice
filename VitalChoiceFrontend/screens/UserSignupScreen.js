import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,ImageBackground, Alert, ActivityIndicator, Image, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useLanguage } from '../center_for_languages';
import LanguageButton from '../components/LanguageButton';
import LanguageSelector from '../components/LanguageSelector';

const UserSignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  // Get translations
  const { t } = useLanguage();

  const handleSignup = async () => {
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setErrorMessage(t('allFieldsRequired'));
      return;
    }
    
    if (!email.includes('@')) {
      setErrorMessage(t('validEmailRequired'));
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage(t('passwordMinLength'));
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/user/register`, {
        email,
        password,
      });
      
      Alert.alert(t('success'), t('signupSuccess'));
      navigation.navigate('UserLogin');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || t('signupFailed'));
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />
      <ImageBackground
                    source={require('../assets/background.jpg')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
      >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Vital Choice</Text>
        
        <LanguageButton 
          onPress={() => setLanguageModalVisible(true)} 
          screen="userSignup"
        />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.formContainer}>
              <Text style={styles.heading}>{t('userSignup')}</Text>
              <Text style={styles.subheading}>{t('createAccount')}</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('email')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterEmail')}
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('password')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterPassword')}
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterConfirmPassword')}
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t('signup')}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.linksContainer}>
                <TouchableOpacity
                  style={styles.switchPage}
                  onPress={() => navigation.navigate('UserLogin')}>
                  <Text style={styles.switchText}>{t('alreadyHaveAccount')} <Text style={styles.switchTextBold}>{t('login')}</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchPage}
                  onPress={() => navigation.navigate('RoleSelection')}>
                  <Text style={styles.switchText}>{t('backTo')} <Text style={styles.switchTextBold}>{t('roleSelection')}</Text></Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </ImageBackground>
      
      {/* Language Selector Modal */}
      <LanguageSelector 
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        screen="userSignup"
      />
    </SafeAreaView>
  );
};

export default UserSignupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 25,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    paddingLeft: 5,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#ff4d4d',
    marginBottom: 15,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: '#3498DB',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#7baaf7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  switchPage: {
    marginTop: 25,
  },
  switchText: {
    color: '#666',
    fontSize: 16,
  },
  switchTextBold: {
    color: '#3498DB',
    fontWeight: '700',
  },
  linksContainer: {
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});