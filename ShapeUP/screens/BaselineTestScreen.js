import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const BaselineTestScreen = ({ navigation }) => {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [sex, setSex] = useState("");

  const handleBaselineSubmit = () => {
    // Validate the inputs
    if (age < 18 || age > 100) {
      Alert.alert("Invalid Age", "Please enter an age between 18 and 100.");
      return;
    }

    if (height < 21 || height > 110) {
      Alert.alert("Invalid Height", "Please enter a height between 21 and 110 inches.");
      return;
    }

    if (!sex || (sex !== "male" && sex !== "female")) {
      Alert.alert("Invalid Sex", "Please select either Male or Female for sex.");
      return;
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Baseline Test</Text>

      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={(text) => {
          if (!isNaN(text)) {
            setAge(text);
          }
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Weight (in lbs)"
        keyboardType="numeric"
        value={weight}
        onChangeText={(text) => {
          if (!isNaN(text)) {
            setWeight(text);
          }
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Height (in inches)"
        keyboardType="numeric"
        value={height}
        onChangeText={(text) => {
          if (!isNaN(text)) {
            setHeight(text);
          }
        }}
      />

      <View style={{ width: '95%', height: 50, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 20 }}>
        <Picker
          selectedValue={sex}
          onValueChange={(itemValue) => setSex(itemValue)}
          style={{ width: '100%', height: '100%' }}
        >
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
        </Picker>
      </View>

      <Button title="Submit" onPress={handleBaselineSubmit} style={styles.submitButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: '5%',
    backgroundColor: '#f4f4f8',
    alignItems: 'center'
  },
  header: {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  },
  input: {
    width: '95%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 8
  },
  submitButton: {
    marginTop: 10,
  },
});

export default BaselineTestScreen;
