import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import GoalDetailsScreen from '../screens/GoalDetailsScreen';
import BaselineTestScreen from '../screens/BaselineTestScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import SettingsScreen from '../screens/SettingsScreen';
import FeedScreen from '../screens/FeedScreen';
import WorkoutLibrary from '../screens/WorkoutLibrary';
import WorkoutTracker from '../screens/WorkoutTracker';
import Calendar from '../screens/CalendarInfo';
import CalendarInfo from '../screens/CalendarInfo';
import DateDetails from '../screens/DateDetails';
import ChatGPT from '../screens/ChatGPT';

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
      name="Profile" 
      component={ProfileScreen} 
      options={({ navigation }) => ({
        headerShown: false
      })}
    />

    <Stack.Screen 
      name="CreateGoal" 
      component={CreateGoalScreen} 
      options={{ title: 'Create New Goal' }}
    />

    <Stack.Screen 
      name="GoalDetails" 
      component={GoalDetailsScreen} 
      options={{ title: 'Goal Details' }}
    />

    <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
    />

    <Stack.Screen 
      name="Feed" 
      component={FeedScreen} 
      options={{ title: 'Feed' }}
    />

    <Stack.Screen 
      name="Library" 
      component={WorkoutLibrary} 
      options={{ title: 'Library for Workouts' }}
    /> 

    <Stack.Screen 
      name="Tracker" 
      component={WorkoutTracker} 
      options={{ title: 'Workout Tracker' }}
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
      name="Chat" 
      component={ChatGPT} 
      options={{ title: 'Chat With an Expert' }}
    />

  </Stack.Navigator>
);

export default AppNavigator;
