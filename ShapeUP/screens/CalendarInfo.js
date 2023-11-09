import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

function CalendarInfo({ navigation }) {
  const handleDayPress = (date) => {
    // Ensure the selected date is correctly extracted and displayed
    const selectedDate = date.dateString;
    navigation.navigate('Details', { selectedDate });
  };

  return (
    <View style={{ flex: 1 }}>
      <Calendar onDayPress={(day) => handleDayPress(day)} />
    </View>
  );
}

export default CalendarInfo;