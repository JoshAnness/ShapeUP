import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { format, parseISO } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

function DateDetails({ route }) {
  const { selectedDate } = route.params;
  const [workoutDetails, setWorkoutDetails] = useState([]);
  const [exerciseInputs, setExerciseInputs] = useState({});
  const [visibleImages, setVisibleImages] = useState({});

  useEffect(() => {
    const dayOfWeek = format(parseISO(selectedDate), 'EEEE');
    const fetchWorkoutDetailsForDay = async () => {
      const q = query(collection(db, 'workouts'), where('assignedDays', 'array-contains', dayOfWeek));
      const querySnapshot = await getDocs(q);
      const workoutsPromises = querySnapshot.docs.map(async (doc) => {
        const workoutData = doc.data();
        const exercisesWithImages = await fetchExercisesImages(workoutData.exercises);
        return { ...workoutData, id: doc.id, exercises: exercisesWithImages };
      });
      const workouts = await Promise.all(workoutsPromises);
      setWorkoutDetails(workouts);
      workouts.forEach(workout => loadExerciseInputs(workout.id));
    };

    const fetchExercisesImages = async (exercises) => {
      const storage = getStorage();
      return Promise.all(exercises.map(async (exercise) => {
        const imageUrls = await Promise.all([0, 1].map(async index => {
          const imageRef = ref(storage, `exercise_images/${exercise.replace(/\s+/g, '_').replace(/'/g, '').replace(/\//g, '_')}_${index}.jpg`);
          try {
            return await getDownloadURL(imageRef);
          } catch {
            return ''; // Return an empty string if the image is not found
          }
        }));
        return { name: exercise, images: imageUrls.filter(Boolean) }; // Filter out empty strings
      }));
    };

    const loadInputs = async () => {
      for (const workout of workoutDetails) {
        const docRef = doc(db, "exerciseInputs", `${workout.id}_${format(parseISO(selectedDate), 'yyyy-MM-dd')}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setExerciseInputs(prev => ({
            ...prev,
            [workout.id]: docSnap.data(),
          }));
        }
      }
    };

    if (workoutDetails.length > 0) {
        loadInputs();
    }

    fetchWorkoutDetailsForDay();
  }, [workoutDetails, selectedDate]);

  const loadExerciseInputs = async (workoutId) => {
    const docRef = doc(db, "exerciseInputs", workoutId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setExerciseInputs(prev => ({ ...prev, [workoutId]: docSnap.data() }));
    }
  };

  const handleExerciseInput = async (workoutId, exerciseName, field, value) => {
    const updatedInputs = {
      ...exerciseInputs[workoutId],
      [exerciseName]: {
        ...exerciseInputs[workoutId]?.[exerciseName],
        [field]: value,
      },
    };

    setExerciseInputs(prev => ({ ...prev, [workoutId]: updatedInputs }));

    const docRef = doc(db, "exerciseInputs", `${workoutId}_${format(parseISO(selectedDate), 'yyyy-MM-dd')}`);

    try {
      await setDoc(docRef, { [exerciseName]: updatedInputs[exerciseName] }, { merge: true });
      console.log("Successfully updated Firestore.");
    } catch (error) {
      console.error("Error updating Firestore: ", error);
    }
  };

  const toggleVisibility = (workoutId, exerciseName) => {
    setVisibleImages(prev => ({
      ...prev,
      [workoutId]: {
        ...prev[workoutId],
        [exerciseName]: !prev[workoutId]?.[exerciseName],
      },
    }));
  };

  const ImageContainer = ({images}) => (
    <View style={styles.imagesContainer}>
      {images.map((imageUrl, idx) => (
        <Image key={idx} source={{ uri: imageUrl }} style={styles.image} />
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {workoutDetails.map((workout) => (
        <View key={workout.id}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          {workout.exercises.map((exercise) => (
            <View key={exercise.name} style={styles.exerciseContainer}>
              <TouchableOpacity onPress={() => toggleVisibility(workout.id, exercise.name)}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                {visibleImages[workout.id]?.[exercise.name] && (
                  <View style={styles.imagesContainer}>
                    {exercise.images.map((imageUrl, idx) => (
                      <Image key={idx} source={{ uri: imageUrl }} style={styles.image} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Sets"
                onChangeText={(text) => handleExerciseInput(workout.id, exercise.name, 'sets', text)}
                value={exerciseInputs[workout.id]?.[exercise.name]?.sets || ''}
              />
              <TextInput
                style={styles.input}
                placeholder="Reps"
                onChangeText={(text) => handleExerciseInput(workout.id, exercise.name, 'reps', text)}
                value={exerciseInputs[workout.id]?.[exercise.name]?.reps || ''}
              />
              <TextInput
                style={styles.input}
                placeholder="Max Weight"
                onChangeText={(text) => handleExerciseInput(workout.id, exercise.name, 'weight', text)}
                value={exerciseInputs[workout.id]?.[exercise.name]?.weight || ''}
              />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );  
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseContainer: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imagesScrollView: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  image: {
    width: (screenWidth - 40) / 2,
    height: 200,
    resizeMode: 'contain',
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
});

export default DateDetails;