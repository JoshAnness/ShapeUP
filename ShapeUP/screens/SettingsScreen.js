import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { auth, db, storage } from '../firebase';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
    const [userProfilePic, setUserProfilePic] = useState(null);

    const handleLogout = () => {
        console.log('Attempting to log out...');
        signOut(auth)
            .then(() => {
                console.log('Logged out successfully');
                navigation.replace('Login');
            })
            .catch((error) => {
                console.error('Error logging out:', error);
            });
    };    

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const docSnapshot = await getDoc(userRef);
    
                if (docSnapshot.exists()) {
                    setUserProfilePic(docSnapshot.data().userImg);
                } else {
                    console.warn("User document doesn't exist");
                }
            }
        };
    
        fetchUserData();
        
    }, [auth.currentUser]);  

    useEffect(() => {
        const loadUserProfilePic = async () => {
            try {
                const cachedUrl = await AsyncStorage.getItem('userProfilePic');
                if (cachedUrl) {
                    setUserProfilePic(cachedUrl);
                } else {
                    if (auth.currentUser) {
                        const userRef = doc(db, 'users', auth.currentUser.uid);
                        const docSnapshot = await getDoc(userRef);
    
                        if (docSnapshot.exists()) {
                            const fetchedUrl = docSnapshot.data().userImg;
                            setUserProfilePic(fetchedUrl);
                            await AsyncStorage.setItem('userProfilePic', fetchedUrl);
                        } else {
                            console.log("User document doesn't exist");
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user profile picture:', error);
            }
        };
    
        loadUserProfilePic();
    }, [auth.currentUser]);  

    const uploadImage = async (uri) => {
        try {
            console.log('Converting URI to blob');
            
            const response = await fetch(uri);
            const blob = await response.blob();
            
            let filename = uri.substring(uri.lastIndexOf('/') + 1);
            const extension = filename.split('.').pop();
            const name = filename.split('.').slice(0, -1).join('.');
            filename = name + Date.now() + '.' + extension;
        
            const storageRef = ref(storage, `users/${auth.currentUser.uid}/${filename}`);
            console.log('Starting upload to Firebase');
        
            const uploadTask = await uploadBytes(storageRef, blob);
    
            await uploadTask;
        
            console.log('Upload to Firebase complete');
            
            const downloadURL = await getDownloadURL(storageRef);
            console.log('Download URL:', downloadURL);
        
            return downloadURL;
        } catch (error) {
            console.error("Error in uploadImage:", error);
        }
    };    

    const selectProfilePicture = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        
        if (!result.canceled && result.assets) {
            const asset = result.assets[0];
            setUserProfilePic(asset.uri); 
    
            const downloadURL = await uploadImage(asset.uri);
    
            if (downloadURL) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userRef, { 
                    userImg: downloadURL  
                });
                console.log('User image URL updated in Firestore.');
            }
        }
    };  

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={selectProfilePicture}>
                    <Image
                        source={userProfilePic ? { uri: userProfilePic } : require('../assets/profile.png')}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BaselineTest')}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>Baseline Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 10,
        backgroundColor: '#fff',
    },
    button: {
        width: 300,
        alignSelf: 'center', 
        paddingVertical: 20, 
        paddingHorizontal: 20, 
        marginVertical: 10,
        backgroundColor: '#8337FE',
        borderRadius: 15,
        alignItems: 'center', 
    },
    headerContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '5%',
        marginBottom: 5,
        width: '100%'
    },   
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 50,
        marginBottom: 20,
    },
});

export default SettingsScreen;
