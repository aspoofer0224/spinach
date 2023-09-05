import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { useSelector } from 'react-redux';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { updateDoc, doc,increment} from 'firebase/firestore';
import { FIRESTORE_DB,FIREBASE_AUTH} from '../../firebase_config';
import * as FS from 'expo-file-system';





const uploadImageToStorage = async (uri) => {
  const storage = getStorage();
  const imageName = `${Date.now()}.jpg`; // Unique name for the image
  const imageRef = ref(storage, `posts_images/${imageName}`);

  const response = await fetch(uri);
  const blob = await response.blob();

  const uploadTask = uploadBytesResumable(imageRef, blob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress updates if needed
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(imageRef);
        resolve(downloadURL);
      }
    );
  });
};



const createPost = async (uid, postImage, description, location,username, profilePicture) => {
  const postRef = collection(FIRESTORE_DB, 'posts');
  const timestamp = serverTimestamp(); // Server-side timestamp
  
  const postData = {
    uid,
    postImage,
    description,
    location: location || '',
    timestamp,
    likes:0,
    comments: [],
    shares:0,
    username, // Include the username
    profilePicture,
    likedBy: [],
  };


  const docRef = await addDoc(postRef, postData);
  return docRef.id; // Return the new post ID
};

const incrementUserPostCount = async (uid) => {
  const userRef = doc(FIRESTORE_DB, 'users', uid);
  await updateDoc(userRef, {
    posts: increment(1),
  });
};



export default function DescriptionScreen({ route, navigation }) {
  const [description, setDescription] = useState('');
  const userData = useSelector((state) => state.user.userData);
  const previewImage = route.params?.image;
  const [location, setLocation] = useState('');
  const [isDetectionEnabled, setIsDetectionEnabled] = useState(false);
  const [detectedFood, setDetectedFood] = useState(null);
  const toggleSwitch = () => setIsDetectionEnabled(previousState => !previousState);
  const [isLoading, setIsLoading] = useState(false);

  const handleDetection = async () => {
    setIsLoading(true);  // Set loading state to true
    const foodName = await toServer({uri: previewImage});  // Get the detected food name directly
    setIsLoading(false);  // Set loading state to false
    if (foodName) {
      navigation.navigate('AddFoodScreen', { selectedFood: { food_name: foodName } });
    }
  };
  



  const toServer = async (imageData) => {
    let type = "image"; // Since you are uploading images
    let schema = "http://";
    let host = "192.168.0.171"; // Replace with your Flask server IP
    let route = "/detect"; // Replace with your Flask route
    let port = "8000"; // Replace with your Flask port
    let url = schema + host + ":" + port + route;
    let content_type = "image/jpeg"; // Content type for JPEG image
  
    try {
      let response = await FS.uploadAsync(url, imageData.uri, {
        headers: {
          "content-type": content_type,
        },
        httpMethod: "POST",
        uploadType: FS.FileSystemUploadType.BINARY_CONTENT,
      });
  
      console.log("Response headers:", response.headers);
      console.log("Response body:", response.body);
  
      // Now, you can extract the detected food from the response
      const detectedFood = JSON.parse(response.body).food_type;
      console.log("We got it: ",detectedFood);
      return detectedFood;
      
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  
  
  

  const handlePost = async () => {
    try {
      const postImage = await uploadImageToStorage(previewImage);
      const uid = FIREBASE_AUTH.currentUser.uid;
      const username = userData?.username;
      const profilePicture = userData?.image;
      // Create the post in Firestore
      const postId = await createPost(uid, postImage, description, location,username,profilePicture);
  
      // Increment the user's post count
      await incrementUserPostCount(uid);
  
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error.message);
      // Handle the error, e.g., show an alert to the user
    }
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.leftButton}>Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handleDetection}>
            <Text style={styles.detectButton}>Detect</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePost}>
            <Text style={styles.rightButton}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

      <View style={styles.card}>
        <Image source={{ uri: userData?.image }} style={styles.profilePicture} />
        <TextInput
          placeholder="Add a description"
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity onPress={() => {/* Handle location action here */}}>
        <Text style={styles.addLocation}>Add location</Text>
      </TouchableOpacity>
      <Image source={{ uri: previewImage }} style={styles.previewImage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  leftButton: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  rightButton: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  detectButton: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginRight:10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  descriptionInput: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginHorizontal: 10,
  },
  previewImage: {
    width: '100%', // Full width of the screen
    height: undefined, // Let height adjust based on the aspect ratio
    aspectRatio: 1, // You can adjust this to match the aspect ratio of the image
    resizeMode: 'contain', // Keep the image aspect ratio
  },
  addLocation: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    padding: 15,
  },
});
