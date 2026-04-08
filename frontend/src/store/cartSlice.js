import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:      [],
    restaurant: null,
    totalItems: 0,
    totalPrice: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const item   = action.payload;
      const exists = state.items.find(i => i._id === item._id);
      if (exists) {
        exists.qty += 1;
      } else {
        state.items.push({ ...item, qty: 1 });
      }
      state.totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
      state.totalPrice = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },
    removeFromCart: (state, action) => {
      const id     = action.payload;
      const exists = state.items.find(i => i._id === id);
      if (exists && exists.qty > 1) {
        exists.qty -= 1;
      } else {
        state.items = state.items.filter(i => i._id !== id);
      }
      state.totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
      state.totalPrice = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },
    setRestaurant: (state, action) => {
      state.restaurant = action.payload;
    },
    clearCart: (state) => {
      state.items      = [];
      state.restaurant = null;
      state.totalItems = 0;
      state.totalPrice = 0;
    },
    increaseQty: (state, action) => {
      const item = state.items.find(i => i._id === action.payload);
      if (item) item.qty += 1;
      state.totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
      state.totalPrice = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },
    decreaseQty: (state, action) => {
      const item = state.items.find(i => i._id === action.payload);
      if (item) {
        if (item.qty === 1) {
          state.items = state.items.filter(i => i._id !== action.payload);
        } else {
          item.qty -= 1;
        }
      }
      state.totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
      state.totalPrice = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  setRestaurant,
  clearCart,
  increaseQty,
  decreaseQty,
} = cartSlice.actions;

export default cartSlice.reducer;