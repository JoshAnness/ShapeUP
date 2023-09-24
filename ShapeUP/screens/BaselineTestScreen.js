import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import Checkbox from 'expo-checkbox';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const BaselineTestScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("4");
  const [heightInches, setHeightInches] = useState("0");
  const [sex, setSex] = useState("male");
  const [exerciseTypes, setExerciseTypes] = useState([]);
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [exerciseFrequency, setExerciseFrequency] = useState("");

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBaselineSubmit = async () => {

    try {
      const baselineTestRef = doc(db, 'baselineTests', auth.currentUser.uid);
      await setDoc(baselineTestRef, {
        age: parseInt(age),
        weight: parseInt(weight),
        heightFeet: heightFeet,
        heightInches: heightInches,
        sex: sex,
        exerciseTypes: exerciseTypes,
        fitnessLevel: fitnessLevel,
        equipment: equipment,
        exerciseFrequency: exerciseFrequency
      });

      navigation.replace('Profile');
    } catch (error) {
      Alert.alert("Error", "There was an issue saving your data. Please try again.");
      console.error("Error adding baseline test: ", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {currentStep === 1 && (
        <View style={styles.section}>
          <Text>What type of exercise do you do?</Text>
          <Checkbox
            style={styles.checkbox}
            value={exerciseTypes.includes('Endurance')}
            onValueChange={() => {
              if (exerciseTypes.includes('Endurance')) {
                setExerciseTypes(exerciseTypes.filter(type => type !== 'Endurance'));
              } else {
                setExerciseTypes([...exerciseTypes, 'Endurance']);
              }
            }}
          />
          <Text>Endurance</Text>
          {/* Add other checkboxes similarly */}
        </View>
      )}
      {currentStep === 2 && (
        <View>
          <Text>What is your fitness level?</Text>
          <Picker selectedValue={fitnessLevel} onValueChange={(itemValue) => setFitnessLevel(itemValue)}>
            <Picker.Item label="Beginner" value="beginner" />
            <Picker.Item label="Intermediate" value="intermediate" />
            <Picker.Item label="Advanced" value="advanced" />
          </Picker>
        </View>
      )}
      {currentStep === 3 && (
        <View style={styles.section}>
          <Text>What type of equipment do you have?</Text>
          <Checkbox
            style={styles.checkbox}
            value={equipment.includes('Full gym')}
            onValueChange={() => {
              if (equipment.includes('Full gym')) {
                setEquipment(equipment.filter(equip => equip !== 'Full gym'));
              } else {
                setEquipment([...equipment, 'Full gym']);
              }
            }}
          />
          <Text>Full gym</Text>
          {/* Add other checkboxes similarly */}
        </View>
      )}
      {/* Continue adding your questions */}
      {currentStep < 9 ? (
        <Button title="Next" onPress={handleNextStep} />
      ) : (
        <Button title="Submit" onPress={handleBaselineSubmit} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: '5%',
    backgroundColor: '#f4f4f8',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // added this to make sure they stretch and align properly
    marginBottom: 10, // added this for some spacing
  },
  checkbox: {
    margin: 8,
  },
  input: {
    width: '95%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 8
  },
  pickerContainer: {
    width: '95%',
    height: 50,
    marginBottom: 125
  },
  picker: {
    width: '100%',
    flex: 1,
  },
  submitButton: {
    marginTop: 10,
  },
});

export default BaselineTestScreen;
