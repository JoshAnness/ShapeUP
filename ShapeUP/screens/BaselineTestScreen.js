import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const BaselineTestScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  //const [age, setAge] = useState("");
  //const [weight, setWeight] = useState("");
  //const [heightFeet, setHeightFeet] = useState("4");
  //const [heightInches, setHeightInches] = useState("0");
  //const [sex, setSex] = useState("male");
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState(new Set());
  const [workoutFrequency, setWorkoutFrequency] = useState("");

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };  

  const selectFitnessLevel = (level) => {
    setFitnessLevel(level);
  };

  const selectWorkoutFrequency = (frequency) => {
    setWorkoutFrequency(frequency);
  };

  const handleBaselineSubmit = async () => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const baselineTestData = {
        fitnessLevel: fitnessLevel,
        selectedEquipment: Array.from(selectedEquipment), // Firestore doesn't support Set, so convert it to Array
        workoutFrequency: workoutFrequency,
      };
      
      try {
        // Save the baseline test data to the 'baselineTests' collection, under a document with the user's UID
        const baselineTestRef = doc(db, 'baselineTests', uid);
        await setDoc(baselineTestRef, baselineTestData, { merge: true });

        navigation.replace('Profile');
      } catch (error) {
        Alert.alert("Error", "There was an issue saving your data. Please try again.");
        console.error("Error adding baseline test: ", error);
      }
    } else {
      // Handle the case where there is no authenticated user
      Alert.alert("Error", "You need to be logged in to save your data.");
    }
  };

  const handleEquipmentSelection = (item) => {
    if (item === 'Body Only') {
      // If 'Body Only' is selected, clear other selections
      setSelectedEquipment(new Set([item]));
    } else {
      // For other items, ensure 'Body Only' is not selected
      const newSelection = new Set(selectedEquipment);
      newSelection.delete('Body Only'); // Remove 'Body Only' if present
      if (newSelection.has(item)) {
        newSelection.delete(item); // Toggle item if already selected
      } else {
        newSelection.add(item); // Add item to selection
      }
      setSelectedEquipment(newSelection);
    }
  };

  // Function to render equipment options
  const renderEquipmentOption = (item) => (
    <TouchableOpacity
      key={item}
      onPress={() => handleEquipmentSelection(item)}
      style={styles.optionContainer}
    >
      <Checkbox
        style={styles.checkbox}
        value={selectedEquipment.has(item)}
      />
      <Text style={styles.answerText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {currentStep === 1 && (
        <>

        <Text style={styles.mainQuestion}>What is your fitness level?</Text>
  
        <TouchableOpacity onPress={() => selectFitnessLevel('Beginner')} style={styles.option}>
          <Checkbox style={styles.checkbox} value={fitnessLevel.includes('Beginner')} />
          <View style={styles.textContainer}>
            <Text style={styles.answerText}>Beginner</Text>
            <Text style={styles.subtext}>I haven't lifted weights or just started</Text>
          </View>
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => selectFitnessLevel('Intermediate')} style={styles.option}>
          <Checkbox style={styles.checkbox} value={fitnessLevel.includes('Intermediate')} />
          <View style={styles.textContainer}>
            <Text style={styles.answerText}>Intermediate</Text>
            <Text style={styles.subtext}>I've done common weighted exercises</Text>
          </View>
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => selectFitnessLevel('Advanced')} style={styles.option}>
          <Checkbox style={styles.checkbox} value={fitnessLevel.includes('Advanced')} />
          <View style={styles.textContainer}>
            <Text style={styles.answerText}>Advanced</Text>
            <Text style={styles.subtext}>I've been lifting weights for a while</Text>
          </View>
        </TouchableOpacity>
      </>
      )}
      
      {currentStep === 2 && (
        <View style={styles.section}>
          <Text style={styles.mainQuestion}>What type of equipment do you have?</Text>
          {['Body Only', 'Machines', 'Barbells', 'Dumbells', 'Kettlebells', 'Cable', 'Bands', 'Exercise Ball', 'E-Z Curl Bar', 'Foam Roll', 'Medicine Ball'].map(renderEquipmentOption)}
        </View>
      )}

      {currentStep === 3 && (
        <>
          <Text style={styles.mainQuestion}>How often will you work out per week?</Text>

          {['1-2 days', '3-4 days', '5-6 days', 'Every day'].map((frequency) => (
            <TouchableOpacity
              key={frequency}
              onPress={() => selectWorkoutFrequency(frequency)}
              style={styles.option}
            >
              <Checkbox
                style={styles.checkbox}
                value={workoutFrequency === frequency}
              />
              <Text style={styles.answerText}>{frequency}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {currentStep === 3 ? (
        <Button title="Submit" onPress={handleBaselineSubmit} />
      ) : (
        <Button title="Next" onPress={handleNextStep} />
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
  checkbox: {
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1, 
  },
  section: {
    flexDirection: 'column',
    alignItems: 'flex-start', 
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
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
});

export default BaselineTestScreen;