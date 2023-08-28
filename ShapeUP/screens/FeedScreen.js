import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const FeedScreen = () => {
    const [allPosts, setAllPosts] = useState([]);

    useEffect(() => {
        const postsCollectionRef = collection(db, 'posts');

        const unsubscribe = onSnapshot(postsCollectionRef, (querySnapshot) => {
            const posts = [];
            querySnapshot.forEach((doc) => {
                posts.push(doc.data());
            });
            setAllPosts(posts);
        });

        return () => unsubscribe();  // Cleanup listener on unmount
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.postContainer}>
            <Text>{item.text}</Text>
            {item.media && (
                <Image source={{ uri: item.media }} style={styles.postImage} />
            )}
            {/* Add more rendering logic if you have other fields */}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={allPosts}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    postContainer: {
        padding: 15,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    postImage: {
        width: '100%',
        height: 200,
        marginTop: 10,
    },
});

export default FeedScreen;