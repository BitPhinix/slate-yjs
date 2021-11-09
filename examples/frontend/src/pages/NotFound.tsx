import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-400">Oh no, we can't find this page.</p>
      <Link to="/" className="ml-1">
        → Go back
      </Link>
    </div>
  );
}
