import React from 'react';
import { View, Text } from 'react-native';
import WorkoutTracker from '../screens/WorkoutTracker';

function DateDetails({ route }) {
  const { selectedDate } = route.params;
  const { title } = route.params;
  const { workoutType } = route.params;
  const { workoutName } = route.params;
  const { weight } = route.params;
  const { reps } = route.params;
  const { notes } = route.params;
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{selectedDate}</Text> 

    </View>
  );
}

export default DateDetails;