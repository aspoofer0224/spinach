import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import axios from 'axios';

export default function SearchFoodScreen({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get('https://trackapi.nutritionix.com/v2/search/instant', {
        headers: {
          'x-app-id': 'bff1e03c',
          'x-app-key': '582b3a06d6c428b34e2e6742a9817996',
        },
        params: {
          query,
        },
      });
      setFoods(response.data.branded);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectFood = (food) => {
    navigation.navigate('AddFoodScreen', { selectedFood: food, mealType: route.params.meal });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput 
        style={styles.searchBar}
        placeholder="Search food..."
        placeholderTextColor="gray"
        value={query}
        onChangeText={text => { setQuery(text); handleSearch(); }}
      />
      <FlatList
        data={foods}
        keyExtractor={item => item.food_name}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.foodItem} onPress={() => handleSelectFood(item)}>
            <Text style={styles.foodName}>{item.food_name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF9EB',
  },
  searchBar: {
    height: 50,
    margin: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  foodItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  foodName: {
    fontSize: 18,
  },
});
