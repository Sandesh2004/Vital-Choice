import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView,ImageBackground, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';
import { useLanguage } from '../center_for_languages';

const countries = ["India", "United States", "Canada", "Australia", "Germany"];
const countryCodes = { India: '+91', US: '+1', Canada: '+1', Australia: '+61', Germany: '+49' };

const ProfileForm = ({ onSubmit }) => {
  const { t } = useLanguage();

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
        Alert.alert(t('error'), t('aadharRequired'));
        return;
      }
      setShowPartB(true);
    } else {
      Alert.alert(t('error'), t('fillAllFields'));
    }
  };

  const handleSubmit = async () => {
    if (!declaration) {
      Alert.alert(t('error'), t('confirmDeclaration'));
      return;
    }

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
          Alert.alert(t('success'), t('profileSaved'));
          onSubmit(form);
        } else {
          Alert.alert(t('error'), result.message || t('somethingWentWrong'));
        }
      } catch (error) {
        console.error('JSON parse failed:', error, '\nRaw:', text);
        Alert.alert(t('error'), t('unexpectedResponse'));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), t('failedToSubmit'));
    }
  };

  const toggleMultiSelect = (field, option) => {
    const selected = form[field].includes(option)
      ? form[field].filter(item => item !== option)
      : [...form[field], option];
    handleChange(field, selected);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498DB" barStyle="light-content" />
      <ImageBackground
              source={require('../assets/background.jpg')}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {!showPartB ? (
            <>
              <View style={styles.formSection}>
                <View style={styles.formHeader}>
                  <Text style={styles.formHeaderText}>{t('personalInformation')}</Text>
                </View>
                <Text style={styles.title}>{t('profileSetup')} - {t('partA')}</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('name')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    style={styles.input} 
                    onChangeText={val => handleChange('name', val)}
                    placeholder={t('name')}
                    placeholderTextColor="#999" 
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('age')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    keyboardType="numeric" 
                    style={styles.input} 
                    onChangeText={val => handleChange('age', val)}
                    placeholder={t('age')}
                    placeholderTextColor="#999" 
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('sex')} <Text style={styles.required}>*</Text></Text>
                  <View style={styles.radioGroup}>
                    {[t('male'), t('female'), t('other')].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => handleChange('sex', option)}
                        style={[styles.radioOption, form.sex === option && styles.radioSelected]}
                      >
                        <Text style={[styles.radioText, form.sex === option && styles.radioTextSelected]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('nationality')} <Text style={styles.required}>*</Text></Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={form.nationality}
                      onValueChange={val => handleChange('nationality', val)}
                      style={styles.picker}
                    >
                      {countries.map(c => <Picker.Item key={c} label={c} value={c} />)}
                    </Picker>
                  </View>
                </View>

                {form.nationality === 'India' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('aadharNumber')} <Text style={styles.required}>*</Text></Text>
                    <TextInput 
                      keyboardType="numeric" 
                      style={styles.input} 
                      onChangeText={val => handleChange('aadhar', val)}
                      placeholder={t('aadharNumber')}
                      placeholderTextColor="#999"
                      maxLength={12}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('address')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]} 
                    onChangeText={val => handleChange('address', val)}
                    placeholder={t('address')}
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('phoneNumber')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    keyboardType="phone-pad" 
                    style={styles.input} 
                    placeholder={`${countryCodes[form.nationality] || ''}XXXXXXXXXX`}
                    placeholderTextColor="#999" 
                    onChangeText={val => handleChange('phone', val)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('email')}</Text>
                  <TextInput 
                    style={styles.input} 
                    onChangeText={val => handleChange('email', val)}
                    placeholder={t('email')}
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('maritalStatus')} <Text style={styles.required}>*</Text></Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={form.maritalStatus}
                      onValueChange={val => handleChange('maritalStatus', val)}
                      style={styles.picker}
                    >
                      <Picker.Item label={t('selectMaritalStatus')} value="" />
                      <Picker.Item label={t('unmarried')} value={t('unmarried')} />
                      <Picker.Item label={t('married')} value={t('married')} />
                      <Picker.Item label={t('widowed')} value={t('widowed')} />
                      <Picker.Item label={t('separatedOrDivorced')} value={t('separatedOrDivorced')} />
                      <Picker.Item label={t('notApplicable')} value={t('notApplicable')} />
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('occupation')} <Text style={styles.required}>*</Text></Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={form.occupation}
                      onValueChange={val => handleChange('occupation', val)}
                      style={styles.picker}
                    >
                      <Picker.Item label={t('selectOccupation')} value="" />
                      <Picker.Item label={t('professional')} value={t('professional')} />
                      <Picker.Item label={t('skilled')} value={t('skilled')} />
                      <Picker.Item label={t('retired')} value={t('retired')} />
                      <Picker.Item label={t('housewife')} value={t('housewife')} />
                      <Picker.Item label={t('student')} value={t('student')} />
                      <Picker.Item label={t('unemployed')} value={t('unemployed')} />
                      <Picker.Item label={t('otherOccupation')} value={t('otherOccupation')} />
                    </Picker>
                  </View>
                </View>

                {form.occupation === t('otherOccupation') && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('specifyOccupation')} <Text style={styles.required}>*</Text></Text>
                    <TextInput 
                      style={styles.input} 
                      onChangeText={val => handleChange('occupationOther', val)}
                      placeholder={t('specifyOccupation')}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('monthlyIncome')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    keyboardType="numeric" 
                    style={styles.input} 
                    onChangeText={val => handleChange('income', val)}
                    placeholder={t('monthlyIncome')}
                    placeholderTextColor="#999"
                  />
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>{t('next')}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.formSection}>
                <View style={styles.formHeader}>
                  <Text style={styles.formHeaderText}>{t('tobaccoUsageInformation')}</Text>
                </View>
                <Text style={styles.title}>{t('profileSetup')} - {t('partB')}</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('typesOfTobacco')} <Text style={styles.required}>*</Text></Text>
                  <View style={styles.checkboxGroup}>
                    {[
                      t('chewingTobacco'), t('gutka'), t('khaini'), 
                      t('paan'), t('mawa'), t('misri'), t('gul'), t('otherTobaccoType')
                    ].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => toggleMultiSelect('tobaccoTypes', option)}
                        style={styles.checkboxRow}
                      >
                        <View style={[
                          styles.checkbox, 
                          form.tobaccoTypes.includes(option) && styles.checkboxSelected
                        ]} />
                        <Text style={styles.checkboxLabel}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {form.tobaccoTypes.includes(t('otherTobaccoType')) && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('specifyTobaccoType')} <Text style={styles.required}>*</Text></Text>
                    <TextInput 
                      style={styles.input} 
                      onChangeText={val => handleChange('otherTobaccoType', val)}
                      placeholder={t('specifyTobaccoType')}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('frequencyPerDay')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    keyboardType="numeric" 
                    style={styles.input} 
                    onChangeText={val => handleChange('frequencyPerDay', val)}
                    placeholder="e.g. 10"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('cravingTimings')} <Text style={styles.required}>*</Text></Text>
                  <View style={styles.checkboxGroup}>
                    {[
                      t('morning'), t('afterMeals'), t('whileWorking'), 
                      t('beforeSleep'), t('otherTiming')
                    ].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => toggleMultiSelect('cravingTimings', option)}
                        style={styles.checkboxRow}
                      >
                        <View style={[
                          styles.checkbox, 
                          form.cravingTimings.includes(option) && styles.checkboxSelected
                        ]} />
                        <Text style={styles.checkboxLabel}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {form.cravingTimings.includes(t('otherTiming')) && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('specifyTiming')} <Text style={styles.required}>*</Text></Text>
                    <TextInput 
                      style={styles.input} 
                      onChangeText={val => handleChange('otherCravingTiming', val)}
                      placeholder={t('specifyTiming')}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('yearsOfUse')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    keyboardType="numeric" 
                    style={styles.input} 
                    onChangeText={val => handleChange('yearsUsing', val)}
                    placeholder="e.g. 5"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('reasonForQuitting')} <Text style={styles.required}>*</Text></Text>
                  <View style={styles.checkboxGroup}>
                    {[
                      t('health'), t('family'), t('financialReasons'), 
                      t('selfRespect'), t('otherReason')
                    ].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => toggleMultiSelect('quittingReason', option)}
                        style={styles.checkboxRow}
                      >
                        <View style={[
                          styles.checkbox, 
                          form.quittingReason.includes(option) && styles.checkboxSelected
                        ]} />
                        <Text style={styles.checkboxLabel}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {form.quittingReason.includes(t('otherReason')) && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('specifyReason')} <Text style={styles.required}>*</Text></Text>
                    <TextInput 
                      style={styles.input} 
                      onChangeText={val => handleChange('quittingReasonOther', val)}
                      placeholder={t('specifyReason')}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('confidenceLevel')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    keyboardType="numeric" 
                    style={styles.input} 
                    onChangeText={val => handleChange('confidenceLevel', val)}
                    placeholder="e.g. 7"
                    placeholderTextColor="#999"
                    maxLength={2}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('healthIssues')}</Text>
                  <View style={styles.checkboxGroup}>
                    {[
                      t('cough'), t('breathingProblem'), t('heartDisease'), 
                      t('cancer'), t('otherHealthIssue')
                    ].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => toggleMultiSelect('healthIssues', option)}
                        style={styles.checkboxRow}
                      >
                        <View style={[
                          styles.checkbox, 
                          form.healthIssues.includes(option) && styles.checkboxSelected
                        ]} />
                        <Text style={styles.checkboxLabel}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {form.healthIssues.includes(t('otherHealthIssue')) && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('specifyHealthIssue')}</Text>
                    <TextInput 
                      style={styles.input} 
                      onChangeText={val => handleChange('healthIssuesOther', val)}
                      placeholder={t('specifyHealthIssue')}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('tobaccoTriggers')} <Text style={styles.required}>*</Text></Text>
                  <View style={styles.checkboxGroup}>
                    {[
                      t('stress'), t('peerPressure'), t('habit'), 
                      t('boredom'), t('otherTrigger')
                    ].map(option => (
                      <TouchableOpacity 
                        key={option} 
                        onPress={() => toggleMultiSelect('triggers', option)}
                        style={styles.checkboxRow}
                      >
                        <View style={[
                          styles.checkbox, 
                          form.triggers.includes(option) && styles.checkboxSelected
                        ]} />
                        <Text style={styles.checkboxLabel}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {form.triggers.includes(t('otherTrigger')) && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('specifyTrigger')} <Text style={styles.required}>*</Text></Text>
                    <TextInput 
                      style={styles.input} 
                      onChangeText={val => handleChange('otherTrigger', val)}
                      placeholder={t('specifyTrigger')}
                      placeholderTextColor="#999"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>{t('tobaccoSpending')} <Text style={styles.required}>*</Text></Text>
                  <TextInput 
                    keyboardType="numeric" 
                    style={styles.input} 
                    onChangeText={val => handleChange('tobaccoSpending', val)}
                    placeholder="e.g. 10"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.declarationContainer}>
                  <TouchableOpacity 
                    style={styles.checkboxRow}
                    onPress={() => setDeclaration(!declaration)}
                  >
                    <View style={[
                      styles.checkbox, 
                      declaration && styles.checkboxSelected
                    ]} />
                    <Text style={styles.declarationText}>{t('declaration')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.backButton} onPress={() => setShowPartB(false)}>
                    <Text style={styles.backButtonText}>{t('back')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.submitButton, !declaration && styles.submitButtonDisabled]} 
                    onPress={handleSubmit}
                    disabled={!declaration}
                  >
                    <Text style={styles.submitButtonText}>{t('submit')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      </ImageBackground>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  formHeader: {
    backgroundColor: '#3498DB',
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 20,
    padding: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  formHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#34495E',
  },
  required: {
    color: '#E74C3C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  picker: {
    height: 50,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#F8F8F8',
  },
  radioSelected: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  radioText: {
    color: '#34495E',
  },
  radioTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkboxGroup: {
    marginTop: 5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3498DB',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#3498DB',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#34495E',
  },
  nextButton: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  declarationContainer: {
    marginVertical: 20,
  },
  declarationText: {
    fontSize: 14,
    color: '#34495E',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#95A5A6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileForm;