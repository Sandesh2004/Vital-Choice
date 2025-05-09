import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from './translations';

// Create language context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference on component mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLanguagePreference();
  }, []);

  // Change language and save preference
  const changeLanguage = async (languageCode) => {
    setCurrentLanguage(languageCode);
    try {
      await AsyncStorage.setItem('userLanguage', languageCode);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  // Get translation function
  const t = (key) => {
    const languageTranslations = translations[currentLanguage] || translations.en;
    return languageTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage, 
      t,
      isLoading,
      availableLanguages: Object.keys(translations).map(code => ({
        code,
        name: translations[code].languageName
      }))
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};