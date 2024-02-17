import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';

const ExerciseLibraryScreen = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseImages, setExerciseImages] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      const storage = getStorage();
      const exercisesRef = ref(storage, 'exercises.json');
      const url = await getDownloadURL(exercisesRef);
      const response = await fetch(url);
      const data = await response.json();
      setExercises(data.exercises);
      setFilteredExercises(data.exercises);
    };
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedMuscle, selectedLevel, exercises]);

  const filterExercises = () => {
    let filtered = exercises.filter(exercise =>
      (selectedMuscle === 'All' || exercise.primaryMuscles.map(m => m.toLowerCase()).includes(selectedMuscle.toLowerCase())) &&
      (selectedLevel === 'All' || exercise.level === selectedLevel) &&
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExercises(filtered);
  };

  const fetchExerciseImages = async (exerciseName) => {
    const sanitizedExerciseName = exerciseName.replace(/\s+/g, '_').replace(/'/g, '').replace(/\//g, '_');
    const storage = getStorage();
    const imageUrls = await Promise.all(
      [0, 1].map(async (index) => {
        try {
          const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_${index}.jpg`);
          return await getDownloadURL(imageRef);
        } catch (error) {
          return null;
        }
      })
    );
    return imageUrls.filter(url => url);
  };

  const handleSelectExercise = async (exerciseName) => {
    if (selectedExercise === exerciseName) {
      setSelectedExercise(null);
      setExerciseImages([]);
    } else {
      setSelectedExercise(exerciseName);
      const images = await fetchExerciseImages(exerciseName);
      setExerciseImages(images);
    }
  };

  const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

  const uniqueMuscles = Array.from(new Set(exercises.flatMap(exercise => exercise.primaryMuscles))).sort();
  const muscleOptions = uniqueMuscles.map(muscle => capitalizeFirstLetter(muscle));

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Exercises"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.filters}>
        <Picker
          selectedValue={selectedMuscle}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMuscle(itemValue)}
          prompt="Select Muscle Group">
          <Picker.Item label="All Muscles" value="All" />
          {muscleOptions.map((muscle, index) => (
            <Picker.Item key={index} label={muscle} value={muscle.toLowerCase()} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedLevel}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedLevel(itemValue)}
          prompt="Select Level">
          <Picker.Item label="All Levels" value="All" />
          <Picker.Item label="Beginner" value="beginner" />
          <Picker.Item label="Intermediate" value="intermediate" />
          <Picker.Item label="Expert" value="expert" />
        </Picker>
      </View>
      <FlatList
        data={filteredExercises}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.exerciseItem} onPress={() => handleSelectExercise(item.name)}>
            <Text style={styles.title}>{item.name}</Text>
            {selectedExercise === item.name && exerciseImages.map((image, idx) => (
              <Image key={idx} source={{ uri: image }} style={styles.exerciseImage} resizeMode="contain" />
            ))}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `${item.name}-${index}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    marginBottom: 20,
    paddingHorizontal: 8,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    marginHorizontal: 6,
  },
  exerciseItem: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 8,
  },
});

export default ExerciseLibraryScreen;
