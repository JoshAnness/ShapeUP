// navigation/AppNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Button } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import GoalDetailsScreen from '../screens/GoalDetailsScreen';
import BaselineTestScreen from '../screens/BaselineTestScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Profile">
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={({ navigation }) => ({
        title: 'Profile',
        headerRight: () => (
          <React.Fragment>
            <Button title="Create Goal" onPress={() => navigation.navigate('CreateGoal')} color="#007AFF" />
            <Button title="Baseline Test" onPress={() => navigation.navigate('BaselineTest')} color="#007AFF" />
          </React.Fragment>
        )
      })}
    />
    <Stack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ title: 'Create New Goal' }} />
    <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} options={{ title: 'Goal Details' }} />
    <Stack.Screen name="BaselineTest" component={BaselineTestScreen} options={{ title: 'Baseline Test' }} />
  </Stack.Navigator>
);

export default AppNavigator;
