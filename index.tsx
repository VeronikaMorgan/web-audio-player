import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./src/components/app/App";
import { store } from './src/services/store';
import { Provider } from 'react-redux';

const rootAr = document.getElementById("form-container") as HTMLDivElement
const root = ReactDOM.createRoot(rootAr) as ReactDOM.Root;

root.render(
  <Provider store={store}>
      <App />
  </Provider>
);
