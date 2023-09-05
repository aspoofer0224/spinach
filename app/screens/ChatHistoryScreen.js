import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, Image, TouchableOpacity, SafeAreaView,StyleSheet} from 'react-native';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase_config';
import { collection, getDocs, query, where,onSnapshot} from 'firebase/firestore';
import moment from 'moment';
import {LinearGradient} from 'expo-linear-gradient';

export default function ChatHistoryScreen({ navigation }) {
  const [chatHistory, setChatHistory] = useState([]);
  const currentUserId = FIREBASE_AUTH.currentUser.uid;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(FIRESTORE_DB, 'chatHistory'),
      (querySnapshot) => {
        const fetchedChatHistories = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.senderId === currentUserId || data.receiverId === currentUserId) {
            fetchedChatHistories.push(data);
          }
        });
        setChatHistory(fetchedChatHistories);
      }
    );
  
    return () => {
      unsubscribe();
    };
  }, []);

  console.log(chatHistory);

  const navigateToChat = (receiverId, chatId) => {
    navigation.navigate('ChatScreen', { userId:receiverId, chatId:chatId });
  };

  const renderItem = ({ item }) => {
    // Determine if the current user is the sender or the receiver
    const isCurrentUserSender = item.senderId === currentUserId;
    
    // Set the opposite party based on the current user's role
    const oppositeUserId = isCurrentUserSender ? item.receiverId : item.senderId;
    const oppositeUsername = isCurrentUserSender ? item.receiverUsername : item.senderUsername;
    const oppositeProfilePic = isCurrentUserSender ? item.receiverProfilePic : item.senderProfilePic;
    const chatId = item.receiverId < item.senderId ? item.receiverId + '-' + item.senderId : item.senderId + '-' + item.receiverId;
  
    return (
        <TouchableOpacity onPress={() => navigateToChat(oppositeUserId, chatId)} style={styles.chatHistoryItem}>
            <View style={styles.chatHistoryContent}>
            <Image source={{ uri: oppositeProfilePic }} style={styles.profilePic} />
            <View style={styles.chatDetails}>
                <Text style={styles.username}>{oppositeUsername}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
            </View>
        </TouchableOpacity>
    );
  };
  

  return (
    <LinearGradient colors={['#9ee2d7','#9ee2d7','#6BCABE', '#192f6a']} style={styles.container}>
      <SafeAreaView>
        <FlatList
          data={chatHistory}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F0F0F0',
    },
    chatHistoryItem: {
      borderBottomWidth: 1,
      borderColor: '#E0E0E0',
      padding: 15,
    },
    chatHistoryContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profilePic: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    chatDetails: {
      marginLeft: 20,
    },
    username: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    lastMessage: {
      color: 'black',
      marginTop: 5,
      fontSize:16,
    },
  });