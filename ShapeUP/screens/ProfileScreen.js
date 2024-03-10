import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { auth, db, storage } from '../firebase';
import { getDoc, doc, collection, query, where, onSnapshot, updateDoc, getDocs } from 'firebase/firestore';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

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
                const q = query(collection(db, 'workouts'), where('assignedDays', 'array-contains', dayOfWeek));
                const querySnapshot = await getDocs(q);
                const workouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTodaysWorkouts(workouts);
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
        const q = query(collection(db, 'workouts'), where('assignedDays', 'array-contains', dayOfWeek));
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
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginBottom: 20 }}>
                <Image
                    source={user.userProfilePic ? { uri: user.userProfilePic } : require('../assets/profile.png')}
                    style={styles.profilePic}
                />
            </TouchableOpacity>
            <Text style={styles.welcomeText}>Welcome, {user.firstName} {user.lastName}</Text>
            <Text style={styles.date}>{format(new Date(), 'PPP')}</Text>
            
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
                <Text style={styles.noWorkoutText}>No workouts scheduled for today.</Text>
            )}

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
                <FooterButton name="home" icon={require('../assets/homeIcon.png')} onPress={() => navigation.navigate('Home')} />
                <FooterButton name="add" icon={require('../assets/addIcon.png')} onPress={() => navigation.navigate('WorkoutCreation')} />
                <FooterButton name="calendar" icon={require('../assets/calendarIcon.png')} onPress={() => navigation.navigate('Calendar')} />
            </View>
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
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#E8E8E8',
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
    },
    workoutTitle: {
        fontSize: 16,
        color: '#000',
    },
    noWorkoutText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
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