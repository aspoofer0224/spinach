import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase_config';
import { doc, updateDoc } from 'firebase/firestore';

export default function GoalScreen() {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('Male');
  const [activity, setActivity] = useState('Little/no exercise');
  const [results, setResults] = useState({});
  const [selectedGoal, setSelectedGoal] = useState('Maintain Weight');

  const uploadGoalCalories = async (goalCalories) => {
    const userId = FIREBASE_AUTH.currentUser.uid;
    const userRef = doc(FIRESTORE_DB, 'users', userId);

    await updateDoc(userRef, {
      goalCalories: goalCalories.toFixed(2), // Upload goalCalories to Firestore
    });
  };

  const handleCalculate = () => {
    const bmiResults = calculateBMI();
    const maintainCalories = calculateCalories();

    let goalCalories;
    switch (selectedGoal) {
      case 'Weight Gain':
        goalCalories = maintainCalories * 1.1;
        break;
      case 'Maintain Weight':
        goalCalories = maintainCalories;
        break;
      case 'Weight Loss':
        goalCalories = maintainCalories * 0.9;
        break;
      default:
        goalCalories = maintainCalories;
    }

    setResults({ bmiResults, maintainCalories, goalCalories });
    uploadGoalCalories(goalCalories);
  };

  

  const calculateBMI = () => {
    const bmi = parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2);
    let category, color;
    
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'Red';
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal';
      color = 'Green';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      color = 'Yellow';
    } else {
      category = 'Obesity';
      color = 'Red';
    }

    return { bmi: bmi.toFixed(2), category, color };
  };

  const calculateBMR = () => {
    let bmr;
    if (gender === 'Male') {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
    } else {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) - 161;
    }
    return bmr;
  };

  const calculateCalories = () => {
    const activityLevels = [
      'Little/no exercise',
      'Light exercise',
      'Moderate exercise (3-5 days/wk)',
      'Very active (6-7 days/wk)',
      'Extra active (very active & physical job)',
    ];
    const activityWeights = [1.2, 1.375, 1.55, 1.725, 1.9];
    const weight = activityWeights[activityLevels.indexOf(activity)];
    const maintainCalories = calculateBMR() * weight;
    return maintainCalories;
  };

  

  return (
    <ScrollView>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        
            <Text style={styles.inputTitle}>Age</Text>
            <TextInput
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
            />
            
            <Text style={styles.inputTitle}>Height (cm)</Text>
            <TextInput
            placeholder="Enter your height"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            style={styles.input}
            />
            
            <Text style={styles.inputTitle}>Weight (kg)</Text>
            <TextInput
            placeholder="Enter your weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={styles.input}
            />
            
            <Text style={styles.inputTitle}>Gender</Text>
            <View style={styles.pickerContainer}>
                <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                </Picker>
            </View>
            
            <Text style={styles.inputTitle}>Activity Level</Text>
            <Picker
            selectedValue={activity}
            onValueChange={(itemValue) => setActivity(itemValue)}
            >
                <Picker.Item label="Little/no exercise" value="Little/no exercise" />
                <Picker.Item label="Light exercise" value="Light exercise" />
                <Picker.Item label="Moderate exercise (3-5 days/wk)" value="Moderate exercise (3-5 days/wk)" />
                <Picker.Item label="Very active (6-7 days/wk)" value="Very active (6-7 days/wk)" />
                <Picker.Item label="Extra active (very active & physical job)" value="Extra active (very active & physical job)" />
            </Picker>
            <Text style={styles.inputTitle}>Weight Goal</Text>
            <View style={styles.pickerContainer}>
                <Picker
                selectedValue={selectedGoal}
                onValueChange={(itemValue) => setSelectedGoal(itemValue)}
                style={styles.picker}
                >
                <Picker.Item label="Weight Gain" value="Weight Gain" />
                <Picker.Item label="Maintain Weight" value="Maintain Weight" />
                <Picker.Item label="Weight Loss" value="Weight Loss" />
                </Picker>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleCalculate}>
            <Text style={styles.buttonText}>Calculate</Text>
            </TouchableOpacity>
            {results.bmiResults && (
            <View style={styles.results}>
                <Text>BMI: {results.bmiResults.bmi} ({results.bmiResults.category})</Text>
                <Text>Goal Calories: {results.goalCalories.toFixed(2)}</Text>
            </View>
            )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EDF9EB',
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerContainer: {
    height: 175,
    width: 400,
  },
  picker: {
    width: '100%',
    height: '70%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'darkgreen',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
  },
  results: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f2f2f2',  // Light grey background
    borderRadius: 10,           // Rounded corners
    borderWidth: 2,              // Border width
    borderColor: '#00F',         // Border color
  },
});
