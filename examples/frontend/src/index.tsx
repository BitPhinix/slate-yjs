import React from 'react';
import ReactDOM from 'react-dom';
import '../index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotFound } from './pages/NotFound';
import { Navigator } from './components/Navigator/Navigator';
import { Simple } from './pages/Simple';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Simple />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Navigator />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
