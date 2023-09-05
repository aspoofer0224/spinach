import React ,{useState,useEffect} from 'react';
import { View, TouchableOpacity, Image, StyleSheet, SafeAreaView, ScrollView,Text,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FIREBASE_AUTH,FIRESTORE_DB } from '../../firebase_config';
import { signOut } from 'firebase/auth';
import { useSelector } from 'react-redux';
import {useRouter} from 'expo-router';
import {LinearGradient} from 'expo-linear-gradient';
import { doc,getDoc,onSnapshot} from 'firebase/firestore';

export default function ProfileScreen({navigation }) {
  const userData = useSelector((state) => state.user.userData);
  const currentUserId = FIREBASE_AUTH.currentUser.uid;
  const router = useRouter();
  const userPosts = useSelector((state) => state.posts.userPosts);
  const [isGoalAchieved, setIsGoalAchieved] = useState(false);


  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      Alert.alert('Logged out', 'You have been logged out successfully.');
      router.replace('./SignInScreen'); // Redirect to SignInScreen after successful sign-out
    } catch (error) {
      console.error('Sign-out error:', error.message);
      Alert.alert('Logout Failed', 'Could not log out. Please try again.');
    }
  };


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
              onPress={() => navigation.navigate('PostScreen', { post: {...post, timestamp: post.timestamp.toString()}})}
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

  useEffect(() => {
    const userRef = doc(FIRESTORE_DB, 'users', currentUserId);
  
    // Attach listener for document changes
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setIsGoalAchieved(userData.goalAchieved);
      }
    });
  
    // Clean up listener when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);
  
  
  

  return (
    <LinearGradient colors={['#EDF9EB','#9ee2d7','#9ee2d7']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView >
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userData?.posts || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('FollowScreen', { userId: currentUserId ,type:'Followers'})}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{userData?.numFollowers || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('FollowScreen', { userId: currentUserId,type:'Following' })}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{userData?.numFollowing || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Image source={{ uri: userData?.image }} style={styles.profilePicture} />
            <View>
              <Text style={styles.username}>{userData?.username}</Text>
              <Text style={styles.description}>{userData?.description}</Text>
              {isGoalAchieved && (
                <View style={styles.goalAchievedContainer}>
                  <Text style={styles.goalAchievedText}>Achieved</Text>
                  <Icon name="check-circle" size={20} color="green" />
                </View>
              )}

            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => navigation.navigate('Dashboard')} // Replace 'Dashboard' with the name of your dashboard screen
          >
            <Text style={styles.dashboardButtonText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

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
  dashboardButton: {
    backgroundColor: 'darkgreen', // Green color
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  dashboardButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  gridIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#ff0000', // You can choose another color
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center'
  },
  logoutButtonText: {
    color: '#ffffff',
  },
  posts: {
    // Style for the posts grid
  },
});
