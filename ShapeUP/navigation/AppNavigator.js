import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import BaselineTestScreen from '../screens/BaselineTestScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import SettingsScreen from '../screens/SettingsScreen';
import Calendar from '../screens/CalendarInfo';
import CalendarInfo from '../screens/CalendarInfo';
import DateDetails from '../screens/DateDetails';
import ChatScreen from '../screens/WorkoutCreationScreen';
import WorkoutDetails from '../screens/WorkoutDetails';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';

const Stack = createStackNavigator();

const HeaderButton = ({ title, onPress }) => (
    <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={onPress}>
        <Text style={{ color: '#007AFF', fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
);

const AppNavigator = () => (
  <Stack.Navigator 
    initialRouteName="Login"
    screenOptions={{
        headerStyle: {
            backgroundColor: '#f4f4f8',
            elevation: 0,
            shadowOpacity: 0,
        },
        headerTintColor: '#333',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ headerShown: false }}
    />

    <Stack.Screen 
      name="Register" 
      component={RegisterScreen} 
      options={{ headerShown: false }}
    />

    <Stack.Screen 
      name="BaselineTest" 
      component={BaselineTestScreen} 
      options={{ title: 'Baseline Test' }}
    />

    <Stack.Screen 
      name="Home" 
      component={ProfileScreen} 
      options={({ navigation }) => ({
        headerShown: false
      })}
    />

    <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
    />

    <Stack.Screen 
      name="CalendarIn" 
      component={CalendarInfo} 
      options={{ title: 'Calendar' }}
    />

    <Stack.Screen 
      name="Details" 
      component={DateDetails} 
      options={{ title: 'Details' }}
    />

    <Stack.Screen 
      name="WorkoutCreation" 
      component={ChatScreen} 
      options={{ title: 'AI Workout Creation' }}
    />

    <Stack.Screen 
      name="WorkoutDetails" 
      component={WorkoutDetails} 
      options={{ title: 'Workout Details' }}
    />

    <Stack.Screen 
      name="ExerciseLibrary" 
      component={ExerciseLibraryScreen} 
      options={{ title: 'Exercise Library' }}
    />

  </Stack.Navigator>
);

export default AppNavigator;
