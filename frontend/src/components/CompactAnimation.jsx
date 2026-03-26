import React, { useEffect, useRef, useState } from 'react';
import '../styles/CompactAnimation.css';

export default function CompactAnimation() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const TOTAL_BLOCKS = 50;
  const DELAY_MS = 1250;
  const DURATION_MS = 6000;

  const letters = [
    { name: 'G', angleMultiplier: 147, blocks: 11 },
    { name: 'P', angleMultiplier: -147, blocks: 11 },
    { name: 'U', angleMultiplier: 147, blocks: 10 }
  ];

  let globalBlockIndex = 0;

  return (
    <section className="w-full py-20 flex items-center justify-center" ref={containerRef}>
      <div className={`compact-animation-container ${isVisible ? 'active' : ''}`}>
        <div className="compact-ready">
          {letters.map((letter) => {
            const letterBlocks = [];
            
            for (let n = 0; n < letter.blocks; n++) {
              const index = globalBlockIndex;
              const angle = (letter.angleMultiplier * globalBlockIndex) % 360;
              const sign = globalBlockIndex % 2 ? 1 : -1;
              const gridArea = `a${n + 1}`;

              letterBlocks.push({
                index,
                angle,
                sign,
                gridArea
              });
              
              globalBlockIndex++;
            }

            return (
              <div
                key={letter.name}
                className={`compact-letter ${letter.name}`}
              >
                {letterBlocks.map((block) => (
                  <div
                    key={block.index}
                    className="compact-block"
                    style={{
                      '--index': block.index,
                      '--angle': block.angle,
                      '--sign': block.sign,
                      gridArea: block.gridArea
                    }}
                  >
                    <div className="compact-face compact-face-1"></div>
                    <div className="compact-face compact-face-2"></div>
                    <div className="compact-face compact-face-3"></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
