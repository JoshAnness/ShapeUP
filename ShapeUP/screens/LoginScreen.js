import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';

const LoginScreen = () => {
   const [isLogin, setIsLogin] = useState(true);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [firstName, setFirstName] = useState('');
   const [lastName, setLastName] = useState('');
   const [username, setUsername] = useState('');

   const navigation = useNavigation();

   useEffect(() => {
       const unsubscribe = onAuthStateChanged(auth, user => {
           if (user) {
               navigation.replace('Profile');
           }
       });
       return unsubscribe;
   }, []);

   const handleLogin = () => {
       signInWithEmailAndPassword(auth, email, password)
           .then(userCredentials => {
               const user = userCredentials.user;
               console.log('Logged in with:', user.email);
           })
           .catch(error => alert(error.message));
   };

   const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredentials => {
            const user = userCredentials.user;
            console.log('Registered with:', user.email);

            setDoc(doc(db, 'users', user.uid), {
                firstName: firstName,
                lastName: lastName,
                email: email,
                username: username,
                userImg: null
            });

            navigation.replace('BaselineTest');
        })
        .catch(error => alert(error.message));
    };

   const isUsernameTaken = async (username) => {
       const usernameRef = doc(db, 'users', username);
       const docSnap = await getDoc(usernameRef);
       return docSnap.exists();
   };

   const activeStyle = isLogin ? styles.loginButton : styles.signupButton;

   return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isLogin ? styles.activeToggle : {}]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin ? styles.activeToggleText : {}]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isLogin ? styles.activeToggle : {}]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin ? styles.activeToggleText : {}]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formContainer}>
          {isLogin ? (
            // Login form
            <>
              <TextInput 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                style={styles.input} 
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword} 
                style={styles.input} 
                secureTextEntry
              />
              <TouchableOpacity onPress={handleLogin} style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Sign Up form
            <>
              <TextInput 
                placeholder="First Name" 
                value={firstName} 
                onChangeText={setFirstName} 
                style={styles.input} 
              />
              <TextInput 
                placeholder="Last Name" 
                value={lastName} 
                onChangeText={setLastName} 
                style={styles.input} 
              />
              <TextInput 
                placeholder="Username" 
                value={username} 
                onChangeText={setUsername} 
                style={styles.input} 
              />
              <TextInput 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                style={styles.input} 
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput 
                placeholder="Password" 
                value={password} 
                onChangeText={setPassword} 
                style={styles.input} 
                secureTextEntry
              />
              <TouchableOpacity onPress={handleSignUp} style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FAFAFA',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    contentContainer: {
      paddingTop: 100,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
      alignSelf: 'center',
      color: '#333',
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      paddingVertical: 15,
      borderRadius: 25,
      marginTop: 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    button: {
      backgroundColor: '#8337FE',
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 18,
    },
    toggleButtonText: {
      color: '#007AFF',
      fontWeight: '600',
      fontSize: 16,
    },
    toggleButtonHighlight: {
      color: '#34C759',
      fontWeight: '600',
      fontSize: 16,
      marginHorizontal: 4,
    },
    highlightContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 30,
    },
    highlight: {
      color: '#007AFF',
      fontWeight: '600',
      fontSize: 18,
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 50
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    activeToggle: {
        borderBottomWidth: 3,
        borderBottomColor: '#B689FF',
    },
    toggleText: {
        color: '#76747B',
        fontWeight: '600',
        fontSize: 16,
    },
    activeToggleText: {
        color: '#76747B',
        fontWeight: '600',
        fontSize: 16,
    },
    formContainer: {
        padding: 20,
    },
});

export default LoginScreen;