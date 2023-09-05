import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase_config';
import { doc, getDoc } from 'firebase/firestore';

export default function FollowScreen({ route, navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]); // Users' IDs
    const { type } = route.params;
    const userId = FIREBASE_AUTH.currentUser.uid;
    const [completeUserData, setCompleteUserData] = useState([]); // Complete data
  
    // Fetch user IDs of Following and Followers
    useEffect(() => {
        const fetchData = async () => {
            const userRef = doc(FIRESTORE_DB, 'users', userId);
            const docSnapshot = await getDoc(userRef);
            if (docSnapshot.exists) {
            const userData = docSnapshot.data();
            const allUsers = type === 'Followers' ? userData.Followers : userData.Following;
            setUsers(allUsers);
            }
        };
        fetchData();
    }, [type]);
  
    // Fetch complete user data based on IDs
    useEffect(() => {
      const fetchData = async () => {
        const fetchedUsers = [];
        for (const id of users) {
          const userRef = doc(FIRESTORE_DB, 'users', id);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            fetchedUsers.push({ id: userDoc.id, ...userDoc.data() });
          }
        }
        setCompleteUserData(fetchedUsers);
      };
      fetchData();
    }, [users]);
  
    // Function to navigate to user profile
    const navigateToProfile = (userId) => {
      navigation.navigate('UserProfileScreen', { userId });
    };
  
    // Filtering based on complete user data
    const filteredUsers = completeUserData.filter((user) => {
      return user.username ? user.username.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    });
  
    return (
        <SafeAreaView style={styles.container}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="gray"
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
            />
          </View>
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigateToProfile(item.id)} style={styles.userRow}>
                <Image source={{ uri: item.image }} style={styles.profilePicture} />
                <Text style={styles.username}>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      );
    }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchBar: {
        padding: 8,
        backgroundColor: '#f1f1f1',
    },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingLeft: 20,
        paddingRight: 20,
        height: 40,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    username: {
        fontSize: 18,
    },
});
