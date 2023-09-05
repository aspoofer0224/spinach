import React,{useState} from 'react';
//import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TouchableOpacity,SafeAreaView,ScrollView,TextInput,Modal} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Make sure to install this package
import { COLORS, FONT, SIZES } from '../../constants/theme';
import { FIRESTORE_DB,FIREBASE_AUTH  } from '../../firebase_config';
import { doc, updateDoc, deleteDoc,getDoc,Timestamp,increment} from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux'; // Import useSelector
import { updatePost } from '../../redux/action';
import moment from 'moment';
import {LinearGradient} from 'expo-linear-gradient';


export default function PostScreen({ route,navigation}) {
    const { post } = route.params; // Get post object from params
    const selectedPost = useSelector((state) => state.posts.userPosts.find((p) => p.id === post.id)); // Fetch post data from Redux store
    const dispatch = useDispatch();
    const userId = FIREBASE_AUTH.currentUser.uid;
    const isLiked = selectedPost?.likedBy.includes(userId); // Use selectedPost instead of post
    const postDate = selectedPost?.timestamp instanceof Timestamp ? selectedPost.timestamp.toDate() : new Date(selectedPost?.timestamp);
    const formattedDate = moment(postDate).fromNow();
    const [newComment, setNewComment] = useState('');
    const userData = useSelector((state) => state.user.userData);
    const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
    const [editableDescription, setEditableDescription] = useState(selectedPost?.description);
    const [isEditingDescription, setIsEditingDescription] = useState(false);




  const handleEditDescription = () => {
    setIsEditingDescription(true);  // Enable editing mode
    setOptionsModalVisible(false);  // Close the options modal
  };
    

  const updateDescriptionInFirebase = async () => {
    const postRef = doc(FIRESTORE_DB, 'posts', selectedPost?.id);
    await updateDoc(postRef, {
      description: editableDescription,
    });
    
  };

  const decrementUserPostCount = async (uid) => {
    const userRef = doc(FIRESTORE_DB, 'users', uid);
    await updateDoc(userRef, {
      posts: increment(-1),
    });
  };
  

  const handleDeletePost = async () => {
    const postRef = doc(FIRESTORE_DB, 'posts', selectedPost?.id);
    await deleteDoc(postRef);
    console.log(userId);
    await decrementUserPostCount(userId);
    setOptionsModalVisible(false);
    navigation.goBack();
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
    dispatch(updatePost(postId, { likes: newLikes, likedBy: newLikedBy }));
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
    const newComments = [...postData.comments, commentData];
  
    // Update the post document with the new comments array
    await updateDoc(postRef, {
      comments: newComments,
    });
  
    setNewComment(''); // Clear the comment input
  };

  // Function to handle the options button click (e.g., edit or delete post)
  const handleOptionsButtonClick = () => {
    // Add logic to handle the options button click, such as displaying a menu
  };

  return (
    <LinearGradient colors={['#EDF9EB','#9ee2d7','#9ee2d7']} style={styles.container}>
      <SafeAreaView style={{ flex: 1}}>
        <ScrollView>
          <View style={styles.header}>
              <Image source={{ uri: selectedPost?.profilePicture }} style={styles.profileImage} />
              <View style={styles.headerContent}>
                <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
                  {selectedPost?.username}
                </Text>
                <Text style={styles.location}>{selectedPost?.location}</Text>
              </View>
              <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
          {isEditingDescription ? (
              <>
                <TextInput
                  style={[styles.description, { flex: 0.8 }]}
                  value={editableDescription}
                  onChangeText={setEditableDescription}
                  placeholder="Write your description..."
                />
                <TouchableOpacity
                  style={{ flex: 0.1 }}
                  onPress={async () => {
                    await updateDescriptionInFirebase();
                    setIsEditingDescription(false);  // Disable editing mode
                  }}
                >
                  <Text>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.description, { flex: 0.9 }]}>
                {selectedPost?.description || <Text style={{ color: 'gray' }}>Write your description...</Text>}
              </Text>
            )}
            <TouchableOpacity onPress={() => setOptionsModalVisible(true)} style={{ flex: 0.05 }}>
              <Icon name="ellipsis-v" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: selectedPost?.postImage }} style={styles.postImage} />
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleLike(selectedPost?.id)}>
              <Icon name="thumbs-up" size={20} color={isLiked ? COLORS.green : COLORS.gray} />
              <Text>{selectedPost?.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity >
              <Icon name="comment-o" size={20} color={COLORS.gray} />
              <Text>{selectedPost?.comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onShare(selectedPost)}>
              <Icon name="share" size={20} color={COLORS.gray} />
              <Text>{selectedPost?.shares}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.comments}>
            {selectedPost?.comments.map((comment, index) => {
              const commentTimestamp = comment.timestamp?.toDate();
              const commentTimeAgo = moment(commentTimestamp).fromNow(); // "2 hours ago"

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
          <Modal
            animationType="slide"
            transparent={true}
            visible={isOptionsModalVisible}
            onRequestClose={() => setOptionsModalVisible(false)}
          >
            <View style={{ position: 'absolute', top: 100, right: 10, backgroundColor: 'white', borderRadius: 5 }}>
              <TouchableOpacity onPress={handleEditDescription}>
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeletePost()}>
                <Text>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOptionsModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
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
    marginTop: 10,
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10, 
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
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
    marginTop:10,
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
