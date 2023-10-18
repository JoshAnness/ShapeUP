// screens/HomeScreen.js

import React from 'react';
import { View, Text, Button } from 'react-native';
import WorkoutButton from '../components/WorkoutButton';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome to the Health & Fitness App!</Text>
      <Button title="Go to Profile" onPress={() => navigation.navigate('Profile')} />
      
    </View>
  );
}

export default HomeScreen;
