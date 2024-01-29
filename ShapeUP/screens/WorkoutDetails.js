import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Button,
  Platform,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const WorkoutDetails = ({ route }) => {
  const { workoutId } = route.params;
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [setsRepsData, setSetsRepsData] = useState({});
  const [weightData, setWeightData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        const docRef = doc(db, 'workouts', workoutId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          let data = docSnap.data();
          if (data.exercises) {
            data = await fetchExerciseImagesForWorkout(data);
            setWorkoutDetails(data);
            initializeSetsRepsData(data.exercises);
            initializeWeightData(data.exercises);
          } else {
            console.log('No exercises field in the document');
            setWorkoutDetails(data);
          }
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching workout details:', error);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId]);

  const initializeSetsRepsData = (exercises) => {
    const initialSetsRepsData = {};
    exercises.forEach((exercise) => {
      initialSetsRepsData[exercise.name] = {
        sets: '',
        reps: '',
      };
    });
    setSetsRepsData(initialSetsRepsData);
  };

  const initializeWeightData = (exercises) => {
    const initialWeightData = {};
    exercises.forEach((exercise) => {
      initialWeightData[exercise.name] = '';
    });
    setWeightData(initialWeightData);
  };

  const handleSetsRepsChange = (exerciseName, key, value) => {
    setSetsRepsData((prevData) => ({
      ...prevData,
      [exerciseName]: {
        ...prevData[exerciseName],
        [key]: value,
      },
    }));
  };

  const handleWeightChange = (exerciseName, value) => {
    setWeightData((prevData) => ({
      ...prevData,
      [exerciseName]: value,
    }));
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const saveDataToFirebase = async () => {
    try {
      const workoutDetailsRef = doc(db, 'workoutDetails', workoutId);
      const workoutDetailsDoc = await getDoc(workoutDetailsRef);

      if (workoutDetailsDoc.exists()) {
        await updateDoc(workoutDetailsRef, {
          [selectedDate.toISOString().split('T')[0]]: {
            setsRepsData,
            weightData,
          },
        });
      } else {
        await setDoc(workoutDetailsRef, {
          [selectedDate.toISOString().split('T')[0]]: {
            setsRepsData,
            weightData,
          },
        });
      }

      Alert.alert('Workout Saved', '', [{ text: 'OK', onPress: clearInputs }]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const clearInputs = () => {
    setSetsRepsData({});
    setWeightData({});
  };

  const fetchExerciseImagesForWorkout = async (workoutData) => {
    const storage = getStorage();
    const exercisesWithImages = await Promise.all(
      workoutData.exercises.map(async (exerciseName) => {
        const images = await fetchExerciseImages(exerciseName, storage);
        return { name: exerciseName, images };
      })
    );
    return {
      ...workoutData,
      exercises: exercisesWithImages,
    };
  };

  const fetchExerciseImages = async (exerciseName, storage) => {
    const sanitizedExerciseName = exerciseName.replace(/\s+/g, '_').replace(/'/g, '');
    const imageUrls = await Promise.all(
      [0, 1].map(async (index) => {
        const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_${index}.jpg`);
        return getDownloadURL(imageRef).catch(() => null);
      })
    );
    return imageUrls.filter((url) => url !== null);
  };

  if (!workoutDetails) {
    return <Text>Loading workout details...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{workoutDetails.name}</Text>

      <View style={styles.dateContainer}>
        <Text>Date: </Text>
        {Platform.OS === 'ios' ? (
          <Text style={styles.dateText} onPress={showDatePickerModal}>
            {selectedDate.toISOString().split('T')[0]}
          </Text>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      {workoutDetails.exercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseContainer}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Sets"
              keyboardType="numeric"
              value={setsRepsData[exercise.name]?.sets}
              onChangeText={(text) => handleSetsRepsChange(exercise.name, 'sets', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Reps"
              keyboardType="numeric"
              value={setsRepsData[exercise.name]?.reps}
              onChangeText={(text) => handleSetsRepsChange(exercise.name, 'reps', text)}
            />
            <TextInput
              style={styles.weightInput}
              placeholder="Weight (lbs)"
              keyboardType="numeric"
              value={weightData[exercise.name]}
              onChangeText={(text) => handleWeightChange(exercise.name, text)}
            />
          </View>

          {exercise.images.map((image, imgIndex) => (
            <Image key={imgIndex} source={{ uri: image }} style={styles.exerciseImage} />
          ))}
        </View>
      ))}

      <Button title="Save Data" onPress={saveDataToFirebase} color="#4CAF50" />

      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontWeight: 'bold',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weightInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 10,
  },
  exerciseContainer: {
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
});

export default WorkoutDetails;