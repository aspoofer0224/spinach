import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, RefreshControlBase } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FIRESTORE_DB,FIREBASE_AUTH } from '../../firebase_config';
import moment from 'moment';
import { COLORS, FONT, SIZES } from '../../constants/theme';
import { doc, updateDoc,getDoc,Timestamp } from 'firebase/firestore';
import { useSelector } from 'react-redux'; // Import useSelector
import {LinearGradient} from 'expo-linear-gradient';

export default function UserPostScreen({ route}) {
    const userData = useSelector((state) => state.user.userData);
    const { post: initialPost } = route.params;
    const userId = FIREBASE_AUTH.currentUser.uid;
    const [newComment, setNewComment] = useState('');
    const [postState, setPostState] = useState(initialPost);

    useEffect(() => {
       setPostState(initialPost);
    }, [initialPost]);



    const isLiked = postState?.likedBy.includes(userId);
    const postDate = postState?.timestamp instanceof Timestamp ? postState.timestamp.toDate() : new Date(postState?.timestamp);
    const formattedDate = moment(postDate).fromNow();

    

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
  
      // Update local state
    setPostState((prevPostState) => ({
    ...prevPostState,
    likes: newLikes,
    likedBy: newLikedBy,
    }));
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
    };
  
    // Create a new comments array with the existing comments and the new comment
    const newComments = [...(postData.comments || []), commentData];
  
    // Update the post document with the new comments array
    await updateDoc(postRef, {
        comments: newComments,
      });
  
    setPostState((prevPostState) => {
    const updatedState = {
        ...prevPostState,
        comments: newComments,
    };
    return updatedState;
    });
       // Clear the comment input
  };


  return (
    <LinearGradient colors={['#EDF9EB','#9ee2d7','#9ee2d7']} style={styles.container}>
      <SafeAreaView style={{ flex: 1}}>
        <ScrollView>
          <View style={styles.header}>
            <Image source={{ uri: postState?.profilePicture }} style={styles.profileImage} />
            <View style={styles.headerContent}>
              <Text style={styles.username}>{postState?.username}</Text>
              <Text style={styles.location}>{postState?.location}</Text>
            </View>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
              <Text style={[styles.description, { flex: 0.9 }]}>
                {postState?.description}
              </Text>
          </View>
          <Image source={{ uri: postState?.postImage }} style={styles.postImage} />
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleLike(postState?.id)}>
              <Icon name="thumbs-up" size={20} color={isLiked ? COLORS.green : COLORS.gray} />
              <Text>{postState?.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity >
              <Icon name="comment-o" size={20} color={COLORS.gray} />
              <Text>{postState?.comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onShare(postState)}>
              <Icon name="share" size={20} color={COLORS.gray} />
              <Text>{postState?.shares}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.comments}>
              {Array.isArray(postState?.comments) && postState.comments.map((comment, index) => {
                  //const commentTimestamp = comment.timestamp?.toDate();
                  //const commentTimeAgo = moment(commentTimestamp).fromNow(); // "2 hours ago"
                  const commentTimestamp = comment.timestamp instanceof Timestamp 
                      ? comment.timestamp.toDate() 
                      : new Date(comment.timestamp);

                  const commentTimeAgo = moment(commentTimestamp).fromNow();

                  return (
                  <View key={index} style={styles.comment}>
                      <Image source={{ uri: comment.userProfilePicture }} style={styles.commentProfilePicture} />
                      <View style={{ marginLeft: 10 }}>
                      <Text style={styles.commentUsername}>{comment.username}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentTimestamp}>{commentTimeAgo}</Text> 
                      </View>
                  </View>
                  );
              })}
          </View>
        </ScrollView>
        <View style={styles.inputSection}>
          <TextInput
            placeholder="Add a comment..."
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity onPress={() => handleComment(postState.id)}>
            <Text style={styles.postButton}>Post</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    marginTop:10,
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between', // Align items with space between
  },
  headerContent: {
    flexDirection: 'column', // Change to column for vertical alignment
  },
  description: {
    padding: 10, 
    fontSize: FONT.medium,
    fontFamily: FONT.regular,
    color: COLORS.black,
  },
  actions: {
    flexDirection: 'row', // Align buttons in the same row
    justifyContent: 'space-around', // Add space around the buttons
    paddingVertical: 10, // Add vertical padding to separate the actions from the image
  },
  actionButton: {
    flexDirection: 'row', // Align Icon and Text horizontally
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  dateText: {
    position: 'absolute',
    top: 20,
    right: 10,
    fontSize: FONT.small,
    fontFamily: FONT.bold,
    color: COLORS.black,
  },
  username: {
    top:10,
    right:310,
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
  },
  comments: {
    padding: 10,
  },
  comment: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center align vertically
    marginBottom: 5,
  },
  commentProfilePicture: {
    width: 30, // Set your desired size
    height: 30,
    borderRadius: 15, // To make it circular
    marginRight: 10, // Add some margin to separate from the text
  },
  commentText: {
    fontSize: 14,
  },
  commentTimestamp: {
    fontSize: FONT.small,
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  commentUsername: {
    fontWeight: 'bold',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 0.95,  // Adjust this value
    marginBottom:7,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    padding: 5,
  },
  postButton: {
    marginLeft: 10,
    color: COLORS.primary,
  },
});
