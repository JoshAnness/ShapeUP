import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, TextInput, Image, ActivityIndicator, Modal, ScrollView } from 'react-native';
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
  const [exerciseImages, setExerciseImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerModalVisible, setPickerModalVisible] = useState(false);
  const [isLevelModalVisible, setLevelModalVisible] = useState(false);
  const levelOptions = ['Beginner', 'Intermediate', 'Expert'];

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
    let filtered = exercises.filter(exercise => {
      const muscleMatch = selectedMuscle === 'All' || exercise.primaryMuscles.some(muscle => muscle.toLowerCase() === selectedMuscle.toLowerCase());
      const levelMatch = selectedLevel === 'All' || exercise.level.toLowerCase() === selectedLevel.toLowerCase();
      const nameMatch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      return muscleMatch && levelMatch && nameMatch;
    });
    setFilteredExercises(filtered);
  };

  const fetchExerciseImages = async (exerciseName) => {
    if (exerciseImages[exerciseName]) return;

    setIsLoading(true);
    const storage = getStorage();
    const sanitizedExerciseName = exerciseName
      .replace(/\s+/g, '_')
      .replace(/'/g, '')
      .replace(/\//g, '_');

    const imageUrls = await Promise.all(
      [0, 1].map(async (index) => {
        try {
          const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_${index}.jpg`);
          return await getDownloadURL(imageRef);
        } catch (error) {
          console.log(error);
          return null;
        }
      })
    ).then(urls => urls.filter(url => url !== null));

    setExerciseImages(prevState => ({ ...prevState, [exerciseName]: imageUrls }));
    setIsLoading(false);
  };

  const toggleSelection = async (exerciseName) => {
    const newSelectedExercises = new Set(selectedExercises);
    if (newSelectedExercises.has(exerciseName)) {
      newSelectedExercises.delete(exerciseName);
    } else {
      newSelectedExercises.add(exerciseName);
      await fetchExerciseImages(exerciseName);
    }
    setSelectedExercises(newSelectedExercises);
  };

  const confirmSelection = () => {
    navigation.navigate('WorkoutCreation', { selectedExercisesFromLibrary: Array.from(selectedExercises) });
  };

  const renderExerciseItem = ({ item }) => (
    <View>
      <TouchableOpacity onPress={() => toggleSelection(item.name)} style={styles.exerciseItem}>
        <Checkbox value={selectedExercises.has(item.name)} onValueChange={() => toggleSelection(item.name)} />
        <Text style={styles.exerciseText}>{item.name}</Text>
      </TouchableOpacity>
      {selectedExercises.has(item.name) && exerciseImages[item.name] && (
        <FlatList
          data={exerciseImages[item.name]}
          horizontal
          renderItem={({ item: imageUrl }) => (
            <Image source={{ uri: imageUrl }} style={styles.exerciseImage} resizeMode="contain" />
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
        />
      )}
    </View>
  );

  const PickerModal = ({ visible, options, onSelect }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setPickerModalVisible(!visible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            {options.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => onSelect(item)}>
                <Text style={styles.modalText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
      <TouchableOpacity onPress={() => setPickerModalVisible(true)} style={styles.selectorButton}>
        <Text>{selectedMuscle === 'All' ? 'Select Muscle Group' : capitalizeFirstLetter(selectedMuscle)}</Text>
      </TouchableOpacity>
      <PickerModal
        visible={isPickerModalVisible}
        options={muscleOptions}
        onSelect={(selectedItem) => {
          setSelectedMuscle(selectedItem.toLowerCase());
          setPickerModalVisible(false);
        }}
      />
      <TouchableOpacity onPress={() => setLevelModalVisible(true)} style={styles.selectorButton}>
        <Text>{selectedLevel === 'All' ? 'Select Level' : capitalizeFirstLetter(selectedLevel)}</Text>
      </TouchableOpacity>
      <PickerModal
        visible={isLevelModalVisible}
        options={levelOptions}
        onSelect={(selectedItem) => {
          setSelectedLevel(selectedItem.toLowerCase());
          setLevelModalVisible(false);
        }}
      />
    </View>
    {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
    <FlatList
      data={filteredExercises}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      renderItem={renderExerciseItem}
    />
    <TouchableOpacity onPress={confirmSelection} style={styles.button}>
      <Text style={styles.buttonText}>Confirm Selection</Text>
    </TouchableOpacity>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF', // Set the background to white
  },
  searchBar: {
    marginBottom: 10,
    paddingHorizontal: 8,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFF', // Ensure the search bar also has a white background
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectorButton: {
    flex: 1,
    marginHorizontal: 4, // Reduced margin for a smaller overall width
    paddingVertical: 4, // Reduced padding to make the boxes smaller
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: '#FFF',
    height: 40, // Set a fixed height to make the selector boxes smaller
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
    alignSelf: 'center',
    marginTop: 5,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#ECE5F7',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#8337FE',
    fontWeight: '600',
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalText: {
    textAlign: 'center',
  },
});

export default ExerciseLibraryScreen;