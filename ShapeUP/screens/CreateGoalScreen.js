import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';

const CreateGoalScreen = ({ navigation }) => {
  const [goal, setGoal] = useState("");

  const handleCreateGoal = () => {
    // Here, you'll integrate with your LLM to produce actionable steps.
    // For now, we'll just navigate back.
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>What's your goal?</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Lose 5 kgs in 2 months"
        value={goal}
        onChangeText={setGoal}
      />
      <Button title="Create Goal" onPress={handleCreateGoal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
  },
});

export default CreateGoalScreen;
