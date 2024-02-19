import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';

function CalendarInfo({ navigation }) {
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    const fetchWorkoutDays = async () => {
      const q = query(collection(db, 'workouts'), where('assignedDays', '!=', []));
      const querySnapshot = await getDocs(q);
      const fetchedMarkedDates = {};
      querySnapshot.forEach((doc) => {
        const { assignedDays, name } = doc.data();
        assignedDays.forEach((day) => {
          if (!fetchedMarkedDates[day]) {
            fetchedMarkedDates[day] = { marked: true, dotColor: 'blue', activeOpacity: 0, customData: [name] };
          } else {
            fetchedMarkedDates[day].customData.push(name);
          }
        });
      });
      setMarkedDates(fetchedMarkedDates);
    };

    fetchWorkoutDays();
  }, []);

  const handleDayPress = (day) => {
    const selectedDate = day.dateString; // YYYY-MM-DD
    const dayOfWeek = format(parseISO(selectedDate), 'EEEE'); // Gets day name like "Monday"
    navigation.navigate('Details', { selectedDate, dayOfWeek });
  };

  return (
    <View style={{ flex: 1 }}>
      <Calendar onDayPress={handleDayPress} markedDates={markedDates} />
    </View>
  );
}

export default CalendarInfo;
