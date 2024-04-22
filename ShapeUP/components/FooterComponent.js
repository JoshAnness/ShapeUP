// FooterComponent.js
import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet } from 'react-native';

const FooterComponent = ({ navigation }) => {
    const navigateToAddWorkout = () => {
        navigation.navigate('WorkoutCreation');
    };

    return (
        <View style={styles.footerContainer}>
            <TouchableOpacity onPress={navigateToAddWorkout} style={styles.footerButton}>
                <Image source={require('../assets/addIcon.png')} style={styles.footerIcon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute', 
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff', 
        borderTopWidth: 1,
        borderTopColor: '#e1e1e1',
        paddingVertical: 10,
    },
    footerIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    footerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 15,
    },
});

export default FooterComponent;