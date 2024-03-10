import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
    if (currentStep === 1 && fitnessLevel === '') {
      Alert.alert("Error", "Please select your fitness level to continue.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectFitnessLevel = (level) => {
    setFitnessLevel(fitnessLevel === level ? '' : level);
  };

  const handleEquipmentSelection = (category) => {
    let newSet = new Set(selectedEquipmentCategory);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedEquipmentCategory(newSet);
  };

  const handleBaselineSubmit = async () => {
    if (currentStep === 2 && selectedEquipmentCategory.size === 0) {
      Alert.alert("Error", "Please select at least one equipment option to continue.");
      return;
    }

    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const formattedFitnessLevel = fitnessLevelMap[fitnessLevel];
      const baselineTestData = {
        fitnessLevel: formattedFitnessLevel,
        selectedEquipmentCategory: Array.from(selectedEquipmentCategory),
      };

      try {
        const baselineTestRef = doc(db, 'baselineTests', uid);
        await setDoc(baselineTestRef, baselineTestData, { merge: true });
        navigation.replace('Home');
      } catch (error) {
        Alert.alert("Error", "There was an issue saving your data. Please try again.");
        console.error("Error adding baseline test: ", error);
      }
    } else {
      Alert.alert("Error", "You need to be logged in to save your data.");
    }
  };

  const renderFitnessLevelOption = (level, description) => (
    <TouchableOpacity onPress={() => selectFitnessLevel(level)} style={styles.option}>
      <Checkbox value={fitnessLevel === level} style={styles.checkbox} />
      <View style={styles.textContainer}>
        <Text style={styles.answerText}>{level}</Text>
        <Text style={styles.subtext}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEquipmentOption = (category, subtext) => (
    <TouchableOpacity
      onPress={() => handleEquipmentSelection(category)}
      style={styles.option}
    >
      <Checkbox
        value={selectedEquipmentCategory.has(category)}
        style={styles.checkbox}
      />
      <View style={styles.textContainer}>
        <Text style={styles.answerText}>{category}</Text>
        {subtext && <Text style={styles.subtext}>{subtext}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(currentStep / 2) * 100}%` }]} />
      </View>
      {currentStep === 1 && (
        <>
          {renderFitnessLevelOption('Beginner', "I haven't lifted weights or just started")}
          {renderFitnessLevelOption('Intermediate', "I've done common weighted exercises")}
          {renderFitnessLevelOption('Advanced', "I've been lifting weights for a while")}
          <TouchableOpacity onPress={handleNextStep} style={styles.nextButton}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}
      {currentStep === 2 && (
        <>
          {renderEquipmentOption('Body Only', '')}
          {renderEquipmentOption('Home Gym', 'Foam Roll, Kettlebells, Dumbbell, Medicine Ball, Bands')}
          {renderEquipmentOption('Full Gym', 'Machines and other advanced equipment')}
          <TouchableOpacity onPress={handleBaselineSubmit} style={styles.submitButton}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}
      {currentStep > 1 && (
        <TouchableOpacity onPress={handlePreviousStep} style={styles.backButton}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
    justifyContent: 'flex-start',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  progressBarContainer: {
    height: 5,
    width: '100%',
    backgroundColor: '#ECE5F7',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8337FE',
    borderRadius: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
  },
  checkbox: {
    marginRight: 10,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 14,
    color: '#AAA',
  },
  nextButton: {
    backgroundColor: '#ECE5F7',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#ECE5F7',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#ECE5F7',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#8337FE',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default BaselineTestScreen;