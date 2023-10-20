import React, { useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';


function CalendarInfo({ navigation }) {
  const handleDayPress = (date) => {
    navigation.navigate('DateDetails', { selectedDate: date.dateString });
  };

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        onDayPress={(day) => handleDayPress(day)}
      />
    </View>
  );
}

export default CalendarInfo;