import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import axios from 'axios';
import { COLORS, SIZES } from '../../constants/theme';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase_config';
import { collection, doc, setDoc, arrayUnion } from "firebase/firestore"; 

export default function AddFoodScreen({ route, navigation }) {
  const [servingUnit, setServingUnit] = useState('');
  const [servingQty, setServingQty] = useState('1');

  const [servingWG, setServingWG] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [nutritionInfo, setNutritionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adjustedNutrition, setAdjustedNutrition] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fats: 0,
  });
  

  

  


  useEffect(() => {
    if (route.params?.selectedFood) {
      // API POST request to get nutrition information
      axios.post(
        'https://trackapi.nutritionix.com/v2/natural/nutrients',
        {
          query: route.params.selectedFood.food_name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': 'bff1e03c',
            'x-app-key': '582b3a06d6c428b34e2e6742a9817996',

          }
        }
      ).then(response => {
        const foodItem = response.data?.foods?.[0];
        setServingUnit(foodItem?.serving_unit?.toString() || '');
        setServingQty(foodItem?.serving_qty?.toString() || '1');
        setServingWG(foodItem?.serving_weight_grams.toString() || ''),
        setNutritionInfo(response.data);
        setIsLoading(false);
      }).catch(error => {
        console.error(error);
        setIsLoading(false);
      });
    }
  }, [route.params?.selectedFood]);



  useEffect(() => {
    const calculateAdjustedNutrition = () => {
      if (foodItem && servingQty) {
        const factor = parseFloat(servingQty);
        setAdjustedNutrition({
          calories: foodItem?.nf_calories * factor,
          carbs: foodItem?.nf_total_carbohydrate * factor,
          protein: foodItem?.nf_protein * factor,
          fats: foodItem?.nf_total_fat * factor,
        });
      }
    };
  
    calculateAdjustedNutrition();
  }, [foodItem, servingQty]);

  useEffect(() => {
    if (nutritionInfo && servingQty) {
      const foodItem = nutritionInfo?.foods?.[0];
      const initialCalories = foodItem?.nf_calories || 0;
      const initialCarbs = foodItem?.nf_total_carbohydrate || 0;
      const initialProtein = foodItem?.nf_protein || 0;
      const initialFats = foodItem?.nf_total_fat || 0;
  
      const adjustedServingQty = parseFloat(servingQty);
      setAdjustedNutrition({
        calories: initialCalories * adjustedServingQty,
        carbs: initialCarbs * adjustedServingQty,
        protein: initialProtein * adjustedServingQty,
        fats: initialFats * adjustedServingQty,
      });
    }
  }, [nutritionInfo, servingQty]);
  
  


  const foodItem = nutritionInfo?.foods?.[0];



  // Extracting alt_measures and specific nutrients
  //const altMeasures = foodItem?.alt_measures || [];
  const calories = foodItem?.nf_calories;
  const carbs = foodItem?.nf_total_carbohydrate;
  const protein = foodItem?.nf_protein;
  const fats = foodItem?.nf_total_fat;
  const thumb = foodItem?.photo?.thumb;



  const addFoodToDiary = async (userId, foodData) => {
    const userDiaryDoc = doc(collection(FIRESTORE_DB, "nutritionDiary"), userId);
  
    await setDoc(userDiaryDoc, {
      log: arrayUnion(foodData)
    }, { merge: true });
  };


  
  // Usage in AddFoodScreen
  const handleAdd = async () => {
    const userId = FIREBASE_AUTH.currentUser.uid;
    const foodData = {
      selectedFood: route.params.selectedFood,
      mealType,
      servingUnit,
      servingQty: parseFloat(servingQty),
      calories: adjustedNutrition.calories,
      carbs: adjustedNutrition.carbs,
      protein: adjustedNutrition.protein,
      fats: adjustedNutrition.fats,
      thumb,
      date: new Date() // current date
    };
  
    await addFoodToDiary(userId, foodData);
    navigation.navigate('Dashboard');
  };
  
  
  
  

  return (
      <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.leftButton}>Back</Text>
        </TouchableOpacity>
        {thumb && (
          <Image 
            source={{ uri: thumb}} 
            style={{ width: 100, height: 100, alignSelf: 'center', marginBottom: 20 ,backgroundColor:'#f4f4f4'}}
          />
        )}
  
        <Text style={styles.label}>Food Name</Text>
        <Text style={styles.readOnlyText}>{route.params?.selectedFood?.food_name || "Not Available"}</Text>
        
        <Text style={styles.label}>Serving Unit</Text>
        <Text style={styles.readOnlyText}>{servingUnit || "Not Available"}</Text>
  
        <Text style={styles.label}>Serving Quantity</Text>
        <TextInput 
            placeholder="Enter serving quantity"
            value={servingQty}
            onChangeText={setServingQty}
            keyboardType="numeric"
            style={styles.input}
        />
  
        <Text style={styles.label}>Serving Weight Grams</Text>
        <Text style={styles.readOnlyText}>{servingWG || "Not Available"}</Text>
  
        <Text style={styles.label}>Meal Type</Text>
        <Picker
            selectedValue={mealType}
            onValueChange={(itemValue) => setMealType(itemValue)}
            style={styles.picker}
        >
            <Picker.Item label="Breakfast" value="Breakfast" />
            <Picker.Item label="Lunch" value="Lunch" />
            <Picker.Item label="Dinner" value="Dinner" />
        </Picker>
  
        {nutritionInfo && (
        <View style={styles.nutritionRow}>
            <View style={styles.results}>
            <Text style={styles.nutritionText}>Calories: {adjustedNutrition.calories}</Text>
            </View>
            <View style={styles.results}>
            <Text style={styles.nutritionText}>Carbs: {adjustedNutrition.carbs}</Text>
            </View>
            <View style={styles.results}>
            <Text style={styles.nutritionText}>Fat: {adjustedNutrition.fats}</Text>
            </View>
            <View style={styles.results}>
            <Text style={styles.nutritionText}>Protein: {adjustedNutrition.protein}</Text>
            </View>
        </View>
        )}

  
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  readOnlyText: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderColor: '#ccc', // Border color
    borderWidth: 1, // Border width
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  leftButton: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginLeft:10,

  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',  // Allows the items to wrap onto the next line if needed
    marginBottom: 20
  },
  results: {
    marginTop: 20,
    padding: 15,
    flexDirection: 'row', // Makes sure the icon and the text are in a single line
    alignItems: 'center', // Vertically centers the icon and the text
    backgroundColor: '#f2f2f2',  // Light grey background
    borderRadius: 10,           // Rounded corners
    borderWidth: 2,              // Border width
    borderColor: '#00F',         // Border color
  },
  nutritionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  addButton: {
    backgroundColor: 'darkgreen',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  }
});
