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

import {FIREBASE_AUTH } from '../../firebase_config';

import { sendPasswordResetEmail } from 'firebase/auth';






export default function ForgetPass({}) {

    const [email, setEmail] = useState('');
  
    const router = useRouter();
    const auth = FIREBASE_AUTH;
  
    const handleReset = async () => {
      if (!email) {
        Alert.alert('Error', 'Please enter your email address.');
        return;
      }
  
      try {
        await sendPasswordResetEmail(auth, email); // Send reset email
  
        Alert.alert('Success', 'A password reset link has been sent to your email.', [
          {
            text: 'OK',
            onPress: () => {
              router.replace('./SignInScreen'); 
            },
          },
        ]);
  
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
          <Text style={styles.title}>Reset Password</Text>
  
          <FormInput 
            label="Email Address" 
            placeholder="Enter Your Email" 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            value={email} 
          />
  
          <Button title="Reset Password" onPress={handleReset} buttonText="Reset Password" style={styles.resetButton} />
  
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




  });
  
  
