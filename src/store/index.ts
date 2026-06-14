import { configureStore } from "@reduxjs/toolkit";
import draftPage from "./draftPageSlice";
import ui from "./uiSlice";
import publish from "./publishSlice";

export const makeStore = () =>
  configureStore({
    reducer: { draftPage, ui, publish },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];