import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions,SafeAreaView ,Alert} from 'react-native';
import { COLORS, FONT, SIZES } from '../../constants/theme';

import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import SocialButton from '../../components/SocialButton';
import AuthSwitch from '../../components/AuthSwitch';

import {useRouter,Link} from 'expo-router';

import { signInWithEmailAndPassword,onAuthStateChanged} from 'firebase/auth';
import {getDoc,doc,onSnapshot ,docSnap} from 'firebase/firestore';
import { FIRESTORE_DB, FIREBASE_AUTH} from '../../firebase_config';

import { useDispatch} from 'react-redux';
import store from '../../redux/store';
import { setUserData } from '../../redux/action';




export default function SignInScreen({}) {
  const auth = FIREBASE_AUTH;
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisibility] = useState(true);
  const [error, setError] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  const db = FIRESTORE_DB;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        // User is signed in.
        const uid = user.uid;
        const docRef = doc(FIRESTORE_DB,"users",uid);

        const userDoc = await getDoc(docRef);
        if (userDoc.exists) {
          const userData = userDoc.data();
          dispatch(setUserData(userData));
        }

        // Navigate to the MainScreen
        router.replace('./MainScreen');
      }
      // No else part here, because we're in the SignInScreen already
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const uid = response.user.uid;
      const docRef = doc(db,"users",uid);

      onSnapshot(docRef, (snapshot) => {
        const data = snapshot.data();
        dispatch(setUserData(data));
      });

      router.replace('./MainScreen');
    } catch (error) {
      setError(error.message);
      Alert.alert('Wrong email address or password!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      

      <FormInput 
        label="Email Address"
        placeholder="Enter Your Email"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
      />

      <FormInput
        label="Password"
        placeholder="Enter Your Password"
        onChangeText={setPassword}
        secureTextEntry={isPasswordVisible}
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
        value={password}
        iconRight={isPasswordVisible ? 'eye-slash' : 'eye'}
        togglePasswordVisibility={() => setPasswordVisibility(!isPasswordVisible)}
      />
      

      <Link href='./ForgetPass' asChild>
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forget password?</Text>
        </TouchableOpacity>
      </Link>

      <Button title="Sign In" onPress={handleSignIn} style={styles.signInButton} />
      <AuthSwitch text="Don't have an account?" buttonText="Sign Up" link="./signupScreen" />
    </SafeAreaView>
  );
}

/*
  <Text style={styles.orText}>OR</Text>

  <View style={styles.socialButtonsContainer}>
    <SocialButton iconName="facebook" onPress={() => {}} />
    <SocialButton iconName="google" onPress={() => {}} />
  </View>
*/

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
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
    marginLeft: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginRight: 20,
  },
  forgotPasswordText: {
    color: COLORS.gray,
    fontSize: SIZES.small,
  },
  signInButton: {
    backgroundColor: COLORS.green,
    width: width - 40,
    height: 40,
    marginLeft: 20,
    borderRadius: 5,
    marginTop: 30,
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: COLORS.gray,
    fontSize: SIZES.medium,
  },
  signUpButton: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    marginLeft: 5,
  },
});

