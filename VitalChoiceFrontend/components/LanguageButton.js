import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../center_for_languages';

const LanguageButton = ({ onPress }) => {
  const { t } = useLanguage();
  
  return (
    <TouchableOpacity 
      style={styles.languageButton}
      onPress={onPress}
    >
      <Text style={styles.languageButtonText}>{t('language')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default LanguageButton;