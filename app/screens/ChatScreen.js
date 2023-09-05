import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image} from 'react-native';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase_config';
import { doc, setDoc, getDoc, collection, addDoc, onSnapshot,updateDoc } from 'firebase/firestore';
import moment from 'moment';
import {  useSelector } from 'react-redux'; // Import useSelector
import * as Notifications from 'expo-notifications';
import {LinearGradient} from 'expo-linear-gradient';


export default function ChatScreen({ route,navigation}) {
  const { userId: receiverId,chatId:chatId} = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const senderId = FIREBASE_AUTH.currentUser.uid;
  const userData = useSelector((state) => state.user.userData);
  const [receiverData, setReceiverData] = useState(null);
  const chatRef = doc(FIRESTORE_DB, 'chats', chatId);


  useEffect(() => {
    const initChat = async () => {
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          messages: [],
        });
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    const receiverRef = doc(FIRESTORE_DB, 'users', receiverId);
    getDoc(receiverRef).then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        setReceiverData(data);
      }
    });
  }, [receiverId]);

  

  

  const sendMessage = async () => {
    if (newMessage.trim().length > 0) {
      const message = {
        text: newMessage,
        senderId: senderId,
        receiverId: receiverId,
        timestamp: new Date(),
      };
  
      // Add the message to Firestore
      await addDoc(collection(chatRef, 'messages'), message);
  
      // Update or create chat object for ChatHistoryScreen
      const chatHistoryRef = doc(FIRESTORE_DB, 'chatHistory', chatId);
      const chatHistoryDoc = await getDoc(chatHistoryRef);
  
      if (chatHistoryDoc.exists()) {
        // Update last message
        await updateDoc(chatHistoryRef, {
          lastMessage: newMessage,
          timestamp: new Date(),
        });
      } else {
        // Create new chat history object
        await setDoc(chatHistoryRef, {
          senderId: senderId,
          receiverId: receiverId,
          receiverUsername: receiverData.username,
          senderUsername: userData?.username,
          senderProfilePic: userData?.image,
          receiverProfilePic: receiverData.image, // you'll need to fetch or store this
          lastMessage: newMessage,
          timestamp: new Date(),
        });
      }
  
      // Clear the input field
      setNewMessage('');
    }
  };

  useEffect(() => {
    const messagesCollectionRef = collection(chatRef, 'messages');
    const unsubscribe = onSnapshot(
      messagesCollectionRef,
      (querySnapshot) => {
        const fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedMessages.push({
            ...data,
            timestamp: data.timestamp?.toDate(),
          });
  
          // Check if the message is from the receiver and if so, show a notification
          if (data.receiverId === senderId) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: "New Message",
                body: data.text,
                data: { data: 'goes here' },
              },
              trigger: null,
            });
          }
        });
        setMessages(fetchedMessages.sort((a, b) => a.timestamp - b.timestamp));  // Sort the array here
      }
    );
  
    return () => {
      unsubscribe();
    };
  }, []);
  
  

  //const isSender = (message) => message.sender === loggedInUserId;
  const renderItem = ({ item }) => {
    if (item.type === 'shared_post') {
      const { post } = item;
      console.log(post);
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('UserPostScreen', { post })}
          style={{
            flexDirection: 'row',
            justifyContent: item.senderId === senderId ? 'flex-end' : 'flex-start',
            padding: 10,
          }}
        >
          <View style={{
            backgroundColor: item.senderId === senderId ? 'blue' : 'grey',
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
          }}>
            <Text style={{ color: 'white' }}>{item.text}</Text>
            <Image source={{ uri: post?.postImage }} style={{ width: 50, height: 50 }} />
            <Text style={{ color: 'white', fontSize: 10 }}>{moment(item.timestamp).fromNow()}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={{
          flexDirection: 'row',
          justifyContent: item.senderId === senderId ? 'flex-end' : 'flex-start',
          padding: 10,
        }}>
          <View style={{
            backgroundColor: item.senderId === senderId ? 'blue' : 'grey',
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
          }}>
            <Text style={{ color: 'white' }}>{item.text}</Text>
            <Text style={{ color: 'white', fontSize: 10 }}>{moment(item.timestamp).fromNow()}</Text>
          </View>
        </View>
      );
    }
  };
  



  return (
  
      <SafeAreaView style={{ flex: 1,backgroundColor:'#EDF9EB'}}>
        {receiverData && (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
            <Image source={{ uri: receiverData.image }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            <Text style={{ marginLeft: 10 }}>{receiverData.username}</Text>
          </View>
        )}
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            style={styles.input}
            placeholder="Type a message..."
          />
          <TouchableOpacity onPress={sendMessage}>
            <Text style={styles.sendButton}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  senderMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  receiverMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  messageTextContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    padding: 10,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: 'gray',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: 'blue',
    color: 'white',
    padding: 10,
    borderRadius: 5,
  },
});
