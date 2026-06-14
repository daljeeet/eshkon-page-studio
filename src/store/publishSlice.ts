import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PublishStatus = "idle" | "diffing" | "publishing" | "done" | "error";

interface PublishState {
  status: PublishStatus;
  version: string | null;
  bump: string | null;
  changelog: string | null;
  error: string | null;
}
const initialState: PublishState = {
  status: "idle",
  version: null,
  bump: null,
  changelog: null,
  error: null,
};

const publishSlice = createSlice({
  name: "publish",
  initialState,
  reducers: {
    publishStarted(state) {
      state.status = "publishing";
      state.error = null;
    },
    publishSucceeded(
      state,
      action: PayloadAction<{ version: string; bump: string; changelog: string }>
    ) {
      state.status = "done";
      state.version = action.payload.version;
      state.bump = action.payload.bump;
      state.changelog = action.payload.changelog;
    },
    publishFailed(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    resetPublish(state) {
      state.status = "idle";
      state.error = null;
    },
  },
});

export const { publishStarted, publishSucceeded, publishFailed, resetPublish } =
  publishSlice.actions;
export default publishSlice.reducer;