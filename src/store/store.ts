import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { exampleApi } from "../../test/exampleApi";
// import { mutationListenerMiddleware } from "./generated/mutationListeners";

import { useDispatch, useSelector } from "react-redux";
import { wrapApiReducer } from "./generated/utils";
import { setupMutationListeners } from "./generated/exampleApi";

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    [exampleApi.reducerPath]: wrapApiReducer(exampleApi.reducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(listenerMiddleware.middleware)
      .concat(exampleApi.middleware),
});

setupMutationListeners(listenerMiddleware, exampleApi);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
