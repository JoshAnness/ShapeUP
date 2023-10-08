import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
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

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  const selectFitnessLevel = (level) => {
    setExerciseTypes([level]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {currentStep === 1 && (
        <>

        <Text style={styles.mainQuestion}>What is your fitness level?</Text>
  
        <TouchableOpacity onPress={() => selectFitnessLevel('Beginner')} style={styles.option}>
          <Checkbox style={styles.checkbox} value={exerciseTypes.includes('Beginner')} />
          <View style={styles.textContainer}>
            <Text style={styles.answerText}>Regularly</Text>
            <Text style={styles.subtext}>I haven't lifted weights or just started</Text>
          </View>
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => selectFitnessLevel('Intermediate')} style={styles.option}>
          <Checkbox style={styles.checkbox} value={exerciseTypes.includes('Intermediate')} />
          <View style={styles.textContainer}>
            <Text style={styles.answerText}>Intermediate</Text>
            <Text style={styles.subtext}>I've done common weighted exercises</Text>
          </View>
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => selectFitnessLevel('Advanced')} style={styles.option}>
          <Checkbox style={styles.checkbox} value={exerciseTypes.includes('Advanced')} />
          <View style={styles.textContainer}>
            <Text style={styles.answerText}>Advanced</Text>
            <Text style={styles.subtext}>I've been lifting weights for a while</Text>
          </View>
        </TouchableOpacity>
      </>
      )}
      
      {currentStep === 2 && (
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
      </View>
      )}

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
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',  // Red color for the back arrow
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15, 
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  checkbox: {
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1, 
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  input: {
    width: '95%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 8,
  },
  pickerContainer: {
    width: '95%',
    height: 50,
    marginBottom: 125,
  },
  picker: {
    width: '100%',
    flex: 1,
  },
  submitButton: {
    marginTop: 10,
  },
  answerText: {
    fontSize: 19,
  },
  subtext: {
    fontSize: 14, 
    color: '#888',
  },
});

export default BaselineTestScreen;

