import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'; // Add TouchableOpacity
import { COLORS, FONT, SIZES } from '../constants/theme';
import Icon from 'react-native-vector-icons/FontAwesome';

const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  iconRight, // Add this prop
  togglePasswordVisibility, // Add this prop
}) => {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.textWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
        />
        {iconRight && togglePasswordVisibility ? (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Icon name={iconRight} size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 15,
    marginLeft: 20,
  },
  textWrapper: {
    width: '95%',
    flexDirection: 'row', // Ensure TextInput and Icon are in the same row
    alignItems: 'center', // Vertically center the contents
    borderColor: COLORS.gray2,
    borderWidth: 1,
    borderRadius: 5,
  },
  label: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 5,
  },
  textInput: {
    flex: 1, // Allow TextInput to take full width minus icon
    height: 40,
    paddingHorizontal: 10,
  },
});

export default FormInput;
