// screens/CreatePlanScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreatePlanScreen = () => (
  <View style={styles.container}>
    <Text>Create a new plan</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePlanScreen;
