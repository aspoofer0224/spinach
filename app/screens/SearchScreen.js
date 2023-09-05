import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, StyleSheet, Image, ScrollView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { FIRESTORE_DB,FIREBASE_AUTH } from '../../firebase_config'; // Import your Firestore instance
import {LinearGradient} from 'expo-linear-gradient';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const currentUserId = FIREBASE_AUTH.currentUser.uid;


  useEffect(() => {
    if (searchQuery !== '') {
      const fetchData = async () => {
        const usersRef = collection(FIRESTORE_DB, 'users');
        const q = query(usersRef, where('username', '>=', searchQuery), where('username', '<=', searchQuery + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        
        let users = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
      
        // Filter out the current user
        users = users.filter(user => user.id !== currentUserId);
      
        setSearchResults(users);
      };
      
      
      fetchData();
    } else {
      // Clear the results if the search query is empty
      setSearchResults([]);
    }
  }, [searchQuery]);
  

  const navigateToProfile = (userId) => {
    // Navigate to the user's profile
    navigation.navigate('UserProfileScreen', { userId });
  };

  

  return (
    <LinearGradient colors={['#9ee2d7','#9ee2d7','#6BCABE', '#192f6a']} style={styles.container}>
      <SafeAreaView>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigateToProfile(item.id)} style={styles.resultRow}>
              <Image source={{uri: item.image}} style={styles.profilePicture}/>
              <View>
                <Text style={styles.username}>{item.username}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    padding: 8,
    backgroundColor: '#9ee2d7',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 20,
    height: 40,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  username: {
    fontSize: 18,
  },
});
