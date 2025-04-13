import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tobacco Rehab App</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UserLogin')}
      >
        <Text style={styles.buttonText}>Login as User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminLogin')}
      >
        <Text style={styles.buttonText}>Login as Admin</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
