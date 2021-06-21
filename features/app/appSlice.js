import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openSidebarSecondpane: true,
  secondPaneOpenPathname: "home",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSidebarSecondPaneOpen(state, action) {
      state.openSidebarSecondpane = action.payload;
    },
    setSecondPaneOpenPath(state, action) {
      state.secondPaneOpenPathname = action.payload.name;
    },
  },
});

export const { setSidebarSecondPaneOpen, setSecondPaneOpenPath } = appSlice.actions;
export default appSlice.reducer;
