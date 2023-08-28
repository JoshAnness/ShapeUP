import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, TextInput, Modal } from 'react-native';
import { auth } from '../firebase';
import { getDoc, doc, updateDoc, addDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../firebase';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ProfileScreen = ({ navigation }) => {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userProfilePic, setUserProfilePic] = useState(null);
    const [selectedButton, setSelectedButton] = useState('Posts');
    const [postText, setPostText] = useState("");
    const [postMedia, setPostMedia] = useState(null);
    const [postMediaType, setPostMediaType] = useState(null);
    const [isPostModalVisible, setIsPostModalVisible] = useState(false);
    const [userPosts, setUserPosts] = useState([]);

    useEffect(() => {
        const fetchUserDataAndPosts = async () => {
            if (auth.currentUser) {
                // Fetch user data
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const docSnapshot = await getDoc(userRef);
    
                if (docSnapshot.exists()) {
                    setFirstName(docSnapshot.data().firstName || "");
                    setLastName(docSnapshot.data().lastName || "");
                    setUserProfilePic(docSnapshot.data().userImg || null);
                } else {
                    console.warn("User document doesn't exist");
                }
    
                // Fetch user posts
                const postsCollectionRef = collection(db, 'posts');
                const q = query(postsCollectionRef, where("userId", "==", auth.currentUser.uid));
    
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const userPosts = [];
                    querySnapshot.forEach((doc) => {
                        userPosts.push(doc.data());
                    });
                    setUserPosts(userPosts);
                });
    
                // Return the cleanup function to unsubscribe from the listener
                return () => unsubscribe();
            }
        };
    
        fetchUserDataAndPosts();
        
    }, [auth.currentUser]);    

    const Item = ({ title, media, mediaType, onPress }) => (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <Text style={styles.itemTitle}>{title}</Text>
            {mediaType === 'image' && <Image source={{ uri: media }} style={{ width: '100%', height: 200 }} />}
            {mediaType === 'video'}
        </TouchableOpacity>
    );    

    const fetchUserPosts = async () => {
        if (auth.currentUser) {
            const postsCollectionRef = collection(db, 'posts');
            const query = query(postsCollectionRef, where("userId", "==", auth.currentUser.uid), orderBy("timestamp", "desc"));
            
            const querySnapshot = await getDocs(query);
            const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            setUserPosts(posts);
        }
    };

    const selectPostMedia = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        if (!result.canceled) {
            const uri = result.assets[0].uri;
            const mediaType = result.assets[0].mediaType;
    
            setPostMedia(uri);  
            setPostMediaType(mediaType);
    
            const downloadURL = await uploadImage(uri);
            setPostMedia(downloadURL);
        }
    }; 
    
    const createPost = async () => {
        if (postText || postMedia) {
            const postsCollectionRef = collection(db, 'posts');
            const mediaType = postMedia ? 'image' : 'video';
            await addDoc(postsCollectionRef, {
                text: postText,
                media: postMedia,
                mediaType: mediaType,
                userId: auth.currentUser.uid,
                timestamp: new Date().toISOString()
            });
            console.log('Post created.');
            setPostText("");
            setPostMedia(null);
            setPostMediaType(null);
            setIsPostModalVisible(false);
        } else {
            Alert.alert('Error', 'Please enter text or add an image/video.');
        }
    };    

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

    const handleToggle = (button) => {
        setSelectedButton(button);
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
                <Text style={styles.header}>{firstName && lastName ? `${firstName} ${lastName}` : "User"}</Text>
            </View>

            <View style={styles.mainContainer}>
                <TouchableOpacity 
                    style={[
                        styles.mainButton,
                        selectedButton === 'Posts' ? styles.selectedButton : styles.deselectedButton
                    ]}
                    onPress={() => handleToggle('Posts')}
                >
                    <Text style={styles.mainButtonText}>Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[
                        styles.mainButton,
                        selectedButton === 'Plans' ? styles.selectedButton : styles.deselectedButton
                    ]}
                    onPress={() => handleToggle('Plans')}
                >
                    <Text style={styles.mainButtonText}>Plans</Text>
                </TouchableOpacity>
            </View>
            
            <Modal
                animationType="slide"
                transparent={true}
                visible={isPostModalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setIsPostModalVisible(!isPostModalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <KeyboardAwareScrollView>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Create a Post</Text>
                            <TextInput
                                style={{ borderColor: 'gray', borderWidth: 1, padding: 10, borderRadius: 5 }}
                                multiline
                                numberOfLines={3}
                                placeholder="What's on your mind?"
                                value={postText}
                                onChangeText={setPostText}
                            />
                            <TouchableOpacity onPress={selectPostMedia} style={{ marginTop: 10 }}>
                                <Text>Add Image/Video</Text>
                            </TouchableOpacity>
                            {postMedia && (
                                postMediaType === 'image' ?
                                <Image source={{ uri: postMedia }} style={{ width: 100, height: 100, marginTop: 10 }} />
                                : 
                                <Text>Video selected. Preview component goes here.</Text>
                            )}
                            <TouchableOpacity style={styles.footerButton} onPress={createPost}>
                                <Text>Create Post</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.footerButton, { backgroundColor: "red" }]}
                                onPress={() => setIsPostModalVisible(false)}
                            >
                                <Text style={{ color: 'white' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </Modal>

            <View style={styles.postsContainer}>
                {selectedButton === 'Posts' && (
                    <FlatList
                        data={userPosts}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Item 
                                title={item.text} 
                                media={item.media}
                                mediaType={item.mediaType}
                                onPress={() => console.log('Post clicked')} 
                            />
                        )}
                    />           
                )}
            </View>
            
            <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.footerButton} onPress={() => setIsPostModalVisible(true)}>
                    <Text>Create Post</Text>
                </TouchableOpacity>
 
                <TouchableOpacity style={styles.footerButton} onPress={() => {}}>
                    <Text>Feed</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.footerButton} onPress={() => {}}>
                    <Text>Create Plan</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
                <Image 
                    source={require('../assets/settingsIcon.png')}
                    style={styles.settingsIcon} 
                />
            </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: '5%',
        left: '5%',
        right: '5%'
    },
    footerButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        margin: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 8
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
    postsContainer: {
        flex: 1,
        width: '100%',
        marginBottom: '20%',
        marginVertical: 10, 
        borderColor: '#ccc',
        borderWidth: 1.5,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        overflow: 'hidden' 
    },
});

export default ProfileScreen;