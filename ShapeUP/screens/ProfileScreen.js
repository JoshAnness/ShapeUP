import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { auth, db, storage } from '../firebase';
import { getDoc, doc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

const ProfileScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [username, setUsername] = useState("");
    const [selectedSegment, setSelectedSegment] = useState(0);
    const [workouts, setWorkouts] = useState([]);
    const [activeFooterButton, setActiveFooterButton] = useState('home');
    const [workoutsForToday, setWorkoutsForToday] = useState([]);
    const [today, setToday] = useState(format(new Date(), 'yyyy-MM-dd'));

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

    const handleToggle = (button) => {
        setSelectedButton(button);
    };

    useEffect(() => {
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
                <View style={styles.headerTopRow}>
                    <Text style={styles.headerTitle}>Home</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.profileIconContainer}>
                        <Image 
                            source={userProfilePic ? { uri: userProfilePic } : require('../assets/settingsIcon.png')} 
                            style={styles.profileIcon} 
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.welcomeText}>Welcome, {firstName || 'User'} {lastName || 'User'}</Text>
                <Text style={styles.dateText}>{format(new Date(), 'd MMMM, yyyy')}</Text>
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
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    headerTopRow: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        position: 'absolute',
        textAlign: 'center',
        width: '100%',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    profileIconContainer: {
    },
    profileIcon: {
        width: 40, 
        height: 40,
        borderRadius: 20, 
    },
    welcomeText: {
        fontSize: 28, 
        fontWeight: 'bold',
        color: '#000', 
        marginTop: 10, 
    },
    dateText: {
        fontSize: 18, 
        color: '#6D6D6D', 
        marginBottom: 20, 
    },
    segmentedControl: {
        width: '90%',
        alignSelf: 'center',
        marginVertical: 20,
    },
    contentContainer: {
        width: '100%',
    },
    item: {
        width: '90%', 
        alignSelf: 'center', 
        paddingVertical: 20, 
        paddingHorizontal: 20, 
        marginVertical: 10, 
        backgroundColor: '#F8F8F8', 
        borderRadius: 10, 
        borderWidth: 1,
        borderColor: '#E8E8E8', 
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000', 
    },  
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
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
});

export default ProfileScreen;