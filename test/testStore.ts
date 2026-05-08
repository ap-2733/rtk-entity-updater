import { configureStore } from "@reduxjs/toolkit";
import { exampleApi } from "./exampleApi";

export function createTestStore() {
  return configureStore({
    reducer: {
      [exampleApi.reducerPath]: exampleApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().concat(exampleApi.middleware);
    },
  });
}
