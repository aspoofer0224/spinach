import { SET_USER_DATA, CLEAR_USER_DATA, SET_POST_DATA, SET_USER_POSTS, UPDATE_POST_DATA } from './actionTypes';

export const setUserData = (userData) => ({
  type: SET_USER_DATA,
  payload: userData,
});


export const clearUserData = () => ({
  type: CLEAR_USER_DATA,
});

export const setPostData = (posts) => ({
  type: SET_POST_DATA,
  payload: posts,
});

export const setUserPosts = (userPosts) => ({
  type: SET_USER_POSTS,
  payload: userPosts,
});

export const updatePost = (postId, updatedData) => ({ // New action creator for updating a post
  type: UPDATE_POST_DATA,
  payload: { postId, updatedData },
});
