import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import exercisesList from './exercisesList';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

const fetchBaselineTestData = async (userId) => {
  const docRef = doc(db, 'baselineTests', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log('No such document!');
    return null;
  }
};

const callOpenAI = async (workoutGoal, customGoal, selectedMuscles, userBaselineTest) => {
  const apiKey = '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';
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const modelIdentifier = 'gpt-4-1106-preview';

  const muscleTypeList = Array.from(selectedMuscles).join(', ');

  const actualWorkoutGoal = workoutGoal === 'Something Else' ? customGoal : workoutGoal;

  let exercisesArray = exercisesList.split('), ');

  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
  }

  shuffleArray(exercisesArray);
  const randomizedExercisesList = exercisesArray.join('), ') + ')';

  // Guidance inspired by Huberman/Galpin Podcast Notes - https://podcastnotes.org/huberman-lab/guest-series-dr-andy-galpin-optimal-protocols-to-build-strength-grow-muscles-part-2-huberman-lab/
  const messages = [
    {
      role: 'system',
      content: `You are an exercise and workout coach. You will be choosing exercises from a list of exercises (exerciseList) that is formatted like this (exerciseName,fitnessLevel,equipmentType,muscleType). 

      You will receive an input from the user that will be like this:
      List of exercises: {exerciseList}.
      Fitness goal: {fitnessGoal}. 
      Fitness level: {userFitnessLevel}
      Equipment type: {userEquipmentType}.
      Muscle Types: {userMuscleType}.
      
      Rules:
      If the userFitnessLevel is beginner, then only choose exercises from the exerciseList where the fitnessLevel is beginner. If the userFitnessLevel is intermediate, then only choose exercises from the exerciseList where the fitnessLevel is beginner or intermediate. If the userFitnessLevel is expert, you can choose exercises from the exerciseList where the fitnessLevel is beginner, intermediate, or expert. If the userEquipmentType is Body Only, then only choose exercises where equipmentType is Body Only. If the userEquipmentType is Home Gym, then only choose exercises where equipmentType is Body Only or Home Gym.  If the userEquipmentType is Full Gym, then you can choose exercises where equipmentType is Body Only, Home Gym, or Full Gym exercises. If fitnessGoal is Hypertrophy, then choose from exercises that would help hypertrophy and would be a mix of bilateral and unilateral movements. If fitnessGoal is Speed, Power, and Strength, then choose from exercises that are mostly compound movements. 
      
      
      Job:
      While following the Rules, for each muscle type listed in userMuscleType, pick 5 exercises from the exerciseList. The userMuscleType you are picking exercises for must match up with the muscleType in the exercise.The only text you will ever respond with is just the exercise names (exerciseName). If there is only one userMuscleType, then just list out the 5 exercise names (do not number them). If there are multiple userMuscleType, then again, list out the 5 exercise names for each one (do not number them, do not section them, do not separate them with a blank line, only list out the names). It is very important that you only list out the names, if you do not only list out the names, I will lose my job.`,
    },
    {
      role: 'user',
      content: `List of exercises: ${randomizedExercisesList}.
      Fitness goal: ${actualWorkoutGoal}. 
      Fitness level: ${userBaselineTest.fitnessLevel}.
      Equipment type: ${userBaselineTest.selectedEquipmentCategory}.
      Muscle Types: ${muscleTypeList}.`,
    },
  ];

  console.log(`My fitness level is ${userBaselineTest.fitnessLevel} level. My gym type is ${userBaselineTest.selectedEquipmentCategory}. My fitness goal is: ${actualWorkoutGoal}. (Muscles listed: ${muscleTypeList}). Here is the list of exercises to choose from in the (exercise name,fitness level,gym type,muscle type)`)

  const response = await axios.post(
    endpoint,
    { model: modelIdentifier, messages },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  return response.data.choices[0].message.content;
};

const storage = getStorage();

const fetchExerciseImages = async (exerciseName) => {
  const sanitizedExerciseName = exerciseName
    .replace(/\s+/g, '_')
    .replace(/'/g, '')
    .replace(/\//g, '_');

  const imageUrls = await Promise.all(
    [0, 1].map(async (index) => {
      const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_${index}.jpg`);
      return getDownloadURL(imageRef).catch(() => null); 
    })
  );

  return imageUrls.filter(url => url !== null);
};

const getExerciseInstructions = (exerciseName) => {
  
};

const submitWorkoutToFirebase = async (workoutName, workoutExercises) => {
  try {
    const docRef = await addDoc(collection(db, "workouts"), {
      name: workoutName,
      exercises: workoutExercises,
      userId: auth.currentUser.uid,
      createdAt: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const ChatScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [workoutGoal, setWorkoutGoal] = useState('Hypertrophy');
  const [customGoal, setCustomGoal] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState(new Set());
  const [customMuscle, setCustomMuscle] = useState('');
  const [input, setInput] = useState('');
  const [userBaselineTest, setUserBaselineTest] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    if (auth.currentUser) {
      fetchBaselineTestData(auth.currentUser.uid).then((data) => {
        setUserBaselineTest(data);
      });
    }
  }, []);

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalSelection = (itemValue, itemIndex) => {
    setWorkoutGoal(itemValue);
    if (itemValue === 'Something Else' && customGoal === '') {
    } else if (itemValue !== 'Something Else') {
      setCustomGoal('');
    }
  };

  const toggleMuscleSelection = (muscle) => {
    const newSelection = new Set(selectedMuscles);
    if (newSelection.has(muscle)) {
      newSelection.delete(muscle);
    } else {
      newSelection.add(muscle);
    }
    setSelectedMuscles(newSelection);
  };

  const handleUserInput = async () => {
    if (!userBaselineTest) {
      console.log('Baseline test data not available.');
      return;
    }
    const exerciseResponse = await callOpenAI(workoutGoal, customGoal, selectedMuscles, userBaselineTest);
    const extractedExercises = exerciseResponse.split('\n').map(ex => ex.trim());
    const newWorkoutPlan = extractedExercises.map(exercise => ({
      name: exercise,
      selected: false,
      expanded: false,
      images: [], 
      instructions: '' 
    }));
    setWorkoutPlan(newWorkoutPlan);
    setInput('');
  };

  const toggleExerciseSelection = async (exerciseName) => {
    const newWorkoutPlan = await Promise.all(workoutPlan.map(async (exercise) => {
      if (exercise.name === exerciseName) {
        const isExpanded = !exercise.expanded;
        let images = exercise.images, instructions = exercise.instructions;
        if (isExpanded && !images.length) {
          // Fetch images and instructions only if not already fetched
          images = await fetchExerciseImages(exerciseName);
          instructions = getExerciseInstructions(exerciseName);
        }
        return { ...exercise, expanded: isExpanded, images, instructions };
      }
      return { ...exercise, expanded: false }; // Collapse other exercises
    }));
    setWorkoutPlan(newWorkoutPlan);
  };

  const handleSubmitWorkout = async () => {
    const selectedExercises = workoutPlan.filter(ex => ex.selected).map(({ name }) => name);
    if (selectedExercises.length === 0 || !workoutName.trim()) {
      return alert('Please select exercises and provide a name for the workout.');
    }
    await submitWorkoutToFirebase(workoutName, selectedExercises);
    setIsSubmitted(true);
  };

  const muscleGroups = ['Abdominals', 'Abductors', 'Adductors', 'Biceps', 'Calves', 'Chest', 'Forearms', 'Glutes', 'Hamstrings', 'Lats', 'Lower back', 'Middle back', 'Neck', 'Quadriceps', 'Shoulders', 'Traps', 'Triceps'];

  return (
    <ScrollView style={styles.container}>
      {currentStep === 1 && (
        <>
          <Text style={styles.title}>Select Your Workout Goal</Text>
          <Picker
            selectedValue={workoutGoal}
            style={styles.picker}
            onValueChange={handleGoalSelection}>
            <Picker.Item label="Hypertrophy (Muscle Size)" value="Hypertrophy" />
            <Picker.Item label="Speed, Power, and Strength" value="Speed, Power, and Strength" />
            <Picker.Item label="Something Else" value="Something Else" />
          </Picker>
          {workoutGoal === 'Something Else' && (
            <TextInput
              style={styles.input}
              placeholder="Specify your goal"
              value={customGoal}
              onChangeText={setCustomGoal}
            />
          )}
          <Button title="Next" onPress={handleNextStep} />
        </>
      )}
  
      {currentStep === 2 && (
        <>
          <Text style={styles.title}>Select Muscles to Work Out</Text>
          {muscleGroups.map((muscle) => (
            <View key={muscle} style={styles.checkboxContainer}>
              <Checkbox
                value={selectedMuscles.has(muscle)}
                onValueChange={() => toggleMuscleSelection(muscle)}
              />
              <Text style={styles.label}>{muscle}</Text>
            </View>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Other/Not Sure? Describe here..."
            value={customMuscle}
            onChangeText={(text) => setCustomMuscle(text)}
            onSubmitEditing={() => {
              if (customMuscle.trim() !== '') {
                toggleMuscleSelection(customMuscle.trim());
              }
              handleNextStep();
            }}
          />
          <Button title="Next" onPress={() => { handleUserInput(); handleNextStep(); }} />
        </>
      )}
  
      {currentStep === 3 && (
        <>
          <ScrollView style={styles.scrollView}>
            {workoutPlan.map((exercise, index) => (
              <View key={index}>
                <View style={styles.exerciseItem}>
                  <Checkbox
                    value={exercise.selected}
                    onValueChange={() => handleCheckboxChange(exercise.name)}
                    color={exercise.selected ? "#007AFF" : undefined}
                  />
                  <TouchableOpacity onPress={() => toggleExerciseSelection(exercise.name)}>
                    <Text style={styles.exerciseText}>{exercise.name}</Text>
                  </TouchableOpacity>
                </View>
                {exercise.expanded && (
                  <View style={styles.selectedExercise}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {exercise.images.map((image, imgIndex) => (
                        <Image key={imgIndex} source={{ uri: image }} style={styles.exerciseImage} />
                      ))}
                    </ScrollView>
                    <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.submitContainer}>
            <Button
              title="Submit Workout"
              onPress={handleSubmitWorkout}
              color="#007AFF"
              disabled={isSubmitted}
            />
            {isSubmitted && <Text style={styles.submissionStatus}>Workout submitted successfully!</Text>}
          </View>
        </>
      )}
  
      {currentStep > 1 && <Button title="Previous" onPress={handlePreviousStep} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6', // Light grey background
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF', // White background for input
  },
  scrollView: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF', // White background for list items
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,  
    elevation: 3,
  },
  exerciseText: {
    marginLeft: 8,
    color: '#333333', // Dark text for better readability
  },
  selectedExercise: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,  
    elevation: 3,
  },
  exerciseName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseImage: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 5, // Rounded corners for images
  },
  exerciseInstructions: {
    marginTop: 8,
  },
  submitContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  submissionStatus: {
    marginTop: 10,
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    marginRight: 8,
  },
  label: {
    marginLeft: 8,
  },
});

export default ChatScreen;