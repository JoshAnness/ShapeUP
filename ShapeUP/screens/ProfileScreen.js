import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DATA = [
    {
        id: '1',
        title: 'Lose Weight',
        progress: 50
    },
    {
        id: '2',
        title: 'Build Muscle',
        progress: 30
    },
    // More data...
];

const Item = ({ title, progress, onPress }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
        <Text style={styles.itemTitle}>{title}</Text>
        <View style={styles.progressBarContainer}>
            <View style={{ ...styles.progressBar, width: `${progress}%` }} />
        </View>
    </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userProfilePic, setUserProfilePic] = useState(null);

    useEffect(() => {
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            getDoc(userRef)
                .then(docSnapshot => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        setFirstName(data.firstName);
                        setLastName(data.lastName);
                        if (data.userImg) { // Check if userImg is available in the document
                            setUserProfilePic(data.userImg); // Set the image URL to the userProfilePic state
                        }
                    }                    
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                });
        }
    }, []);

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
    
            // Wait for the upload to complete
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
        
        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setUserProfilePic(uri);  // Set the local URI to the state for UI display.
    
            // Start uploading the selected image to Firebase Storage.
            const downloadURL = await uploadImage(uri);
    
            // Once the image is uploaded, update the user document in Firestore.
            if (downloadURL) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                updateDoc(userRef, {
                    userImg: downloadURL  // Set the Firestore userImg field to the download URL.
                }).then(() => {
                    console.log('User image URL updated in Firestore.');
                }).catch(error => {
                    console.error("Error updating user image URL in Firestore:", error);
                });
            }
        }
    };      

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log('Logged out');
                navigation.replace('Login');
            })
            .catch((error) => {
                console.error('Error logging out:', error);
            });
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={selectProfilePicture}>
                    <Image 
                        source={userProfilePic ? { uri: userProfilePic } : require('../assets/profile.png')} 
                        style={styles.profileImage} 
                    />
                </TouchableOpacity>
                <Text style={styles.header}>{firstName && lastName ? `${firstName} ${lastName}` : "User"}</Text>
            </View>
            
            <FlatList
                data={DATA}
                renderItem={({ item }) => (
                    <Item 
                        title={item.title} 
                        progress={item.progress} 
                        onPress={() => navigation.navigate('GoalDetails', { goalId: item.id })}
                    />
                )}
                keyExtractor={item => item.id}
            />
            
            <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.smallButton} onPress={() => navigation.navigate('BaselineTest')}>
                    <Text>Baseline Test</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.bigButton} onPress={() => navigation.navigate('CreateGoal')}>
                    <Text>Create Goal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.smallButton} onPress={handleLogout}>
                    <Text>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: '5%',
        backgroundColor: '#f4f4f8',
        alignItems: 'center'
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center'
    },
    header: {
        marginBottom: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
    },
    item: {
        width: '95%',
        padding: 15,
        marginVertical: 10,
        borderColor: '#ccc',
        borderWidth: 1.5,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        alignItems: 'center'
    },
    itemTitle: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 10,
        textAlign: 'center'
    },
    progressBarContainer: {
        height: 25,
        width: '90%',
        backgroundColor: '#e0e0e0',
        borderRadius: 10
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 10
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 40,
        marginBottom: '10%'
    },
    headerContainer: {
        flexDirection: 'column',  // <-- Change this from 'row' to 'column'
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '15%',
        marginBottom: 15,
        width: '100%'
    },    
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: '5%',
        left: '5%',
        right: '5%'
    },
    smallButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        margin: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 8
    },
    bigButton: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        margin: 5,
        backgroundColor: '#4CAF50',
        borderRadius: 8
    }
});

export default ProfileScreen;
