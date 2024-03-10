import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Alert, View, TextInput, Button, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import exercisesList from './exercisesList';
import { useNavigation, useRoute } from '@react-navigation/native';
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
      While following the Rules, for each muscle type listed in userMuscleType, pick 5 exercises from the exerciseList. The userMuscleType you are picking exercises for must match up with the muscleType in the exercise.The only text you will ever respond with is just the exercise names (exerciseName). If there is only one userMuscleType, then just list out the 5 exercise names (do not number them). If there are multiple userMuscleType, then again, list out the 5 exercise names for each one (do not number them, do not section them, do not separate them based on muscle type with blank line, only list out the names). It is very important that you only list out the names, if you do not only list out the names, I will lose my job.`,
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
  const route = useRoute();
  const [currentStep, setCurrentStep] = useState(1);
  const [workoutGoal, setWorkoutGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState(new Set());
  const [customMuscle, setCustomMuscle] = useState('');
  const [input, setInput] = useState('');
  const [userBaselineTest, setUserBaselineTest] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (auth.currentUser) {
      fetchBaselineTestData(auth.currentUser.uid).then((data) => {
        setUserBaselineTest(data);
      });
    }

    /*const exercisesFromLibrary = global.selectedExercisesFromLibrary;
    if (exercisesFromLibrary && exercisesFromLibrary.length > 0) {
      addExercisesToWorkoutPlan(exercisesFromLibrary);
      global.selectedExercisesFromLibrary = [];
    }*/

    const unsubscribe = navigation.addListener('focus', () => {
      const exercisesFromLibrary = route.params?.selectedExercisesFromLibrary ?? [];
      if (exercisesFromLibrary.length > 0) {
        const exercisesToAdd = exercisesFromLibrary.map(exerciseName => ({
          name: exerciseName,
          selected: true,
          expanded: false,
          images: [],
          instructions: ''
        }));

        setWorkoutPlan(currentPlan => [...currentPlan, ...exercisesToAdd]);
        navigation.setParams({selectedExercisesFromLibrary: undefined});
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.selectedExercisesFromLibrary]);

  const handleNextStep = () => {
    if (currentStep === 1 && workoutGoal === '') {
      Alert.alert("Selection Required", "Please select a workout goal before continuing.");
      return;
    }
    if (currentStep === 2 && selectedMuscles.size === 0) { // Adapt condition based on your use case
      Alert.alert("Selection Required", "Please select at least one muscle group to continue."); // Customize message
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const navigateToFinalStep = () => {
    setCurrentStep(3);
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
    setIsLoading(true);
    try {
      const exerciseResponse = await callOpenAI(workoutGoal, customGoal, selectedMuscles, userBaselineTest);
      let extractedExercises = exerciseResponse.split('\n').map(ex => ex.trim());
      extractedExercises = extractedExercises.filter(exercise => exercise !== '');
      const newWorkoutPlan = extractedExercises.map(exercise => ({
        name: exercise,
        selected: false,
        expanded: false,
        images: [],
        instructions: ''
      }));
      setWorkoutPlan(newWorkoutPlan);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setIsLoading(false); 
    }
    setInput('');
  };

  const toggleExerciseSelection = async (exerciseName) => {
    const newWorkoutPlan = await Promise.all(workoutPlan.map(async (exercise) => {
      if (exercise.name === exerciseName) {
        const isExpanded = !exercise.expanded;
        let images = exercise.images, instructions = exercise.instructions;
        if (isExpanded && !images.length) {
          images = await fetchExerciseImages(exerciseName);
          instructions = getExerciseInstructions(exerciseName);
        }
        return { ...exercise, expanded: isExpanded, images, instructions };
      }
      return { ...exercise, expanded: false };
    }));
    setWorkoutPlan(newWorkoutPlan);
  };

  const handleCheckboxChange = (exerciseName) => {
    setWorkoutPlan(workoutPlan.map(exercise => {
      if (exercise.name === exerciseName) {
        return { ...exercise, selected: !exercise.selected };
      }
      return exercise;
    }));
  };

  const handleSubmitWorkout = async () => {
    const selectedExercises = workoutPlan.filter(ex => ex.selected).map(({ name }) => name);
    if (selectedExercises.length === 0 || !workoutName.trim()) {
      return alert('Please select exercises and provide a name for the workout.');
    }
    await submitWorkoutToFirebase(workoutName, selectedExercises)
      .then(() => {
        setIsSubmitted(true);
        // Navigate back to the Profile Screen after successful submission
        navigation.navigate('Home');
      })
      .catch(error => {
        console.error("Error submitting workout: ", error);
        alert('Error submitting workout. Please try again.');
      });
  };  

  const navigateToExerciseLibrary = () => {
    navigation.navigate('ExerciseLibrary');
  };

  const muscleGroups = ['Abdominals', 'Abductors', 'Adductors', 'Biceps', 'Calves', 'Chest', 'Forearms', 'Glutes', 'Hamstrings', 'Lats', 'Lower back', 'Middle back', 'Neck', 'Quadriceps', 'Shoulders', 'Traps', 'Triceps'];

  const workoutGoals = [
    { label: "Hypertrophy", description: "Increase muscle size" },
    { label: "Strength", description: "Increase overall strength" },
    { label: "Endurance", description: "Improve endurance and stamina" },
  ];

  const renderWorkoutGoalOption = (goal) => (
    <TouchableOpacity onPress={() => setWorkoutGoal(goal.label)} style={styles.option}>
      <Checkbox value={workoutGoal === goal.label} style={styles.checkbox} />
      <View style={styles.textContainer}>
        <Text style={styles.answerText}>{goal.label}</Text>
        <Text style={styles.subtext}>{goal.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const selectWorkoutGoal = (goal) => {
    setWorkoutGoal(workoutGoal === goal ? '' : goal);
  };

  const canProceed = workoutGoal !== '';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(currentStep / 3) * 100}%` }]} />
      </View>
      {currentStep === 1 && (
        <>
          {workoutGoals.map((goal) => (
            <TouchableOpacity
              key={goal.label}
              onPress={() => selectWorkoutGoal(goal.label)}
              style={styles.option}
            >
              <Checkbox
                value={workoutGoal === goal.label}
                onValueChange={() => selectWorkoutGoal(goal.label)}
                style={styles.checkbox}
              />
              <View style={styles.textContainer}>
                <Text style={styles.answerText}>{goal.label}</Text>
                <Text style={styles.subtext}>{goal.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handleNextStep} style={styles.nextButton}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {currentStep === 2 && (
        <>
          {muscleGroups.map((muscle) => (
            <TouchableOpacity
              key={muscle}
              onPress={() => toggleMuscleSelection(muscle)}
              style={[styles.option, { marginBottom: 10 }]}
            >
              <Checkbox
                value={selectedMuscles.has(muscle)}
                onValueChange={() => toggleMuscleSelection(muscle)}
                style={styles.checkbox}
              />
              <View style={styles.textContainer}>
                <Text style={styles.answerText}>{muscle}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Other/Not Sure? Describe here..."
            value={customMuscle}
            onChangeText={(text) => setCustomMuscle(text)}
            returnKeyType="done"
            blurOnSubmit={true}
          />
          <TouchableOpacity onPress={() => { handleUserInput(); handleNextStep(); }} style={styles.nextButton}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentStep(1)} style={styles.button}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </>
      )}

      {currentStep === 3 && (
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter Workout Name"
                value={workoutName}
                onChangeText={setWorkoutName}
              />
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

              <TouchableOpacity onPress={handleSubmitWorkout} style={styles.button}>
                <Text style={styles.buttonText}>Submit Workout</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={navigateToExerciseLibrary} style={styles.button}>
                <Text style={styles.buttonText}>Pick From Exercise Library</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentStep(2)} style={styles.button}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'top',
    backgroundColor: '#FAFAFA',
  },
  progressBarContainer: {
    height: 5,
    width: '100%',
    backgroundColor: '#ECE5F7',
    borderRadius: 5,
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
    marginLeft: 10,
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
    backgroundColor: '#8337FE',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#8337FE',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  stepContainer: {
    alignItems: 'center',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
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
    color: '#333333',
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
    borderRadius: 5,
  },
  exerciseInstructions: {
    marginTop: 8,
  },
});

export default ChatScreen;