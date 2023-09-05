// components/PostCard.js
import React, { useState,Fragment} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput,SafeAreaView} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { COLORS, FONT, SIZES } from '../constants/theme';
import { doc, updateDoc,getDoc,Timestamp,collection,query,where,getDocs,addDoc,increment} from 'firebase/firestore';
import { FIRESTORE_DB, FIREBASE_AUTH} from '../firebase_config';
import { useSelector } from 'react-redux';
import moment from 'moment';

const PostCard = ({post,onShare}) => {
  const {
    profilePicture,
    username,
    location,
    description,
    postImage,
    timestamp,
    likes,
    shares,
    comments = [],
    likedBy = [], // Make sure to provide a default value if it might be undefined
  } = post;
    const [isCommentModalVisible, setCommentModalVisible] = useState(false);
    const [newComment, setNewComment] = useState('');
    const userData = useSelector((state) => state.user.userData);
    const userId = FIREBASE_AUTH.currentUser.uid;
    const isLiked = likedBy.includes(userId);
    const postDate = post.timestamp instanceof Timestamp ? post.timestamp.toDate() : new Date(post.timestamp);
    const formattedDate = moment(postDate).fromNow();

    const [isShareModalVisible, setShareModalVisible] = useState(false);
    const [chatHistoryUsers, setChatHistoryUsers] = useState([]);


    const commentTimeAgo = comments.map((comment) => {
      const commentTimestamp = comment.timestamp?.toDate();
      return moment(commentTimestamp).fromNow(); // "2 hours ago"
    });
    
    const toggleShareModal = async () => {
      const chatHistoryRef = collection(FIRESTORE_DB, 'chatHistory');
      
      // Query for senderId
      const senderQuery = query(chatHistoryRef, where('senderId', '==', userId));
      const senderSnapshot = await getDocs(senderQuery);
      
      // Query for receiverId
      const receiverQuery = query(chatHistoryRef, where('receiverId', '==', userId));
      const receiverSnapshot = await getDocs(receiverQuery);
      
      const fetchedChatHistoryUsers = new Set();  // Using Set to avoid duplicates
      
      // Add receiverIds from sender query
      senderSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedChatHistoryUsers.add(data.receiverId);
      });
      
      // Add senderIds from receiver query
      receiverSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedChatHistoryUsers.add(data.senderId);
      });

      const fetchedChatHistoryUsersData = [];
      for (const uid of fetchedChatHistoryUsers) {
        const userRef = doc(FIRESTORE_DB, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          fetchedChatHistoryUsersData.push({ userData: userDoc.data(), uid });
        }
      }


      
      setChatHistoryUsers(fetchedChatHistoryUsersData); // Convert Set to Array
      setShareModalVisible(!isShareModalVisible);
    };
    
    

    const handleShare = async (receiverId) => {
      const chatId = userId < receiverId ? userId + '-' + receiverId : receiverId + '-' + userId;
      const chatRef = doc(FIRESTORE_DB, 'chats', chatId);
      const postRef = doc(FIRESTORE_DB, 'posts', post.id);
      const message = {
        type: 'shared_post', // a new field to identify the type of the message
        text: `Shared a post: ${post.description}`,
        post: {
          ...post,
          timestamp: post?.timestamp,
        },
        senderId: userId,
        receiverId: receiverId,
        timestamp: new Date(),
      };
      await addDoc(collection(chatRef, 'messages'), message);

      await updateDoc(postRef, {
        shares: increment(1)  // Increment the 'shares' field by 1
      });
      
      // Close the share modal
      setShareModalVisible(false);
    };
    
    


    const toggleCommentModal = () => {
      setCommentModalVisible(!isCommentModalVisible);

    };

    const handleLike = async (postId) => {
      const postRef = doc(FIRESTORE_DB, 'posts', postId);
      const postSnapshot = await getDoc(postRef);
      const postData = postSnapshot.data();
    
      let newLikes = postData.likes;
      let newLikedBy = [...postData.likedBy];
    
      if (postData.likedBy.includes(userId)) {
        // User has already liked the post; unlike it
        newLikes -= 1;
        newLikedBy = newLikedBy.filter((id) => id !== userId);
      } else {
        // User has not liked the post; like it
        newLikes += 1;
        newLikedBy.push(userId);
      }
    
      await updateDoc(postRef, {
        likes: newLikes,
        likedBy: newLikedBy,
      });
    };
    

    const handleComment = async (postId) => {
      const postRef = doc(FIRESTORE_DB, 'posts', postId);
      const postSnapshot = await getDoc(postRef);
      const postData = postSnapshot.data();
    
      const currentTimestamp = new Date(); // Using JavaScript Date object for the timestamp
    
      const commentData = {
        userProfilePicture: userData?.image,
        username: userData?.username,
        text: newComment,
        timestamp: currentTimestamp,
        uid: userId,
      };
    
      // Create a new comments array with the existing comments and the new comment
      const newComments = [...postData.comments, commentData];
    
      // Update the post document with the new comments array
      await updateDoc(postRef, {
        comments: newComments,
      });
    
      setNewComment(''); // Clear the comment input
    };

    

    return (
    <SafeAreaView>
      <Fragment>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={{uri:profilePicture}} style={styles.profilePicture} />
            <Text style={styles.dateText}>{formattedDate}</Text>
            <View style={styles.postInfo}>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.location}>{location}</Text>
            </View>
          </View>
    
          <Text style={styles.postDescription}>{description}</Text>
          <Image source={{uri:postImage}} style={styles.postImage} />
          
          <View style={styles.commentsSection}>
            {comments.slice(0, 2).map((comment, index) => (
              <View key={index} style={styles.comment}>
                <Image source={{ uri: comment.userProfilePicture }} style={styles.commentProfilePicture} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentTimestamp}>{commentTimeAgo[index]}</Text> 
                </View>
              </View>
            ))}
          </View>


          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(post.id)}>
              <Icon name="thumbs-up" size={20} color={isLiked ? COLORS.green : COLORS.gray} />
              <Text>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCommentModal}>
              <Icon name="comment" size={20} color={COLORS.gray} />
              <Text>{post.comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={toggleShareModal}>
              <Icon name="share" size={20} color={COLORS.gray} />
              <Text>{post.shares}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isCommentModalVisible}
          onRequestClose={toggleCommentModal}
        >
          <View style={styles.commentModal}>
            <TouchableOpacity onPress={toggleCommentModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <FlatList
              data={comments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const commentTimestamp = item.timestamp?.toDate();
                const formattedTimestamp =  moment(commentTimestamp).fromNow();
                return (
                  <View style={styles.comment}>
                    <Image source={{ uri: item.userProfilePicture }} style={styles.commentProfilePicture} />
                    <View style={styles.commentContent}>
                      <Text style={styles.commentUsername}>{item.username}</Text>
                      <Text style={styles.commentText}>{item.text}</Text>
                      <Text style={styles.commentTimestamp}>{formattedTimestamp}</Text>
                    </View>
                  </View>
                );
              }}
            />
            <View style={styles.inputSection}>
              <TextInput
                placeholder="Add a comment..."
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={() => handleComment(post.id)}>
                <Text style={styles.postButton}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isShareModalVisible}
          onRequestClose={toggleShareModal}
        >
          <View style={styles.shareModal}>
            <TouchableOpacity onPress={toggleShareModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <FlatList
              data={chatHistoryUsers}
              keyExtractor={(item, index) => index.toString()}
              horizontal={true}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleShare(item.uid)}>
                  <Image source={{ uri: item.userData.image }} style={styles.shareProfilePicture} />
                  <Text style={styles.shareUsername}>{item.userData.username}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </Fragment>
    </SafeAreaView>
    );
  };
  

// Styles for PostCard component
const styles = StyleSheet.create({
  dateText: {
    position: 'absolute',
    top: 5,
    right: 10,
    fontSize: FONT.small,
    fontFamily: FONT.bold,
    color: COLORS.black,
  },
    postCard: {
        backgroundColor: COLORS.lightWhite,
        borderRadius: 10,
        margin: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    postInfo: {
        marginLeft: 10,
    },
    username: {
        fontSize: SIZES.medium,
        fontFamily: FONT.bold,
        color: COLORS.black,
    },
    location: {
        fontSize: SIZES.small,
        color: COLORS.gray,
    },
    closeButton: {
      alignItems: 'flex-end',
    },
    postDescription: {
        fontSize: SIZES.medium,
        color: COLORS.black,
        marginTop: 10,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
    },
    commentModal: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: '100%',
    marginBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 5,
  },
  postButton: {
    marginLeft: 10,
    color: COLORS.primary,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentProfilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentContent: {
    marginLeft: 5, // Add some margin to separate from the profile picture
  },
  commentUsername: {
    fontWeight: 'bold',
  },
  commentText: {
    marginLeft: 10,
  },
  commentTimestamp: {
    fontSize: 12, // You can adjust the size and color as needed
    color: COLORS.gray,
  },
  shareModal: {
    flex: 0.2, // You can adjust this flex value as needed
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  shareProfilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  shareUsername: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.gray,
  },
  
});

export default PostCard;
