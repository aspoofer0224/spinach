import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, TouchableOpacity, Image, StyleSheet,RefreshControl,Dimensions} from 'react-native';
import { onSnapshot, collection,doc ,getDoc} from 'firebase/firestore';
import { FIRESTORE_DB,FIREBASE_AUTH } from '../../firebase_config';
import Icon from 'react-native-vector-icons/FontAwesome';
import PostCard from '../../components/PostCard';
import { COLORS, FONT, SIZES } from '../../constants/theme';
import {LinearGradient} from 'expo-linear-gradient';
import {useDispatch} from 'react-redux';
import { setUserPosts } from '../../redux/action';

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]); 
  const dispatch = useDispatch();
  const userId = FIREBASE_AUTH.currentUser.uid;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Fetch the list of following for the current user
    const userRef = doc(FIRESTORE_DB, 'users', userId);
    getDoc(userRef).then((doc) => {
      if (doc.exists) {
        setFollowing(doc.data().Following || []); // If "Following" doesn't exist, default to an empty array
      }
    }).finally(() => {
      setRefreshing(false); // Set refreshing to false, whether or not the fetch succeeded
    });
  }, []);

  useEffect(() => {
    onRefresh();
  }, []);
  
  useEffect(() => {
    // Attach listener for changes in the following list
    const userRef = doc(FIRESTORE_DB, 'users', userId);
    const unsubscribeFollowing = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setFollowing(userData.Following || []); // Update the following list
      }
    });
  
    // Attach listener for posts
    const postsRef = collection(FIRESTORE_DB, 'posts');
    const unsubscribePosts = onSnapshot(postsRef, (snapshot) => {
      // Existing code for fetching and filtering posts
    });
  
    // Cleanup
    return () => {
      unsubscribeFollowing(); // Detach the listener for the following list
      unsubscribePosts(); // Detach the listener for posts
    };
  }, [userId]); // Dependency array
  

  

  useEffect(() => {
    // Fetch posts only after 'following' has been populated
    if (following.length > 0 || userId) {
      const postsRef = collection(FIRESTORE_DB, 'posts');
      const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate(),
        };
      });
      
      // Filter posts by the following list and include the current user's posts
      const filteredPosts = fetchedPosts.filter((post) => following.includes(post.uid) || post.uid === userId);
  
      setPosts(filteredPosts);
      const userPosts = filteredPosts.filter((post) => post.uid === userId);
      dispatch(setUserPosts(userPosts));
    });
  
    return () => unsubscribe();
    }
  }, [following,userId]);

  
  
  const {width, height} = Dimensions.get("window")

  return (
    <LinearGradient colors={['#9ee2d7','#9ee2d7','#6BCABE', '#192f6a']} style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Image source={require('../../assets/images/spinach_shrink.png')} style={styles.logo} resizeMode='contain' />
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {posts.map((post) => (
            <PostCard 
              key={post.id}
              post={post}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Styles go here
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft:20,
      marginTop:-35,
      marginBottom:-35,
    },
    logo: {
      width: 90, // Adjust the dimensions based on your logo
      height: 100, // Adjust the dimensions based on your logo
      alignSelf: 'center' // Center the logo
    },
    postCard: {
      backgroundColor: COLORS.lightWhite,
      borderRadius: 10,
      margin: 15,
      padding: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profilePicture: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    postInfo: {
      marginLeft: 10,
    },
    username: {
      fontSize: SIZES.medium,
      fontFamily: FONT.bold,
      color: COLORS.black,
    },
    location: {
      fontSize: SIZES.small,
      color: COLORS.gray,
    },
    postDescription: {
      fontSize: SIZES.medium,
      color: COLORS.black,
      marginTop: 10,
    },
    postImage: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginTop: 10,
    },
    postActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    actionButton: {
      flex: 1,
      alignItems: 'center',
    },
  });
  