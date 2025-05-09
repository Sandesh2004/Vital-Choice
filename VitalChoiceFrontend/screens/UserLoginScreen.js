import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,ImageBackground, Alert, ActivityIndicator, Image, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../center_for_languages';
import LanguageButton from '../components/LanguageButton';
import LanguageSelector from '../components/LanguageSelector';


const UserLoginScreen = ({ navigation, setUserLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Forgot password states
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Get translations
  const { t } = useLanguage();

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.post(`${BASE_URL}/api/user/login`, {
        email,
        password,
      });

      await AsyncStorage.setItem('authToken', response.data.idToken);
      Alert.alert(t('success'), t('loginSuccess'));
      setUserLoggedIn(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  // Handle sending OTP to email
  const handleSendOTP = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError(t('validEmailRequired'));
      return;
    }

    setResetLoading(true);
    setResetError('');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/user/forgot-password`, {
        email: resetEmail
      });
      
      Alert.alert(t('success'), t('otpSent'));
      setResetStep(2); // Move to OTP verification step
    } catch (error) {
      setResetError(error.response?.data?.error || t('failedToSendOTP'));
    } finally {
      setResetLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setResetError(t('validOTPRequired'));
      return;
    }

    setResetLoading(true);
    setResetError('');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/user/verify-otp`, {
        email: resetEmail,
        otp: otp
      });
      
      setResetStep(3); // Move to password reset step
    } catch (error) {
      setResetError(error.response?.data?.error || t('invalidOTP'));
    } finally {
      setResetLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setResetError(t('passwordMinLength'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setResetError(t('passwordsDoNotMatch'));
      return;
    }

    setResetLoading(true);
    setResetError('');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/user/reset-password`, {
        email: resetEmail,
        otp: otp,
        newPassword: newPassword
      });
      
      Alert.alert(t('success'), t('passwordResetSuccess'));
      // Reset all states and close modal
      setResetStep(1);
      setResetEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setForgotPasswordVisible(false);
    } catch (error) {
      setResetError(error.response?.data?.error || t('failedToResetPassword'));
    } finally {
      setResetLoading(false);
    }
  };

  // Close modal and reset states
  const handleCloseReset = () => {
    setForgotPasswordVisible(false);
    setResetStep(1);
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
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
          screen="userLogin"
        />
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.formContainer}>
              <Text style={styles.heading}>{t('userLogin')}</Text>

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

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t('login')}</Text>
                )}
              </TouchableOpacity>

              <View style={styles.linksContainer}>
                <TouchableOpacity
                  style={styles.switchPage}
                  onPress={() => navigation.navigate('UserSignup')}>
                  <Text style={styles.switchText}>{t('dontHaveAccount')} <Text style={styles.switchTextBold}>{t('signup')}</Text></Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.switchPage}
                  onPress={() => setForgotPasswordVisible(true)}>
                  <Text style={styles.switchText}>{t('forgotPassword')} <Text style={styles.switchTextBold}>{t('reset')}</Text></Text>
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

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotPasswordVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseReset}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('resetPassword')}</Text>
                <TouchableOpacity onPress={handleCloseReset}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {resetStep === 1 && (
                <>
                  <Text style={styles.modalText}>
                    {t('enterEmailForOTP')}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('email')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('enterEmail')}
                      placeholderTextColor="#999"
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {resetError ? <Text style={styles.errorText}>{resetError}</Text> : null}
                  <TouchableOpacity
                    style={[styles.button, resetLoading && styles.buttonDisabled]}
                    onPress={handleSendOTP}
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>{t('sendOTP')}</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {resetStep === 2 && (
                <>
                  <Text style={styles.modalText}>
                    {t('enterOTPFromEmail')}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('otpCode')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('enterOTP')}
                      placeholderTextColor="#999"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  {resetError ? <Text style={styles.errorText}>{resetError}</Text> : null}
                  <TouchableOpacity
                    style={[styles.button, resetLoading && styles.buttonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>{t('verifyOTP')}</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleSendOTP}
                    disabled={resetLoading}
                  >
                    <Text style={styles.resendText}>{t('resendOTP')}</Text>
                  </TouchableOpacity>
                </>
              )}

              {resetStep === 3 && (
                <>
                  <Text style={styles.modalText}>
                    {t('createNewPassword')}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('newPassword')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('enterNewPassword')}
                      placeholderTextColor="#999"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('confirmNewPassword')}
                      placeholderTextColor="#999"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>
                  {resetError ? <Text style={styles.errorText}>{resetError}</Text> : null}
                  <TouchableOpacity
                    style={[styles.button, resetLoading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>{t('resetPassword')}</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>

      </Modal>
      
      {/* Language Selector Modal */}
      <LanguageSelector 
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        screen="userLogin"
      />
    </SafeAreaView>
  );
};

export default UserLoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
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
    backgroundColor: 'transparent', // Corrected property
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',  // Adjust the transparency value (0.7 for 70% opacity)
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
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
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
  backgroundImage: {
    flex: 1,
    justifyContent: 'center', 
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

  // Modal styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    padding: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  resendButton: {
    marginTop: 15,
    alignSelf: 'center',
  },
  resendText: {
    color: '#3498DB',
    fontSize: 16,
    fontWeight: '600',
  }
});