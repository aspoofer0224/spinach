import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { COLORS, FONT, SIZES } from '../constants/theme';

const AuthSwitch = ({ text, buttonText, link }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      <Link href={link} asChild>
        <TouchableOpacity>
          <Text style={styles.button}>{buttonText}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  text: {
    color: COLORS.gray,
    fontSize: SIZES.medium,
  },
  button: {
    color: COLORS.primary,
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    marginLeft: 5,
  },
});

export default AuthSwitch;
