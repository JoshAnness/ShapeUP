import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const FeedScreen = () => {
    const [allPosts, setAllPosts] = useState([]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    useEffect(() => {
        const fetchUsernames = async (posts) => {
            const uniqueUserIds = new Set(posts.map(post => post.userId));

            const usernamePromises = Array.from(uniqueUserIds).map(async userId => {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    return { userId, username: userDoc.data().username };
                }
                return { userId, username: 'Anonymous' }; // Handle users not found
            });

            const usernames = await Promise.all(usernamePromises);

            const postsWithUsername = posts.map(post => ({
                ...post,
                username: (usernames.find(user => user.userId === post.userId) || {}).username
            }));

            setAllPosts(postsWithUsername);
        };

        const unsubscribe = onSnapshot(collection(db, 'posts'), async (querySnapshot) => {
            const posts = [];
            querySnapshot.forEach(doc => {
                posts.push(doc.data());
            });
            
            fetchUsernames(posts);
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.postContainer}>
            <Text style={styles.username}>@{item.username}</Text>
            <Text>{item.text}</Text>
            {item.media && <Image source={{ uri: item.media }} style={styles.postImage} />}
            <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text> 
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
    username: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    timestamp: {
        fontSize: 12,
        color: 'gray',
        marginTop: 5,
    },
});

export default FeedScreen;