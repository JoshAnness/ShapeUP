import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Timestamp } from 'firebase/firestore';

function CalendarInfo({ navigation }) {
  const handleDayPress = (date) => {
    const selectedDateTimestamp = Timestamp.fromDate(new Date(date.dateString));
    console.log('Selected date timestamp:', selectedDateTimestamp); // Log selected date timestamp for debugging
    navigation.navigate('DateDetails', { selectedDate: selectedDateTimestamp });
  };

  return (
    <View style={{ flex: 1 }}>
      <Calendar onDayPress={(day) => handleDayPress(day)} />
    </View>
  );
}

export default CalendarInfo;