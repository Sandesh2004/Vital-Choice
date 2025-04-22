import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminDashboard = ({setUserLoggedIn, setIsAdmin}) => {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('isAdmin');
      
      // Reset the state
      setUserLoggedIn(false);
      setIsAdmin(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Admin!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 20 },
});
