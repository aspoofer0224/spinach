import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView, Text } from 'react-native';
import { doc, getDoc } from 'firebase/firestore'; 
import { FIRESTORE_DB,FIREBASE_AUTH } from '../../firebase_config';
import { collection, query, where, getDocs,updateDoc, arrayUnion, arrayRemove,increment } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import {LinearGradient} from 'expo-linear-gradient';

export default function UserProfileScreen({ route,navigation }) {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const { userId } = route.params;
  const loggedInUserId = FIREBASE_AUTH.currentUser.uid;
  const userRef = doc(FIRESTORE_DB, 'users', userId);
  const loggedInUserRef = doc(FIRESTORE_DB, 'users', loggedInUserId);

  const fetchUserData = async () => {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const fetchedUserData = userDoc.data();
      setUserData(fetchedUserData);
      setIsFollowing(fetchedUserData.Followers.includes(loggedInUserId));
    }
  };
  
  

  useEffect(() => {
    fetchUserData();
  }, [userId]);
  

  useEffect(() => {
    const fetchPosts = async () => {
      const postsRef = collection(FIRESTORE_DB, 'posts');
      const q = query(postsRef, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const fetchedPosts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(), // Convert to JavaScript Date object
        };
      });
      
      setUserPosts(fetchedPosts);
    };
  
    fetchPosts();
  }, [userId]);

  useEffect(() => {
    // Check if the logged-in user is following this profile
    if (userData?.followers?.includes(loggedInUserId)) {
      setIsFollowing(true);
    }
  }, [userData]);

  const handleFollow = async () => {
    
  
    if (isFollowing) {
      // Unfollow
      await updateDoc(userRef, { 
        Followers: arrayRemove(loggedInUserId),
        numFollowers: increment(-1)
      });
      await updateDoc(loggedInUserRef, { 
        Following: arrayRemove(userId),
        numFollowing: increment(-1)
      });
      setIsFollowing(false);
    } else {
      // Follow
      await updateDoc(userRef, { 
        Followers: arrayUnion(loggedInUserId),
        numFollowers: increment(1)
      });
      await updateDoc(loggedInUserRef, { 
        Following: arrayUnion(userId),
        numFollowing: increment(1)
      });
      setIsFollowing(true);
    }
    fetchUserData();
  };
  

  const handleChat = () => {
    const chatId = userId < loggedInUserId ? userId + '-' + loggedInUserId : loggedInUserId + '-' + userId;
    navigation.navigate('ChatScreen',{userId:userId,chatId:chatId});
  };
  
  
  


  // Render posts and other UI elements just like you're doing for the logged-in user
  const renderUserPosts = () => {
    const rows = [];
    for (let i = 0; i < userPosts.length; i += 3) {
      const rowPosts = userPosts.slice(i, i + 3);
      const rowElements = [];
      for (let j = 0; j < 3; j++) {
        const post = rowPosts[j];
        if (post) {
          rowElements.push(
            <TouchableOpacity
                key={post.id}
                style={styles.post}
                onPress={() => navigation.navigate('UserPostScreen', { post: {...post, timestamp: post.timestamp.toString()}, userId })}
            >
                <Image source={{ uri: post.postImage }} style={styles.postImage} />
            </TouchableOpacity>

          );
        } else {
          // Push an empty view to ensure proper alignment
          rowElements.push(<View key={`empty-${i + j}`} style={styles.post} />);
        }
      }
      rows.push(<View key={i} style={styles.row}>{rowElements}</View>);
    }
    return rows;
  };

  return (
    <LinearGradient colors={['#EDF9EB','#9ee2d7','#9ee2d7']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userData?.posts || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userData?.numFollowers || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userData?.numFollowing || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Image source={{ uri: userData?.image }} style={styles.profilePicture} />
            <View>
              <Text style={styles.username}>{userData?.username}</Text>
              <Text style={styles.description}>{userData?.description}</Text>
              {userData?.goalAchieved && (
                <View style={styles.goalAchievedContainer}>
                  <Text style={styles.goalAchievedText}>Achieved</Text>
                  <Icon name="check-circle" size={20} color="green" />
                </View>
              )}
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
              <Text style={styles.buttonText}>{isFollowing ? 'Unfollowed' : 'Follow'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton} onPress={handleChat}>
              <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
          </View>


          <Icon name="th" size={24} style={styles.gridIcon} />
          <View style={styles.posts}>
            {renderUserPosts()}
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    post: {
      width: '32%',
      aspectRatio: 1,
    },
    postImage: {
      width: '100%',
      height: '100%',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    stat: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    statLabel: {
      color: 'gray',
    },
    profileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profilePicture: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
    },
    username: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    description: {
      color: 'gray',
    },
    editProfileButton: {
      backgroundColor: '#3498db',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 15,
    },
    editProfileButtonText: {
      color: 'white',
    },
    gridIcon: {
      alignSelf: 'center',
      marginBottom: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
      },
      followButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
      },
      messageButton: {
        backgroundColor: '#28a745',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
      },
      buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
      },
  });
