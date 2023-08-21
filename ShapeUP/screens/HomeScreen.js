// screens/HomeScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/Button';

const HomeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text>Home Screen</Text>
    <Button title="Create New Plan" onPress={() => navigation.navigate('CreatePlan')} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
