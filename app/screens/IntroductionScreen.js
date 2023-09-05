import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, Dimensions,TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { Link } from "expo-router";
import { COLORS,FONT,SIZES } from '../../constants/theme';


export default function IntroductionScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <LottieView
                    source={require('../../assets/animation/boiling_soup.json')} // Replace with your animation file
                    autoPlay
                    loop
                    style={styles.animation}
                />
                <Text style={styles.title}>Spinach: Your Food Nutrition Companion</Text>
                <Text style={styles.description}>Snap a photo of your meal, enter the weight, and get instant nutrition insights! Share your healthy choices, connect with friends, and embark on a nutritional journey together.</Text>
            </View>
            <Link href="./SignInScreen" asChild>
                <TouchableOpacity style={styles.proceedButton}>
                    <Text style={styles.proceedButtonText}>Proceed</Text>
                </TouchableOpacity>
            </Link>            
        </SafeAreaView>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    animation: {
        width: width * 0.7, // Adjust based on your needs
        height: height * 0.3, // Adjust based on your needs
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },

    proceedButton: {
        position: 'absolute',
        bottom: 50,
        right: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    proceedButtonText: {
        color: COLORS.white,
        fontFamily: FONT.medium,
        fontSize: SIZES.medium,
    },
});
