import { createSlice } from '@reduxjs/toolkit';

const user  = JSON.parse(localStorage.getItem('user'))  || null;
const token = localStorage.getItem('token') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    token,
    isLoggedIn: !!token,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user      = action.payload.user;
      state.token     = action.payload.token;
      state.isLoggedIn = true;
      localStorage.setItem('user',  JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user       = null;
      state.token      = null;
      state.isLoggedIn = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;