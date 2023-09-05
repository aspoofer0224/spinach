// components/SocialButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../constants/theme';

const SocialButton = ({ iconName, onPress }) => {
  return (
    <TouchableOpacity style={styles.socialButton} onPress={onPress}>
      <Icon name={iconName} size={20} color={COLORS.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButton: {
    borderColor: COLORS.gray2,
    borderWidth: 1,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default SocialButton;
