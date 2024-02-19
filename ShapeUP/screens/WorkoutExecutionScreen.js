import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, Button } from 'react-native';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const WorkoutExecutionScreen = ({ route }) => {
  const { selectedDate } = route.params;
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'workouts'), where('assignedDays', 'array-contains', selectedDate));
        const querySnapshot = await getDocs(q);
        const workoutPromises = querySnapshot.docs.map(async (doc) => {
          const workoutData = doc.data();
          const exercises = await Promise.all(workoutData.exercises.map(async (exerciseName) => {
            const imageUrls = await fetchExerciseImages(exerciseName);
            return { name: exerciseName, imageUrls, sets: '', reps: '', weight: '' };
          }));
          return { ...workoutData, exercises };
        });
        const workoutsData = await Promise.all(workoutPromises);
        setWorkouts(workoutsData);
      } catch (error) {
        console.error("Error fetching workout data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [selectedDate]);

  const fetchExerciseImages = async (exerciseName) => {
    const sanitizedExerciseName = exerciseName.replace(/\s+/g, '_').replace(/'/g, '').replace(/\//g, '_');
    const storage = getStorage();
    const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_0.jpg`);
    try {
      const imageUrl = await getDownloadURL(imageRef);
      return [imageUrl]; // Return an array with the image URL
    } catch (error) {
      console.log(`No image found for ${exerciseName}`);
      return []; // Return an empty array if no image is found
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {workouts.map((workout, workoutIndex) => (
        <View key={workoutIndex} style={styles.workoutContainer}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          {workout.exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              {exercise.imageUrls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.exerciseImage} />
              ))}
              <TextInput
                placeholder="Sets"
                onChangeText={(text) => {
                  const newWorkouts = [...workouts];
                  newWorkouts[workoutIndex].exercises[exerciseIndex].sets = text;
                  setWorkouts(newWorkouts);
                }}
                value={exercise.sets}
                style={styles.input}
              />
              <TextInput
                placeholder="Reps"
                onChangeText={(text) => {
                  const newWorkouts = [...workouts];
                  newWorkouts[workoutIndex].exercises[exerciseIndex].reps = text;
                  setWorkouts(newWorkouts);
                }}
                value={exercise.reps}
                style={styles.input}
              />
              <TextInput
                placeholder="Weight"
                onChangeText={(text) => {
                  const newWorkouts = [...workouts];
                  newWorkouts[workoutIndex].exercises[exerciseIndex].weight = text;
                  setWorkouts(newWorkouts);
                }}
                value={exercise.weight}
                style={styles.input}
              />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  workoutContainer: {
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseContainer: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
});

export default WorkoutExecutionScreen;