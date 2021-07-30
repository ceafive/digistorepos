import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openSidebarSecondpane: false,
  secondPaneOpenPathname: "sell",
  currentUser: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    onAppLogout() {
      return initialState;
    },
    setCurrentUser(state, action) {
      state.currentUser = action.payload;
    },
    setSidebarSecondPaneOpen(state, action) {
      // state.openSidebarSecondpane = !state.openSidebarSecondpane;
      state.openSidebarSecondpane = action.payload;
    },
    setSecondPaneOpenPath(state, action) {
      state.secondPaneOpenPathname = action.payload.name;
    },
  },
});

export const { setSidebarSecondPaneOpen, setSecondPaneOpenPath, onAppLogout, setCurrentUser } = appSlice.actions;
export default appSlice.reducer;
