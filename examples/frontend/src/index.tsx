import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import '../index.css';
import { Navigator } from './components/Navigator/Navigator';
import { NotFound } from './pages/NotFound';
import { RemoteCursorsOverlay } from './pages/RemoteCursorOverlay/RemoteCursorOverlay';
import { Simple } from './pages/Simple';

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/remote-cursors-overlay"
          element={<RemoteCursorsOverlay />}
        />
        <Route path="/simple" element={<Simple />} />
        <Route path="/" element={<Navigate to="/remote-cursors-overlay" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Navigator />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
