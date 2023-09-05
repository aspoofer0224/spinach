import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker'; // For photo picking
import HomeScreen from './HomeScreen';
import DescriptionScreen from './DescriptionScreen'; // Your description screen
import Icon from 'react-native-vector-icons/FontAwesome';
import ChatScreen from './ChatScreen';
import { COLORS } from '../../constants/theme';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import PostScreen from './PostScreen';
import SearchScreen from './SearchScreen';
import UserProfileScreen from './UserProfileScreen';
import UserPostScreen from './UserPostScreen';
import ChatHistoryScreen from './ChatHistoryScreen';
import FollowScreen from './FollowScreen';
import Dashboard from './Dashboard';
import GoalScreen from './GoalScreen';
import SearchFoodScreen from './SearchFoodScreen';
import AddFoodScreen from './AddFoodScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


function AddPhotoScreen() {
  // This component doesn't render anything
  return null;
}



function ProfileStackNavigator({}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={({ route }) => ({
          tabBarVisible: route.name !== 'EditProfile',
        })}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ tabBarVisible: false }}
      />
      <Stack.Screen 
        name="PostScreen" 
        component={PostScreen} // Add the PostScreen here
      />
      <Stack.Screen
        name="FollowScreen"
        component={FollowScreen}
      />
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
      />
      <Stack.Screen
        name="GoalScreen"
        component={GoalScreen}
      />
      <Stack.Screen
        name="SearchFoodScreen"
        component={SearchFoodScreen}
      />
      <Stack.Screen
        name="AddFoodScreen"
        component={AddFoodScreen}
      />
    </Stack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="SearchScreen" 
        component={SearchScreen}
      />
      <Stack.Screen 
        name="UserProfileScreen" 
        component={UserProfileScreen}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
      />
      <Stack.Screen
        name="UserPostScreen"
        component={UserPostScreen}
      />
    </Stack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="ChatHistoryScreen" 
        component={ChatHistoryScreen}
      />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen}
      />
      <Stack.Screen 
        name="UserPostScreen" 
        component={UserPostScreen}
      />
    </Stack.Navigator>
  );
}





function MainTabNavigator({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Search':
              iconName ='search';
              break;
            case 'Add Photo':
              iconName = 'plus'; // Icon for add photo
              break;
            case 'ChatHistory':
              iconName = 'comment'; // Icon for chat
              break;
            case 'Profile':
              iconName = 'user';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: [
          {
            display: 'flex',
            backgroundColor:'#EDF9EB',
          },
          null,
        ],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: () => null, headerShown:false}}/>
      <Tab.Screen name="Search" component={SearchStackNavigator} options={{ tabBarLabel: () => null, headerShown:false}}/>
      <Tab.Screen options={{ tabBarLabel: () => null,headerShown:false }}
        name="Add Photo"
        component={AddPhotoScreen}
        listeners={{
          tabPress: async (e) => {
            e.preventDefault(); // Prevent the default action (navigation)
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) {
              // Navigate to the DescriptionScreen with the selected image
              navigation.navigate('Description', { image: result.assets[0].uri });
            }
          },
        }}
      />
      <Tab.Screen name="ChatHistory" component={ChatStackNavigator} options={{ tabBarLabel: () => null,headerShown:false }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ tabBarLabel: () => null,headerShown:false}} />
    </Tab.Navigator>
  );
}

export default function MainScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator}/>
      <Stack.Screen name="Description" component={DescriptionScreen} />
      <Stack.Screen name="AddFoodScreen" component={AddFoodScreen} />
    </Stack.Navigator>
  );
}