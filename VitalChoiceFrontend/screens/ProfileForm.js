import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

const countries = ["India", "United States", "Canada", "Australia", "Germany"];
const countryCodes = { India: '+91', US: '+1', Canada: '+1', Australia: '+61', Germany: '+49' };

const ProfileForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: '', age: '', sex: '', nationality: 'India',
    aadhar: '', address: '', phone: '', email: '',
    maritalStatus: '', occupation: '', occupationOther: '',
    income: '',
    // Part B fields
    tobaccoTypes: [],
    otherTobaccoType: '',
    frequencyPerDay: '',
    cravingTimings: [],
    otherCravingTiming: '',
    yearsUsing: '',
    quittingReason: [],
    quittingReasonOther: '',
    confidenceLevel: '',
    healthIssues: [],
    healthIssuesOther: '',
    triggers: [],
    otherTrigger: '',
    tobaccoSpending: '',
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

    try {
      const idToken = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/user/create-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(form),
      });

      const text = await response.text();

      try {
        const result = JSON.parse(text);

        if (response.ok) {
          alert('Profile saved successfully!');
          onSubmit(form);
        } else {
          alert(`Error: ${result.message || 'Something went wrong.'}`);
        }
      } catch (error) {
        console.error('JSON parse failed:', error, '\nRaw:', text);
        alert('Unexpected response from server.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit profile. Please try again.');
    }
  };

  const toggleMultiSelect = (field, option) => {
    const selected = form[field].includes(option)
      ? form[field].filter(item => item !== option)
      : [...form[field], option];
    handleChange(field, selected);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {!showPartB ? (
          <>
            <View style={styles.formSection}>
              <View style={styles.formHeader}>
                <Text style={styles.formHeaderText}>Personal Information</Text>
                <Text style={styles.title}>Profile Setup - Part A</Text>

                <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.input} onChangeText={val => handleChange('name', val)} />

                <Text style={styles.label}>Age <Text style={styles.required}>*</Text></Text>
                <TextInput keyboardType="numeric" style={styles.input} onChangeText={val => handleChange('age', val)} />

                <Text style={styles.label}>Sex <Text style={styles.required}>*</Text></Text>
                <View style={styles.radioGroup}>
                  {['Male', 'Female', 'Other'].map(option => (
                    <Text key={option} onPress={() => handleChange('sex', option)} style={styles.radio}>
                      {form.sex === option ? '🔘' : '⚪'} {option}
                    </Text>
                  ))}
                </View>

                <Text style={styles.label}>Nationality <Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.nationality}
                    onValueChange={val => handleChange('nationality', val)}
                    style={styles.picker}
                  >
                    {countries.map(c => <Picker.Item key={c} label={c} value={c} />)}
                  </Picker>
                </View>

                {form.nationality === 'India' && (
                  <>
                    <Text style={styles.label}>Aadhar Number <Text style={styles.required}>*</Text></Text>
                    <TextInput keyboardType="numeric" style={styles.input} onChangeText={val => handleChange('aadhar', val)} />
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
                {form.occupation === 'Other' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Please specify your occupation"
                    onChangeText={val => handleChange('occupationOther', val)}
                  />
                )}

                <Text style={styles.label}>Average Monthly Income <Text style={styles.required}>*</Text></Text>
                <TextInput keyboardType="numeric" style={styles.input} onChangeText={val => handleChange('income', val)} />

                <TouchableOpacity style={styles.button} onPress={handleNext}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
                <View style={styles.formSection}>
                  <View style={styles.formHeader}>
                    <Text style={styles.formHeaderText}>Personal Information</Text>
                  </View>
                <Text style={styles.title}>Profile Setup - Part B</Text>

                <Text style={styles.label}>Types of Tobacco Used <Text style={styles.required}>*</Text></Text>
                <View style={styles.checkboxContainer}>
                  {['Chewing tobacco', 'Gutka', 'Khaini', 'Paan', 'Mawa', 'Misri', 'Gul', 'Other'].map(option => (
                    <TouchableOpacity key={option} onPress={() => toggleMultiSelect('tobaccoTypes', option)} style={styles.checkboxOption} >
                      <Text>{form.tobaccoTypes.includes(option) ? '☑️' : '⬜️'} {option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {form.tobaccoTypes.includes('Other') && (
                  <TextInput
                    style={styles.input}
                    placeholder="Specify other tobacco type"
                    onChangeText={val => handleChange('otherTobaccoType', val)}
                  />
                )}

                <Text style={styles.label}>Frequency of Usage Per Day <Text style={styles.required}>*</Text></Text>
                <TextInput keyboardType="numeric" style={styles.input} placeholder="e.g. 10" onChangeText={val => handleChange('frequencyPerDay', val)} />

                <Text style={styles.label}>Usual Craving Timings <Text style={styles.required}>*</Text></Text>
                <View style={styles.checkboxContainer}>
                  {['Morning', 'After Meals', 'While Working', 'Before Sleep', 'Other'].map(option => (
                    <TouchableOpacity key={option} onPress={() => toggleMultiSelect('cravingTimings', option)} style={styles.checkboxOption}>
                      <Text>{form.cravingTimings.includes(option) ? '☑️' : '⬜️'} {option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {form.cravingTimings.includes('Other') && (
                  <TextInput
                    style={styles.input}
                    placeholder="Specify other craving timing"
                    onChangeText={val => handleChange('otherCravingTiming', val)}
                  />
                )}

                <Text style={styles.label}>Years of Tobacco Use <Text style={styles.required}>*</Text></Text>
                <TextInput keyboardType="numeric" style={styles.input} placeholder="e.g. 5" onChangeText={val => handleChange('yearsUsing', val)} />

                <Text style={styles.label}>Reason for Quitting <Text style={styles.required}>*</Text></Text>
                <View style={styles.checkboxContainer}>
                  {['Health', 'Family', 'Financial reasons', 'Self-respect', 'Other'].map(option => (
                    <TouchableOpacity 
                      key={option} 
                      onPress={() => toggleMultiSelect('quittingReason', option)}
                      style={styles.checkboxOption}
                    >
                      <Text style={styles.checkboxText}>
                        {form.quittingReason.includes(option) ? '☑️' : '⬜️'} {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {form.quittingReason.includes('Other') && (
                  <TextInput
                    style={styles.input}
                    placeholder="Specify reason"
                    onChangeText={val => handleChange('quittingReasonOther', val)}
                  />
                )}

                <Text style={styles.label}>Confidence in Quitting (1-10) <Text style={styles.required}>*</Text></Text>
                <TextInput keyboardType="numeric" style={styles.input} placeholder="e.g. 7" onChangeText={val => handleChange('confidenceLevel', val)} />

                <Text style={styles.label}>Health Issues (if any)</Text>
                <View style={styles.checkboxContainer}>
                  {['Cough', 'Breathing Problem', 'Heart Disease', 'Cancer', 'Other'].map(option => (
                    <TouchableOpacity key={option} onPress={() => toggleMultiSelect('healthIssues', option)} style={styles.checkboxOption}>
                      <Text>{form.healthIssues.includes(option) ? '☑️' : '⬜️'} {option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {form.healthIssues.includes('Other') && (
                  <TextInput
                    style={styles.input}
                    placeholder="Specify health issues"
                    onChangeText={val => handleChange('healthIssuesOther', val)}
                  />
                )}

                <Text style={styles.label}>Tobacco Triggers <Text style={styles.required}>*</Text></Text>
                <View style={styles.checkboxContainer}>
                  {['Stress', 'Peer Pressure', 'Habit', 'Boredom', 'Other'].map(option => (
                    <TouchableOpacity key={option} onPress={() => toggleMultiSelect('triggers', option)} style={styles.checkboxOption}>
                      <Text>{form.triggers.includes(option) ? '☑️' : '⬜️'} {option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {form.triggers.includes('Other') && (
                  <TextInput
                    style={styles.input}
                    placeholder="Specify other triggers"
                    onChangeText={val => handleChange('otherTrigger', val)}
                  />
                )}

                <Text style={styles.label}>Average Monthly Tobacco Spending (in your currency) <Text style={styles.required}>*</Text></Text>
                <TextInput keyboardType="numeric" style={styles.input} placeholder="e.g. 500" onChangeText={val => handleChange('tobaccoSpending', val)} />

                <View style={styles.declarationContainer}>
                  <Text style={styles.declarationText}>
                    I hereby declare that all the information provided is true and correct to the best of my knowledge.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setDeclaration(!declaration)} 
                    style={styles.checkboxRow}
                  >
                    <Text style={styles.checkboxText}>
                      {declaration ? '☑️' : '⬜️'} I agree
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F7F9FC',
  },
  container: { 
    flex: 1, 
    padding: 20,
    paddingBottom: 40,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700',
    marginBottom: 25, 
    textAlign: 'center',
    color: '#2C3E50',
    borderBottomWidth: 2,
    borderBottomColor: '#3498DB',
    paddingBottom: 15,
    marginTop: 10,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 8,
    color: '#34495E',
    letterSpacing: 0.3,
  },
  required: { 
    color: '#E74C3C', 
    fontWeight: '700',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#BDC3C7', 
    marginBottom: 20, 
    padding: 14, 
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  radioGroup: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  radio: { 
    marginRight: 20, 
    marginBottom: 10,
    fontSize: 16,
    color: '#34495E',
    padding: 8,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#34495E',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498DB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: '#F39C12',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 15,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 25,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3498DB',
    paddingBottom: 8,
  },
  declarationContainer: {
    backgroundColor: '#EBF5FB',
    padding: 18,
    borderRadius: 12,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  declarationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#34495E',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  formSection: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  formHeader: {
    backgroundColor: 'white',
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 15,
    marginHorizontal: -15,
    marginTop: -15,
  },
  formHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkboxContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
});