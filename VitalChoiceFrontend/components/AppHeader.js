import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import LanguageButton from './LanguageButton';
import LanguageSelector from '../components/LanguageSelector';

const AppHeader = ({
  title = "Vital Choice",
  screen = "",
  style = {},
}) => {
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  return (
    <View>
      <View style={[styles.header, style]}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>{title}</Text>
        <LanguageButton 
          onPress={() => setLanguageModalVisible(true)}
          screen={screen}
        />
      </View>
      <LanguageSelector
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        screen={screen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AppHeader;