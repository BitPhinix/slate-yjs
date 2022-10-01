import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'virtual:windi.css';
import 'virtual:windi-devtools';
import { Navigator } from './components/Navigator/Navigator';
import { NotFound } from './pages/NotFound';
import { RemoteCursorsOverlayPage } from './pages/RemoteCursorOverlay';
import { SimplePage } from './pages/Simple';
import { RemoteCursorDecorations } from './pages/RemoteCursorDecorations';

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/remote-cursors-overlay"
          element={<RemoteCursorsOverlayPage />}
        />
        <Route
          path="/remote-cursors-decoration"
          element={<RemoteCursorDecorations />}
        />
        <Route path="/simple" element={<SimplePage />} />
        <Route path="/" element={<Navigate to="/remote-cursors-overlay" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Navigator />
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
