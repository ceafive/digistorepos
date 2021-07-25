import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openSidebarSecondpane: false,
  secondPaneOpenPathname: "sell",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    onAppLogout() {
      return initialState;
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

export const { setSidebarSecondPaneOpen, setSecondPaneOpenPath, onAppLogout } = appSlice.actions;
export default appSlice.reducer;
