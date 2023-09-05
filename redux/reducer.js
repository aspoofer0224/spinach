import { SET_USER_DATA, CLEAR_USER_DATA, SET_POST_DATA, UPDATE_POST_DATA, SET_USER_POSTS} from './actionTypes';

const userReducer = (state = { userData: null }, action) => {
  switch (action.type) {
    case SET_USER_DATA:
      return { ...state, userData: action.payload };
    case CLEAR_USER_DATA:
      return { ...state, userData: null };
    default:
      return state;
  }
};

const initialState = {
  posts: [],
  userPosts: [],
  chatHeader: null,
};

const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_POST_DATA:
      return { ...state, posts: action.payload };
    case SET_USER_POSTS:
      return { ...state, userPosts: action.payload };
    case UPDATE_POST_DATA: // Handle the new action for updating a post
      const { postId, updatedData } = action.payload;
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, ...updatedData } : post
        ),
      };
    default:
      return state;
  }
};

export { userReducer, postReducer };
