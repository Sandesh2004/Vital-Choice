import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ImageBackground,
  StatusBar,
  Platform,
  Modal,
  ScrollView
} from 'react-native';
import { useLanguage } from '../center_for_languages';

// ...imports remain unchanged

const RoleSelectionScreen = ({ navigation }) => {
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
    // Show content after 2 seconds
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 3000); // 2 seconds delay
  
      return () => clearTimeout(timer);
    }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Vital Choice</Text>
            <TouchableOpacity 
              style={styles.languageButton}
              onPress={() => setLanguageModalVisible(true)}
            >
              <Text style={styles.languageButtonText}>{t('language')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.heading}>{t('chooseRole')}</Text>
            <Text style={styles.subheading}>{t('selectAccess')}</Text>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('UserLogin')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{t('loginAsUser')}</Text>
                <Text style={styles.buttonDescription}>{t('forUsers')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.adminButton]}
              onPress={() => navigation.navigate('AdminLogin')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{t('loginAsAdmin')}</Text>
                <Text style={styles.buttonDescription}>{t('forProviders')}</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('footer')}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('chooseLanguage')}</Text>
            <ScrollView style={styles.languageList}>
              {availableLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === language.code && styles.selectedLanguage
                  ]}
                  onPress={() => {
                    changeLanguage(language.code);
                    setLanguageModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.languageText,
                      currentLanguage === language.code && styles.selectedLanguageText
                    ]}
                  >
                    {language.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3498DB',
  },
  container: {
    flex: 1,
    //backgroundColor: '#F7F9FC',
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3498DB',
    paddingVertical: 18,
    paddingHorizontal: 35,
    borderRadius: 15,
    marginVertical: 12,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  adminButton: {
    backgroundColor: '#2980B9',
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonDescription: {
    color: '#E0E0E0',
    fontSize: 14,
    marginTop: 5,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#7F8C8D',
    fontSize: 14,
    fontStyle: 'italic',
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  languageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '60%',
    position: 'relative',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Optional: dark overlay for better contrast
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  languageList: {
    width: '100%',
  },
  languageOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguage: {
    backgroundColor: '#f0f8ff',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#3498DB',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
  }
});