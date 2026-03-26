import React from 'react';
import '../styles/LoadingAnimation.css';

export default function LoadingAnimation() {
  const letters = [
    {
      name: 'R',
      count: 11,
      angleMultiplier: 147,
      areas: "a1 a6 a8 / a2 . a9 / a3 a7 . / a4 . a10 / a5 . a11"
    },
    {
      name: 'E',
      count: 11,
      angleMultiplier: -147,
      areas: "a1 a6 a9 / a2 . . / a3 a7 a10 / a4 . . / a5 a8 a11"
    },
    {
      name: 'A',
      count: 10,
      angleMultiplier: 147,
      areas: ". a1 . / a2 . a7 / a3 . a8 / a4 a6 a9 / a5 . a10"
    },
    {
      name: 'D',
      count: 11,
      angleMultiplier: -147,
      areas: "a1 a6 a8 / a2 . a9 / a3 . a10 / a4 . a11 / a5 a7 ."
    },
    {
      name: 'Y',
      count: 8,
      angleMultiplier: 147,
      areas: "a1 . a6 / a2 . a7 / a3 . a8 / . a4 . / . a5 ."
    }
  ];

  let globalBlockIndex = 0;

  return (
    <div className="loading-container">
      <div className="ready">
        {letters.map((letter) => {
          const letterStartIndex = globalBlockIndex;
          const blocks = [];

          for (let i = 0; i < letter.count; i++) {
            const angle = (letter.angleMultiplier * globalBlockIndex) % 360;
            const sign = globalBlockIndex % 2 ? 1 : -1;
            
            blocks.push({
              index: globalBlockIndex,
              angle,
              sign,
              gridArea: `a${i + 1}`
            });
            
            globalBlockIndex++;
          }

          return (
            <div
              key={letter.name}
              className={`letter ${letter.name}`}
              style={{ gridTemplateAreas: letter.areas }}
            >
              {blocks.map((block) => (
                <div
                  key={block.index}
                  className="block"
                  style={{
                    '--index': block.index,
                    '--angle': block.angle,
                    '--sign': block.sign,
                    gridArea: block.gridArea
                  }}
                >
                  <div className="face face-1"></div>
                  <div className="face face-2"></div>
                  <div className="face face-3"></div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
