import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/core';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            navigation.replace('Profile');
        }
    })

    return unsubscribe;
  }, [])

  const handleSignUp = () => {
        navigation.navigate('Register');
  }

  const handleLogin = () => {
    // Array of disallowed characters
    const disallowedChars = ['{', '}', '[', ']', '/', '\\', '=', '<', '>', '@'];
    //Special array for email
    const disallowedEmailChars = ['{', '}', '[', ']', '/', '\\', '=', '<', '>'];
    //find our items to check against array; email and password
    // Checking email
    if (disallowedEmailChars.some(char => email.includes(char))) {
        alert("Email cannot contain special characters: {} [] / \\ = <> @");
    return; // Prevent further execution
        }
    if (disallowedChars.some(char => password.includes(char))) {
        alert("Password cannot contain special characters: {} [] / \\ = <> @");
    return; // Prevent further execution
            }


        signInWithEmailAndPassword(auth, email, password)
        .then(userCredentials => {
            const user = userCredentials.user;
            console.log('Logged in with:', user.email);
        })
        .catch(error => alert(error.message));
  }

  return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
    >
      <View style={styles.inputContainer}>
        <TextInput
            placeholder="Email"
            value={email}
            onChangeText={text => setEmail(text)}
            style={styles.input}
        />
        <TextInput
            placeholder="Password"
            value={password}
            onChangeText={text => setPassword(text)}
            style={styles.input}
            secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
            onPress={handleLogin}
            style={styles.button}
        >
            <Text style={styles.buttonText}>Login</Text> 
        </TouchableOpacity>

        <TouchableOpacity
            onPress={handleSignUp}
            style={[styles.button, styles.buttonOutline]}
        >
            <Text style={styles.buttonOutlineText}>Register</Text> 
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: '80%'
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5
    },
    secureTextEntry: {

    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40
    },
    button: {
        backgroundColor: '#0782F9',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16
    },
    buttonOutline: {
        backgroundColor: 'white',
        marginTop: 5,
        borderColor: '#0782F9',
        borderWidth: 2
    },
    buttonOutlineText: {
        color: '#0782F9',
        fontWeight: '700',
        fontSize: 16
    }
})

export default LoginScreen;