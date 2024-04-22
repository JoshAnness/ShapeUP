import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { auth, db, storage } from '../firebase';
import { getDoc, doc, collection, query, where, onSnapshot, updateDoc, getDocs } from 'firebase/firestore';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FooterComponent from '../components/FooterComponent';

const ProfileScreen = ({ navigation }) => {
    const [selectedSegment, setSelectedSegment] = useState(0);
    const [workouts, setWorkouts] = useState([]);
    const [activeFooterButton, setActiveFooterButton] = useState('home');
    const [todaysWorkouts, setTodaysWorkouts] = useState([]);
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        userProfilePic: null,
    });
    const today = format(new Date(), 'yyyy-MM-dd');

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                if (auth.currentUser) {
                    const userRef = doc(db, 'users', auth.currentUser.uid);
                    const docSnapshot = await getDoc(userRef);
        
                    if (docSnapshot.exists()) {
                        const userData = docSnapshot.data();
                        setUser({
                            ...user,
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            userProfilePic: userData.userImg || null,
                        });
                    } else {
                        console.warn("User document doesn't exist");
                    }
                }
            };
        
            fetchUserData();
        }, [])
    ); 

    useFocusEffect(
        useCallback(() => {
            const dayOfWeek = format(new Date(), 'EEEE');
            const fetchTodaysWorkouts = async () => {
                if (auth.currentUser) {
                    const q = query(collection(db, 'workouts'), 
                                    where('assignedDays', 'array-contains', dayOfWeek), 
                                    where('userId', '==', auth.currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const workouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTodaysWorkouts(workouts);
                }
            };

            fetchTodaysWorkouts();
        }, [])
    );

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

    async function fetchTodaysWorkouts() {
        const dayOfWeek = format(new Date(), 'EEEE');
        const q = query(collection(db, 'workouts'), 
                                where('assignedDays', 'array-contains', dayOfWeek), 
                                where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const workouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTodaysWorkouts(workouts);
    }

    const handleDayPress = (day) => {
        const selectedDate = day.dateString;
    
        navigation.navigate('Details', { selectedDate });
    };

    const renderWorkoutItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}>
            <Text style={styles.itemTitle}>{item.name}</Text>
        </TouchableOpacity>
    ); 

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginBottom: 20 }}>
                <Image
                    source={user.userProfilePic ? { uri: user.userProfilePic } : require('../assets/profile.png')}
                    style={styles.profilePic}
                />
            </TouchableOpacity>
            <Text style={styles.welcomeText}>Welcome, {user.firstName} {user.lastName}</Text>
    
            <SegmentedControl
                values={['Workouts', 'Calendar']}
                selectedIndex={selectedSegment}
                onChange={(event) => setSelectedSegment(event.nativeEvent.selectedSegmentIndex)}
                style={styles.segmentedControl}
            />
    
            {selectedSegment === 0 && (
                <>
                    {todaysWorkouts.length > 0 ? (
                        <View style={{ alignItems: 'center', width: '100%' }}>
                            <TouchableOpacity
                                style={styles.workoutItem}
                                onPress={() => navigation.navigate('Details', { selectedDate: today })}
                            >
                                <Text style={styles.workoutTitle}>Today's Workout</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={styles.noWorkoutText}>No workouts scheduled for today</Text>
                    )}
    
                    <FlatList
                        data={workouts}
                        renderItem={renderWorkoutItem}
                        keyExtractor={(item) => item.id}
                        style={styles.contentContainer}
                    />
                </>
            )}
    
            {selectedSegment === 1 && (
                <Calendar
                    onDayPress={handleDayPress}
                    style={[styles.calendarStyle, { width: 300 }]}
                />
            )}
    
            <FooterComponent navigation={navigation} />
        </View>
    );    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 50,
        backgroundColor: '#fff',
    },
    header: {
        width: '100%',
        alignItems: 'center',
    },
    profilePic: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    date: {
        fontSize: 18,
    },
    welcomeText: {
        fontSize: 28, 
        color: '#39383C', 
        marginBottom: 10,
    },
    dateText: {
        fontSize: 18, 
        color: '#6D6D6D', 
        marginBottom: 20, 
    },
    workoutItem: {
        paddingVertical: 15, 
        paddingHorizontal: 20, 
        marginVertical: 10,
        backgroundColor: '#8337FE',
        borderRadius: 15,
        width: '90%',
        alignItems: 'center',
    },
    workoutTitle: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    noWorkoutText: {
        fontSize: 16,
        color: '#666',
        marginTop: 0,
        marginBottom: 5,
    },
    segmentedControl: {
        width: '85%',
        alignSelf: 'center',
        marginVertical: 20,
        height: 40,
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
    contentContainer: {
        width: '100%',
    },
    item: {
        width: '90%', 
        alignSelf: 'center', 
        paddingVertical: 15, 
        paddingHorizontal: 20, 
        marginVertical: 10, 
        backgroundColor: '#A97AF6', 
        borderRadius: 15, 
        borderWidth: 1,
        borderColor: '#E8E8E8', 
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF', 
    },  
    calendarStyle: {
        width: '100%',
        alignSelf: 'center',
    },
});

export default ProfileScreen;