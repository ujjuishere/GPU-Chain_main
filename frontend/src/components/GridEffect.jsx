import React from 'react';
import './GridEffect.css';

export default function GridEffect() {
  return (
    <div className="grid-effect-container">
      <div className="grid-effect-bg">
        {[...Array(100)].map((_, idx) => (
          <a
            key={idx}
            className="grid-effect-tile"
            href="#"
          ></a>
        ))}
      </div>
    </div>
  );
}
