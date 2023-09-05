import React, { useState,useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableWithoutFeedback, 
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Link} from 'expo-router';
import {  useSelector,useDispatch} from 'react-redux'; 
import { FIRESTORE_DB, FIREBASE_AUTH,FIREBASE_STORAGE } from '../../firebase_config';
import * as ImagePicker from 'expo-image-picker';
import { updateDoc, doc,writeBatch,collection, getDocs,query, where} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { setUserData } from '../../redux/action';

export default function EditProfileScreen({navigation}) {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const userData = useSelector((state) => state.user.userData);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if(userData) {
      setUsername(userData?.username);
      setPhoneNumber(userData?.phoneNumber);
      setProfileDescription(userData?.description);
      setProfileImage(userData?.image);
    }
  }, [userData]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  const handleUpdateProfile = async () => {
    const userRef = doc(FIRESTORE_DB, 'users', FIREBASE_AUTH.currentUser.uid);
    const imageRef = ref(FIREBASE_STORAGE, 'profile_images/' + FIREBASE_AUTH.currentUser.uid);
    const postsRef = collection(FIRESTORE_DB, 'posts');
    const chatHistoryRef = collection(FIRESTORE_DB, 'chatHistory');
    const userPostsQuery = query(postsRef, where('uid', '==', FIREBASE_AUTH.currentUser.uid));
  
    const responseImage = await fetch(profileImage);
    const blob = await responseImage.blob();
    await uploadBytes(imageRef, blob);
  
    const imageURL = await getDownloadURL(imageRef);
  
    const updatedData = {
      username: username,
      phoneNumber: phoneNumber,
      description: profileDescription,
      image: imageURL,
    };
  
    const batchWrite = writeBatch(FIRESTORE_DB);
  
    try {
      // Update the user's profile in the `users` collection
      batchWrite.update(userRef, updatedData);
  
      // Fetch all posts from the `posts` collection
      const allPostsSnapshot = await getDocs(postsRef);
      const userPostsSnapshot = await getDocs(userPostsQuery);
      const allChatHistorySnapshot = await getDocs(chatHistoryRef);

      allChatHistorySnapshot.forEach((chatDoc) => {
        const chatRef = doc(FIRESTORE_DB, 'chatHistory', chatDoc.id);
        const chatData = chatDoc.data();
    
        let updatedChatData = {};
    
        // Check if the current user is the sender or receiver in the chat
        if (chatData.senderId === FIREBASE_AUTH.currentUser.uid) {
          updatedChatData.senderUsername = username;
          updatedChatData.senderProfilePic = imageURL;
        }
        
        if (chatData.receiverId === FIREBASE_AUTH.currentUser.uid) {
          updatedChatData.receiverUsername = username;
          updatedChatData.receiverProfilePic = imageURL;
        }
    
        // If the chat involves the current user as either sender or receiver, update it
        if (Object.keys(updatedChatData).length > 0) {
          batchWrite.update(chatRef, updatedChatData);
        }
      });

      userPostsSnapshot.forEach((postDoc) => {
        const userPostRef = doc(FIRESTORE_DB, 'posts', postDoc.id);
        batchWrite.update(userPostRef, {
          username: username,
          profilePicture: imageURL,
        });
      });
  
      allPostsSnapshot.forEach((postDoc) => {
        const postRef = doc(FIRESTORE_DB, 'posts', postDoc.id);
        const postComments = postDoc.data().comments || [];
  
        const updatedComments = postComments.map((comment) => {
          if (comment.uid === FIREBASE_AUTH.currentUser.uid) {
            return {
              ...comment,
              username: username,
              userProfilePicture: imageURL,
            };
          }
          return comment;
        });
  
        batchWrite.update(postRef, { comments: updatedComments });
      });
  
      await batchWrite.commit();
  
      Alert.alert('Profile Updated', 'Your profile have been updated successfully.');
      dispatch(setUserData({ ...userData, ...updatedData }));
    } catch (error) {
      console.log('Error updating profile and comments:', error);
      Alert.alert('Update Failed', 'Could not update profile and comments. Please try again.');
    }
  };
  

  const handleChangePassword = () => {
    // Logic to change password
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.headerText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.profilePictureContainer} onPress={pickImage}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        ) : userData && userData.image ? (
          <Image
            source={{ uri: userData.image }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        ) : (
          <Icon name="user-circle" size={100} color="gray" />
        )}
        <Text style={styles.selectProfileText}>Select Profile Picture</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter Username"
        />

        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>Profile Description</Text>
        <TextInput
          style={styles.input}
          value={profileDescription}
          onChangeText={setProfileDescription}
          placeholder="Enter Profile Description"
          multiline
        />
      </View>

  
      <View style={styles.footerButtons}>
        <Link href='./ForgetPass' asChild>
          <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.updateProfileButton} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginLeft:10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    marginLeft:10,
    fontWeight: 'bold',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  selectProfileText: {
    marginTop: 10,
    color: 'gray',
  },
  inputContainer: {
    padding: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  changePasswordButton: {
    backgroundColor: '#f0c14b',
    padding: 10,
    borderRadius: 5,
  },
  updateProfileButton: {
    backgroundColor: '#00a862',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
