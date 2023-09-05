import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button, SafeAreaView,ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, query, where, getDocs, Timestamp,doc,getDoc,updateDoc,arrayRemove} from 'firebase/firestore';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase_config';
import { useIsFocused } from '@react-navigation/native';


export default function DashboardScreen({ navigation,route }) {

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const isFocused = useIsFocused();


  const [goalCalories, setGoalCalories] = useState(0); // Assume this is set elsewhere

  const [selectedFoods, setSelectedFoods] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: []
  });

  const setGoalAchieved = async (userId, isAchieved) => {
    const userRef = doc(FIRESTORE_DB, 'users', userId);
    await updateDoc(userRef, {
      goalAchieved: isAchieved,
    });
  };
  


  const calculateTotalCalories = () => {
    let sum = 0;
    Object.keys(selectedFoods).forEach((mealType) => {
      selectedFoods[mealType].forEach((food) => {
        sum += food.calories;
      });
    });
    return sum;
  };

  const calculateNutritionSums = () => {
    let sumProtein = 0, sumFat = 0, sumCarbs = 0;
    Object.keys(selectedFoods).forEach((mealType) => {
      selectedFoods[mealType].forEach((food) => {
        sumProtein += food.protein;
        sumFat += food.fats;
        sumCarbs += food.carbs;
      });
    });
    setTotalProtein(sumProtein);
    setTotalFat(sumFat);
    setTotalCarbs(sumCarbs);
  };

  
  

  useEffect(() => {
    const fetchGoalCalories = async () => {
      const userId = FIREBASE_AUTH.currentUser.uid;
      const userRef = doc(FIRESTORE_DB, 'users', userId);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // Assuming you have a state variable called setGoalCalories
        setGoalCalories(parseFloat(userData.goalCalories));
      }
    };

    fetchGoalCalories();
  }, []);


  const mapDataToSelectedFoods = (data) => {
    const mappedData = {
      Breakfast: [],
      Lunch: [],
      Dinner: []
    };
  
    data.log.forEach((item) => {
      const mealType = item.mealType;
      if (mealType in mappedData) {
        mappedData[mealType].push(item);
      }
    });

    console.log("MAPPPPPEDD DATA", mappedData);
    setSelectedFoods(mappedData);
};

  
  
  


  const fetchFoodLogs = async () => {
    const userId = FIREBASE_AUTH.currentUser.uid; // Assuming you have this in scope
  
    // Convert JavaScript Date to Firestore Timestamp
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);
  
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
  
    // Fetch the data from Firestore here
    const userDocRef = doc(FIRESTORE_DB, 'nutritionDiary', userId);
    const userDocSnap = await getDoc(userDocRef);
  
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
  
      // Filter and map data here
      const filteredData = Object.keys(userData).reduce((acc, mealType) => {
        acc[mealType] = userData[mealType].filter(log => {
          const logDate = new Date(log.date.seconds * 1000);
          return logDate >= startOfDay && logDate <= endOfDay;
        });
        return acc;
      }, {});
  
      console.log("my filtered data,:",filteredData);
  
      // Call mapDataToSelectedFoods to map data to state
      mapDataToSelectedFoods(filteredData);
    }
  };
  

  useEffect(() => {
    if (isFocused) {  
      fetchFoodLogs();
    }
  }, [isFocused]);

  useEffect(() => {
    const newTotalCalories = calculateTotalCalories();
    setTotalCalories(newTotalCalories);
    calculateNutritionSums();
  }, [selectedFoods]);

  const remainingCalories = goalCalories - totalCalories;

  useEffect(() => {
    const userId = FIREBASE_AUTH.currentUser.uid;
  
    if (remainingCalories <= 0) {
      setGoalAchieved(userId, true);
    } else {
      setGoalAchieved(userId, false);
    }
  }, [remainingCalories]);
  
  
  console.log(selectedFoods);
  

  const deleteFoodLog = async (userId, mealType, foodData) => {
    const userDiaryDoc = doc(collection(FIRESTORE_DB, "nutritionDiary"), userId);
  
    await updateDoc(userDiaryDoc, {
      [`log`]: arrayRemove(foodData)
    });
  };
  
  const handleDelete = async (mealType, foodData) => {
    const userId = FIREBASE_AUTH.currentUser.uid;
  
    // Remove the food log from Firestore
    await deleteFoodLog(userId, mealType, foodData);
  
    // Remove the food log from the state
    const updatedFoods = { ...selectedFoods };
    updatedFoods[mealType] = updatedFoods[mealType].filter(item => item !== foodData);
    setSelectedFoods(updatedFoods);
  };
  


  
  
  
  

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDatePickerVisibility(false);
    setSelectedDate(currentDate);
  };

  

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
        <TouchableOpacity style={styles.goalButton} onPress={() => navigation.navigate('GoalScreen')}>
            <Text style={styles.buttonText}>Goal</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisibility(true)}>
            <Text style={styles.buttonText}>Today</Text>
        </TouchableOpacity>

        {isDatePickerVisible && (
        <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            textColor='black'
        />
        )}

        <Text style={styles.selectedDate}>
            {selectedDate.toDateString()} 
        </Text>


        <View style={styles.grayGap} />
        <View style={styles.caloriesRow}>
          <View style={styles.caloriesColumn}>
            <Text style={styles.caloriesNumber}>{goalCalories.toFixed(2)}</Text>
            <Text style={styles.caloriesText}>Goal</Text>
          </View>
          <Text style={styles.caloriesCalculation}>-</Text>
          <View style={styles.caloriesColumn}>
            <Text style={styles.caloriesNumber}>{totalCalories.toFixed(2)}</Text>
            <Text style={styles.caloriesText}>Food</Text>
          </View>
          <Text style={styles.caloriesCalculation}>=</Text>
          <View style={styles.caloriesColumn}>
            {!isNaN(goalCalories) && (remainingCalories > 0 ? (
              <>
                <Text style={styles.caloriesNumber}>{remainingCalories.toFixed(2)}</Text>
                <Text style={styles.caloriesText}>Calories Remaining</Text>
              </>
            ) : (
              <>
                <Text style={styles.caloriesNumber}>Goal Achieved!</Text>
                <Icon name="check-circle" size={30} color="green" />
              </>
            ))}
          </View>
        </View>

        <View style={styles.grayGap} />
        <View style={styles.caloriesRow}>
          <Text style={styles.nutritionText}>Protein: {totalProtein.toFixed(2)}g</Text>
          <Text style={styles.nutritionText}>Fat: {totalFat.toFixed(2)}g</Text>
          <Text style={styles.nutritionText}>Carbs: {totalCarbs.toFixed(2)}g</Text>
        </View>
        <View style={styles.grayGap} />


        {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => (
        <View key={index} style={styles.mealSection}>
          <Text style={styles.mealTitle}>{meal}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('SearchFoodScreen', { meal })}
          >
            <Text style={styles.buttonText}>Add Food</Text>
          </TouchableOpacity>
          {selectedFoods[meal]?.map((food, foodIndex) => (  // Notice the '?'
            <View key={foodIndex} style={styles.foodItem}>
              <Text style={styles.foodName}>{food.selectedFood?.food_name}</Text>  
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDelete(meal, food)}
              >
                <Text style={styles.buttonText}>X</Text>
              </TouchableOpacity>
              <View style={styles.nutritionRow}>
                <Text>Calories: {food.calories}</Text>
                <Text>Carbs: {food.carbs}</Text>
                <Text>Protein: {food.protein}</Text>
                <Text>Fats: {food.fats}</Text>
              </View>
              <Text>{food.serving_qty} {food.serving_unit}</Text>
            </View>
          ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EDF9EB',
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
    backgroundColor:'black',
  },
  goalButton: {
    backgroundColor: 'darkgreen',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-end',  // Align to the left
  },
  grayGap: {
    backgroundColor: '#ccc', 
    height: 10,  
  },
  dateButton: {
    alignSelf: 'center',
    backgroundColor: '#00F',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
  },
  selectedDate: {
    alignSelf: 'center',
    fontSize: 18,
    marginVertical: 10,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  caloriesColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  caloriesNumber: {
    fontSize: 20,
  },
  caloriesText: {
    fontSize: 18,
  },
  nutritionText: {
    fontSize: 18,
    marginRight:10,
  },
  caloriesCalculation: {
    fontSize: 36,
    marginHorizontal: 10,
  },

  mealSection: {
    marginBottom: 40, // Increase this value to have more space between sections
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'darkgreen',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-start',  // Align to the left
    marginTop: 10,
  },
  addFoodText: {
    color: '#FFF',
  },
  foodItem: {
    backgroundColor: '#f2f2f2', // Light grey background
    borderRadius: 10,           // Rounded corners
    borderWidth: 2,              // Border width
    borderColor: '#00F',         // Border color
    padding: 10,                 // Padding for inner content
    marginVertical: 5,           // Vertical margin
    flexDirection: 'row',        // Horizontal layout
    justifyContent: 'space-between', // Space out elements
  },
  foodName: {
    fontSize: 18,                // Font size
    fontWeight: 'bold',    
    maxWidth:200,      // Bold text
  },
  foodNutrients: {
    flexDirection: 'row',        // Horizontal layout
    justifyContent: 'space-between', // Space out elements
    width: '60%',                // Fixed width
  },
  nutrientText: {
    fontSize: 16,                // Font size
  }
});
