import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, TextInput, Image } from 'react-native';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';

const ExerciseLibraryScreen = () => {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedExercises, setSelectedExercises] = useState(new Set());
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseImages, setExerciseImages] = useState({});

  useEffect(() => {
    const fetchExercises = async () => {
      const storage = getStorage();
      const exercisesRef = ref(storage, 'exercises.json');
      try {
        const url = await getDownloadURL(exercisesRef);
        const response = await fetch(url);
        const data = await response.json();
        setExercises(data.exercises);
        setFilteredExercises(data.exercises);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
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
    if (exerciseImages[exerciseName]) return; // Avoid refetching images if already fetched

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
    ).then(urls => urls.filter(url => url)); // Filter out nulls

    setExerciseImages(prevState => ({ ...prevState, [exerciseName]: imageUrls }));
  };

  const toggleSelection = (exerciseName) => {
    const newSelectedExercises = new Set(selectedExercises);
    if (newSelectedExercises.has(exerciseName)) {
      newSelectedExercises.delete(exerciseName);
    } else {
      newSelectedExercises.add(exerciseName);
    }
    setSelectedExercises(newSelectedExercises);
    setSelectedExercise(exerciseName);
    fetchExerciseImages(exerciseName);
  };

  const confirmSelection = () => {
    navigation.navigate('WorkoutCreation', { selectedExercisesFromLibrary: Array.from(selectedExercises) });
  };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity onPress={() => toggleSelection(item.name)} style={styles.exerciseItem}>
      <Checkbox value={selectedExercises.has(item.name)} onValueChange={() => toggleSelection(item.name)} />
      <Text style={styles.exerciseText}>{item.name}</Text>
      {selectedExercise === item.name && exerciseImages[item.name]?.map((image, idx) => (
        <Image key={idx} source={{ uri: image }} style={styles.exerciseImage} resizeMode="contain" />
      ))}
    </TouchableOpacity>
  );

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
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderExerciseItem}
      />
      <Button title="Confirm Selection" onPress={confirmSelection} />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  exerciseText: {
    marginLeft: 8,
  },
  exerciseImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginVertical: 8,
  },
});

export default ExerciseLibraryScreen;