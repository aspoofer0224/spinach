import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, FONT, SIZES } from '../../constants/theme';
import { Link } from 'expo-router';
import {useRouter} from 'expo-router';
import FormInput from '../../components/FormInput';
import SocialButton from '../../components/SocialButton';
import Button from '../../components/Button';
import AuthSwitch from '../../components/AuthSwitch';

import { FIRESTORE_DB, FIREBASE_AUTH, FIREBASE_STORAGE } from '../../firebase_config';
import { ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {collection,addDoc,setDoc,doc} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';





/*Implement password schema after done backend*/
export default function SignUpScreen({}) {
  /* useState helps to re-render/update the value in the front-end by 
  letting react know to watch the variable, set the variable to be reactive
  */
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setPasswordVisibility] = useState(true);
  const [isConfirmPasswordVisible, setConfirmPasswordVisibility] = useState(true);

  const router = useRouter();
  const auth = FIREBASE_AUTH;
  const db = FIRESTORE_DB;
  const storageRef = FIREBASE_STORAGE;
  const collectionRef = collection(db,'users');

  const [profileImage, setProfileImage] = useState(null); // Add this state variable

  


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
  

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;
      let imageURL = null;
      if (profileImage) {

        const imageRef = ref(storageRef, 'profile_images/' + user.uid);
        const responseImage = await fetch(profileImage);
        const blob = await responseImage.blob();
        await uploadBytes(imageRef, blob);
  
        // Get download URL for the uploaded image
        imageURL = await getDownloadURL(imageRef);
      }
      const userRef = doc(db, 'users', user.uid);
      try {
        setDoc(userRef,{
          username: username,
          password: password,
          email: email,
          phoneNumber: phoneNumber,
          image: imageURL,
          description: ' ',
          posts: 0,
          numFollowers:0,
          numFollowing:0,
          Following:[],
          Followers:[],
        })
        Alert.alert('Success', 'Account created successfully.', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('./SignInScreen'); 
            },
          },
        ]);
      } catch (firestoreError) {
        console.error("Firestore write error:", firestoreError);
        Alert.alert('Error', 'Failed to store additional user information. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      console.log(error);
    }
  };
  

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Link href="./SignInScreen" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Icon name="arrow-left" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </Link>
        </View>
        <Text style={styles.title}>Sign Up</Text>

        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Icon name="user-circle" size={100} color={COLORS.gray} />
            )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.profileImageText}>Select profile image</Text>
          </TouchableOpacity>


        <FormInput label="Username" placeholder="Enter Your Username" onChangeText={setUsername} value={username} />
        <FormInput label="Email Address" placeholder="Enter Your Email" onChangeText={setEmail} keyboardType="email-address" value={email} />
        <FormInput label="Phone Number" placeholder="Enter Your Phone Number" onChangeText={setPhoneNumber} keyboardType="phone-pad" value={phoneNumber} />
        <FormInput
          label="Password"
          placeholder="Enter Your Password"
          onChangeText={setPassword}
          secureTextEntry={isPasswordVisible}
          value={password}
          iconRight={isPasswordVisible ? 'eye-slash' : 'eye'}
          togglePasswordVisibility={() => setPasswordVisibility(!isPasswordVisible)}
        />
        <FormInput
          label="Confirm Password"
          placeholder="Confirm Your Password"
          onChangeText={setConfirmPassword}
          secureTextEntry={isConfirmPasswordVisible}
          value={confirmPassword}
          iconRight={isConfirmPasswordVisible ? 'eye-slash' : 'eye'}
          togglePasswordVisibility={() => setConfirmPasswordVisibility(!isConfirmPasswordVisible)}
        />

        <Button title="Sign Up" onPress={handleSignUp} buttonText="Sign Up" style={styles.signUpButton} />


        <AuthSwitch text="Already have an account?" buttonText="Sign In" link="./SignInScreen" />
      </View>
    </SafeAreaView>
  );
}

// You can use similar styles as in the SignInScreen with some adjustments for the new elements.
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
      padding: 20,
    },
    title: {
      fontSize: SIZES.large,
      fontFamily: FONT.bold,
      color: COLORS.primary,
      textAlign: 'left',
      marginLeft: 15,
    },
    signUpButton: {
      backgroundColor: COLORS.green,
      width: width - 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 5,
      marginTop: 20,
    },
    orText: {
      color: COLORS.gray,
      textAlign: 'center',
      marginTop: 10,
    },
    socialButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    signInText: {
      color: COLORS.gray,
      fontSize: SIZES.medium,
    },
    signInButton: {
      color: COLORS.primary,
      fontSize: SIZES.medium,
      fontFamily: FONT.medium,
      marginLeft: 5,
    },
    profileImageContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    profileImageText: {
      textAlign: 'center',
      color: COLORS.primary,
      fontSize: SIZES.medium,
      fontFamily: FONT.medium,
      marginTop: -5,
    },
  });
  
  
