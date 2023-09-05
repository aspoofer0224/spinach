import React, { useState , useEffect } from 'react';
import { SplashScreen, Redirect } from 'expo-router';
import { StyleSheet, Dimensions} from 'react-native';
import { COLORS, FONT, SIZES } from '../constants/theme';
//import Layout from './_layout';


import * as Font from 'expo-font';
import {Provider} from 'react-redux';
import store from '../redux/store';


// Function to load custom fonts
const loadFonts = async () => {
  await Font.loadAsync({
    DMRegular: require('../assets/fonts/DMSans-Regular.ttf'),
    DMMedium: require('../assets/fonts/DMSans-Medium.ttf'),
    DMBold: require('../assets/fonts/DMSans-Bold.ttf'),
  });
};

export default function App() {
  const [isReady, setReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    // Load the fonts and hide the splash screen after a delay
    const loadResources = async () => {
      await loadFonts();
      setFontsLoaded(true);

      setTimeout(() => {
        SplashScreen.hideAsync();
        setReady(true);
      }, 3000);
    };

    loadResources();
  }, []);

  // If the splash screen is still visible or fonts are loading, return null
  if (!isReady || !fontsLoaded) {
    return null;
  }

  return (
      <Redirect href="./screens/SignInScreen" />
  );

}
