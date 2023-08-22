import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity } from 'react-native';
import ProfileScreen from '../screens/ProfileScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import GoalDetailsScreen from '../screens/GoalDetailsScreen';
import BaselineTestScreen from '../screens/BaselineTestScreen';

const Stack = createStackNavigator();

const HeaderButton = ({ title, onPress }) => (
    <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={onPress}>
        <Text style={{ color: '#007AFF', fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
);

const AppNavigator = () => (
  <Stack.Navigator 
    initialRouteName="Profile"
    screenOptions={{
        headerStyle: {
            backgroundColor: '#f4f4f8',
            elevation: 0,  // remove shadow on Android
            shadowOpacity: 0,  // remove shadow on iOS
        },
        headerTintColor: '#333',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    }}
  >
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={({ navigation }) => ({
        title: 'Profile',
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 10 }}>
            <HeaderButton title="Create Goal" onPress={() => navigation.navigate('CreateGoal')} />
            <HeaderButton title="Baseline Test" onPress={() => navigation.navigate('BaselineTest')} />
          </View>
        ),
      })}
    />
    <Stack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ title: 'Create New Goal' }} />
    <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} options={{ title: 'Goal Details' }} />
    <Stack.Screen name="BaselineTest" component={BaselineTestScreen} options={{ title: 'Baseline Test' }} />
  </Stack.Navigator>
);

export default AppNavigator;
