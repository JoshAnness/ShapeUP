import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { auth, db, storage } from '../firebase';
import { getDoc, doc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({ navigation }) => {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [username, setUsername] = useState("");
    const [selectedSegment, setSelectedSegment] = useState(0);
    const [workouts, setWorkouts] = useState([]);
    const [activeFooterButton, setActiveFooterButton] = useState('home');

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const docSnapshot = await getDoc(userRef);
    
                if (docSnapshot.exists()) {
                    setFirstName(docSnapshot.data().firstName || "");
                    setLastName(docSnapshot.data().lastName || "");
                    setUserProfilePic(docSnapshot.data().userImg || null);
                    setUsername(docSnapshot.data().username || ""); 
                } else {
                    console.warn("User document doesn't exist");
                }
    
                return () => unsubscribe();
            }
        };
    
        fetchUserData();
        
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
        
        if (!result.canceled) {
            const uri = result.uri;
            setUserProfilePic(uri); 
    
            const downloadURL = await uploadImage(uri);
    
            if (downloadURL) {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userRef, { 
                    userImg: downloadURL  
                });
                console.log('User image URL updated in Firestore.');
            }
        }
    };     

    const handleToggle = (button) => {
        setSelectedButton(button);
    };

    useEffect(() => {
        // Fetch workouts from Firestore
        const workoutRef = collection(db, 'workouts');
        const q = query(workoutRef, where('userId', '==', auth.currentUser.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedWorkouts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setWorkouts(fetchedWorkouts);
        });

        return () => unsubscribe();
    }, []);

    const handleDayPress = (day) => {
        const selectedDate = day.dateString; // Assumes date is in YYYY-MM-DD format
    
        navigation.navigate('Details', { selectedDate });
    };

    const renderWorkoutItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}>
            <Text style={styles.itemTitle}>{item.name}</Text>
        </TouchableOpacity>
    );

    const FooterButton = ({ name, icon, onPress }) => (
        <TouchableOpacity onPress={() => {
            onPress();
            setActiveFooterButton(name);
          }} 
          style={[styles.footerButton, activeFooterButton === name ? styles.activeFooterButton : {}]}
        >
          <Image source={icon} style={styles.footerIcon} />
        </TouchableOpacity>
    );

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
                {username && <Text style={styles.username}>@{username}</Text>}
            </View>

            <SegmentedControl
                values={['Workouts', 'Calendar']}
                selectedIndex={selectedSegment}
                onChange={(event) => setSelectedSegment(event.nativeEvent.selectedSegmentIndex)}
                style={styles.segmentedControl}
            />

            {selectedSegment === 0 && (
                <FlatList
                    data={workouts}
                    renderItem={renderWorkoutItem}
                    keyExtractor={(item) => item.id}
                    style={styles.contentContainer}
                />
            )}

            {selectedSegment === 1 && (
                <Calendar onDayPress={handleDayPress} />
            )}

            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
                <Image 
                    source={require('../assets/settingsIcon.png')}
                    style={styles.settingsIcon} 
                />
            </TouchableOpacity>

            <View style={styles.footerContainer}>
                <FooterButton name="home" icon={require('../assets/homeIcon.png')} onPress={() => navigation.navigate('Profile')} />
                <FooterButton name="add" icon={require('../assets/addIcon.png')} onPress={() => navigation.navigate('WorkoutCreation')} />
                <FooterButton name="calendar" icon={require('../assets/calendarIcon.png')} onPress={() => navigation.navigate('Calendar')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: '5%',
        paddingLeft: '5%',
        paddingRight: '5%',
        paddingBottom: 0, 
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    contentContainer: {
        width: '100%',
        alignItems: 'center'
    },
    header: {
        marginBottom: 5,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
    },
    item: {
        width: '100%',
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
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 40,
        marginBottom: '10%'
    },
    headerContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '15%',
        marginBottom: 15,
        width: '100%'
    },    
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white', 
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#e1e1e1',
        paddingVertical: 10,
    },
    footerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 15,
    },
    footerIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    settingsButton: {
        position: 'absolute', 
        top: 50,
        right: 25,
        zIndex: 1  
    },
    settingsIcon: {
        width: 35,
        height: 35,
        resizeMode: 'contain'
    },
    mainContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainButton: {
        flex: 1,
        height: 45,
        margin: 10,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4
    },
    mainButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    },
    selectedButton: {
        backgroundColor: '#4CAF50',
    },
    deselectedButton: {
        backgroundColor: '#A5D6A7', 
    },
    centeredView: {
        flex: 1,
        marginTop: '100%',
        marginHorizontal: '5%',
    },
    modalView: {
        height: '100%',
        width: '100%',
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 5
    },
    modalText: {
        marginBottom: '5%',
        textAlign: "center",
        fontWeight: 'bold',
        fontSize: 20
    },
    username: {
        color: '#888',
        fontSize: 16
    },    
    segmentedControl: {
        width: '90%',
        marginVertical: 20,
    },
    contentContainer: {
        width: '100%',
    },
    button: {
        padding: 15,
        margin: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        alignItems: 'center'
    },
    aiWorkoutCreationButton: {
        padding: 15,
        margin: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        alignItems: 'center',
        width: '90%'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
});

export default ProfileScreen;