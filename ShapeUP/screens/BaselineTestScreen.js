import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';

const fitnessLevelMap = {
  'Beginner': 'beginner',
  'Intermediate': 'intermediate',
  'Advanced': 'expert',
};

const BaselineTestScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState(new Set());

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

  const handleEquipmentSelection = (category) => {
    setSelectedEquipmentCategory(category);
  };

  const handleBaselineSubmit = async () => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const formattedFitnessLevel = fitnessLevelMap[fitnessLevel];
      const baselineTestData = {
        fitnessLevel: formattedFitnessLevel,
        selectedEquipmentCategory: selectedEquipmentCategory,
      };

      try {
        const baselineTestRef = doc(db, 'baselineTests', uid);
        await setDoc(baselineTestRef, baselineTestData, { merge: true });
        navigation.replace('Profile');
      } catch (error) {
        Alert.alert("Error", "There was an issue saving your data. Please try again.");
        console.error("Error adding baseline test: ", error);
      }
    } else {
      Alert.alert("Error", "You need to be logged in to save your data.");
    }
  };

  const renderEquipmentOption = (category, subtext) => (
    <TouchableOpacity
      key={category}
      onPress={() => handleEquipmentSelection(category)}
      style={styles.optionContainer}
    >
      <Checkbox
        style={styles.checkbox}
        value={selectedEquipmentCategory === category}
      />
      <View style={styles.textContainer}>
        <Text style={styles.answerText}>{category}</Text>
        {subtext && <Text style={styles.subtext}>{subtext}</Text>}
      </View>
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
          {renderEquipmentOption('Body Only')}
          {renderEquipmentOption('Home Gym', 'Foam Roll, Kettlebells, Dumbbell, Medicine Ball, Bands')}
          {renderEquipmentOption('Full Gym', 'Machines and other advanced equipment')}
        </View>
      )}

      {currentStep === 2 ? (
        <Button title="Submit" onPress={handleBaselineSubmit} />
      ) : (
        <Button title="Next" onPress={handleNextStep} />
      )}

      {currentStep > 1 && (
        <Button title="Previous" onPress={handlePreviousStep} />
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