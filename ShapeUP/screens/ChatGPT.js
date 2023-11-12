import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, Image } from 'react-native';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';

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

const callOpenAI = async (input, userBaselineTest, equipment) => {
  const apiKey = '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';
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const modelIdentifier = 'ftjob-HQx9vt6zFfXh7DpaEhKXwTKU';

  const messages = [
    {
      role: 'system',
      content: `You are an exercise and workout coach. You prescribe specific exercise plans and workouts based on the user's goal and info/parameters.`,
    },
    {
      role: 'user',
      content: `User Goal: ${input}. Give me a ${userBaselineTest.fitnessLevel} level, ${equipment} type of equipment exercise.`,
    },
  ];

  const response = await axios.post(
    endpoint,
    { model: modelIdentifier, messages },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  return response.data.choices[0].message.content;
};

const fetchExerciseImages = (exerciseName) => {
  // Import the images from the local assets directory
  const exercisePath = exerciseName.replace(/\s+/g, '_');
  // Try to require images from the assets folder
  try {
    const images = [];
    let index = 0;
    while (true) {
      const image = require(`./assets/exercises/${exercisePath}/images/${index}.jpg`);
      images.push(image);
      index++;
    }
    return images;
  } catch (error) {
    console.log('No more images found for this exercise.');
    return null;
  }
};

const ChatScreen = () => {
  const [input, setInput] = useState('');
  const [userBaselineTest, setUserBaselineTest] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      fetchBaselineTestData(auth.currentUser.uid).then((data) => {
        setUserBaselineTest(data);
      });
    }
  }, []);

  const handleUserInput = async () => {
    if (!userBaselineTest) {
      console.log('Baseline test data not available.');
      return;
    }

    let exercises = [];
    for (let equipment of userBaselineTest.selectedEquipment) {
      let exercise = await callOpenAI(input, userBaselineTest, equipment);
      exercises.push(exercise);
    }
    setWorkoutPlan(exercises);
    setInput('');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView style={{ flex: 1 }}>
        {workoutPlan.map((exercise, index) => (
          <TouchableOpacity key={index} onPress={() => displayExerciseImages(exercise)}>
            <Text>{exercise}</Text>
          </TouchableOpacity>
        ))}
        {selectedExercise && (
          <View>
            <Text>{selectedExercise.name}</Text>
            <ScrollView horizontal>
              {selectedExercise.images?.map((image, index) => (
                <Image key={index} source={image} style={{ width: 100, height: 100 }} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="What's your workout goal?"
      />
      <Button title="Get Workout Plan" onPress={handleUserInput} />
    </View>
  );
};

export default ChatGPT;
