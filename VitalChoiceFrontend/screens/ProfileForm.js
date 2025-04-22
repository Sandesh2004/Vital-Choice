import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity  } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const countries = ["India", "United States", "Canada", "Australia", "Germany"];
const countryCodes = { India: '+91', US: '+1', Canada: '+1', Australia: '+61', Germany: '+49' };

const ProfileForm = ({ onSubmit }) => {
    
  const [form, setForm] = useState({
    name: '', age: '', sex: '', nationality: 'India',
    aadhar: '', address: '', phone: '', email: '',
    maritalStatus: '', occupation: '', income: '',
  });
  const [showPartB, setShowPartB] = useState(false);
  const [declaration, setDeclaration] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleNext = () => {
    if (form.name && form.age && form.sex && form.nationality && form.address && form.phone && form.maritalStatus && form.occupation && form.income) {
      if (form.nationality === 'India' && !form.aadhar) {
        alert('Aadhar is required for Indian nationality.');
        return;
      }
      setShowPartB(true);
    } else {
      alert('Please fill all required fields.');
    }
  };

  const handleSubmit = async () => {
    if (!declaration) return alert('You must confirm the declaration.');
    await AsyncStorage.setItem('profile', JSON.stringify(form));
    onSubmit(form);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      {!showPartB ? (
        <>
          <Text style={styles.title}>Profile Setup - Part A</Text>

          <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} onChangeText={val => handleChange('name', val)} />
          
          <Text style={styles.label}>Age <Text style={styles.required}>*</Text></Text>
          <TextInput keyboardType="numeric" style={styles.input} onChangeText={val => handleChange('age', val)} />

          <Text style={styles.label}>Sex <Text style={styles.required}>*</Text></Text>
          <View style={styles.radioGroup}>
            {['Male', 'Female', 'Other'].map(option => (
              <Text key={option} onPress={() => handleChange('sex', option)} style={styles.radio}>{form.sex === option ? '🔘' : '⚪'} {option}</Text>
            ))}
          </View>

          <Text style={styles.label}>Nationality <Text style={styles.required}>*</Text></Text>
          <Picker selectedValue={form.nationality} onValueChange={val => handleChange('nationality', val)}>
            {countries.map(c => <Picker.Item key={c} label={c} value={c} />)}
          </Picker>

          {form.nationality === 'India' && (
            <>
              <Text style={styles.label}>Aadhar Number <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} onChangeText={val => handleChange('aadhar', val)} />
            </>
          )}

          <Text style={styles.label}>Address <Text style={styles.required}>*</Text></Text>
          <TextInput style={styles.input} onChangeText={val => handleChange('address', val)} />

          <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
          <TextInput keyboardType="phone-pad" style={styles.input} placeholder={`e.g. ${countryCodes[form.nationality] || ''}XXXXXXXXXX`} onChangeText={val => handleChange('phone', val)} />

          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput style={styles.input} onChangeText={val => handleChange('email', val)} />

          <Text style={styles.label}>Marital Status <Text style={styles.required}>*</Text></Text>
          <Picker selectedValue={form.maritalStatus} onValueChange={val => handleChange('maritalStatus', val)}>
            {["Unmarried", "Married", "Widowed", "Separated or divorced", "Not applicable"].map(option => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>

          <Text style={styles.label}>Occupation <Text style={styles.required}>*</Text></Text>
          <Picker selectedValue={form.occupation} onValueChange={val => handleChange('occupation', val)}>
            {["Professional or Semi-professional", "Skilled, semi-skilled or unskilled worker", "Retired", "Housewife", "Student", "Other", "Unemployed"].map(option => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>

          <Text style={styles.label}>Average Monthly Income <Text style={styles.required}>*</Text></Text>
          <TextInput keyboardType="numeric" style={styles.input} onChangeText={val => handleChange('income', val)} />

          <Button title="Next" onPress={handleNext} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Part B (Coming Soon)</Text>
          <Text style={{ marginVertical: 10 }}>
            I hereby declare that all the information provided is true and correct to the best of my knowledge.
          </Text>
          <TouchableOpacity onPress={() => setDeclaration(!declaration)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>{declaration ? '☑️' : '⬜️'} I agree</Text>
          </TouchableOpacity>

          <Button title="Submit" onPress={handleSubmit} />
        </>
      )}
    </View>
    </ScrollView>
  );
};

export default ProfileForm;

const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    container: {
      flex: 1,
      paddingBottom: 20,
    },
    title: {
      fontSize: 22,
      marginBottom: 20,
      textAlign: 'center',
    },
    backText: {
      color: '#007bff',
      fontSize: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
    },
    required: {
      color: 'red',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 15,
      padding: 10,
      borderRadius: 5,
    },
  });
