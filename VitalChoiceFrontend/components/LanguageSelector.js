import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from '../center_for_languages';

const LanguageSelector = ({ visible, onClose }) => {
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
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
                  onClose();
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
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default LanguageSelector;