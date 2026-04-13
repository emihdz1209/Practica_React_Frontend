import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import ReactQueryProvider from './app/providers/ReactQueryProvider';
import { AuthProvider } from './features/auth/context/AuthContext';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <ReactQueryProvider>
        <App />
      </ReactQueryProvider>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
