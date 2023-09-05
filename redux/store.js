// store.js
import { combineReducers} from 'redux';
import { userReducer, postReducer } from './reducer'; // Import both reducers
import {configureStore} from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  user: userReducer, // Include the userReducer
  posts: postReducer, // Include the postReducer
});

const store = configureStore({
    reducer:rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false
    }),
})
export default store;
