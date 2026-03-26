import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import MainLayout from './components/MainLayout';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Custom cursor logic
  useEffect(() => {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    const handleMouseMove = (e) => {
      cursor.style.top = (e.clientY - 10) + 'px';
      cursor.style.left = (e.clientX - 10) + 'px';
    };

    const handleClick = () => {
      cursor.classList.add('expand');
      setTimeout(() => {
        cursor.classList.remove('expand');
      }, 500);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleLogin = (userId) => {
    setCurrentUser(userId);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <>
      {/* Custom Cursor Element */}
      <div className="cursor"></div>
      
      {!isAuthenticated ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <MainLayout currentUser={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}