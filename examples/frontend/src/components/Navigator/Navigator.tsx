import clsx from 'clsx';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import MenuIcon from '../../../assets/menu.svg';
import './style.css';

function DropdownElement({ children, className, ...props }: LinkProps) {
  return (
    <li>
      <Link
        {...props}
        className={clsx(
          'block px-4 py-2 hover:bg-gray-100 text-black no-underline',
          className
        )}
      >
        {children}
      </Link>
    </li>
  );
}

export function Navigator() {
  return (
    <div className="top-4 left-4 fixed">
      <div className="relative navigation-dropdown">
        <button
          className="hover:bg-gray-100 text-white p-3 rounded"
          type="button"
        >
          <img src={MenuIcon} width={24} height={24} alt="Dropdown Opener" />
        </button>
        <nav
          className={clsx(
            'navigation-dropdown-content border-2 bg-white invisible border-gray-800 rounded',
            'w-70 absolute left-0 top-full transition-all opacity-0 mt-2 z-10'
          )}
        >
          <ul className="py-1">
            <DropdownElement to="/simple">Simple</DropdownElement>
            <DropdownElement to="/remote-cursors-overlay">
              Remote cursors (overlay)
            </DropdownElement>
            <DropdownElement to="/remote-cursors-decoration">
              Remote cursors (decorations)
            </DropdownElement>
          </ul>
        </nav>
      </div>
    </div>
  );
}
