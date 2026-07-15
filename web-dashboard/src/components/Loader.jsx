// src/components/Loader.jsx
import React from 'react';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const sizeMap = {
    small: '24px',
    medium: '48px',
    large: '64px'
  };

  const spinnerSize = sizeMap[size] || '48px';

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 9999
      }}>
        <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }}></div>
    </div>
  );
};

export default Loader;