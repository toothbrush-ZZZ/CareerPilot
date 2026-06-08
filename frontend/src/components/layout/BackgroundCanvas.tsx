'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

const WORD_POOL = [
  'offer received','senior engineer','technical screen','resume updated',
  'system design','follow up sent','coding round','negotiating',
  'linkedin outreach','rejected','take home task','final round',
  'referral applied','salary range','culture fit','onsite interview',
  'stock options','cold applied','panel interview','background check',
  'acceptance letter','portfolio reviewed','notice period','counteroffer',
  'signing bonus','dream job','ghosted','applied × 47',
  'streak: 12 days','mission: active','pipeline: 6','final offer'
];

function getRandomWord() {
  return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
}

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const NUM_COLS = 12;
    const STRINGS_PER_COL = 4;
    const VERTICAL_SPACING = 150;

    interface ColumnString {
      text: string;
      y: number;
      baseOpacity: number;
    }

    interface Column {
      x: number;
      speed: number;
      strings: ColumnString[];
    }

    let columns: Column[] = [];

    const initColumns = () => {
      columns = [];
      const colWidth = width / NUM_COLS;
      for (let i = 0; i < NUM_COLS; i++) {
        const jitterX = (Math.random() * 50) - 25; // ±25px
        const x = colWidth * i + colWidth / 2 + jitterX;
        const speed = (0.3 + Math.random() * 0.3);

        const strings: ColumnString[] = [];
        for (let j = 0; j < STRINGS_PER_COL; j++) {
          strings.push({
            text: getRandomWord(),
            y: (height / STRINGS_PER_COL) * j + (Math.random() * VERTICAL_SPACING),
            baseOpacity: 0.03 + Math.random() * 0.04, // 0.03-0.07
          });
        }

        columns.push({ x, speed, strings });
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initColumns();
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.font = '11px "JetBrains Mono", "Fira Code", monospace';
      ctx.textAlign = 'left';

      columns.forEach(col => {
        col.strings.forEach(str => {
          str.y -= col.speed;

          if (str.y < -30) {
            str.y = height + Math.random() * 80;
            str.text = getRandomWord();
            str.baseOpacity = 0.03 + Math.random() * 0.04;
          }

          const t = str.y / height;
          const fade = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
          const opacity = str.baseOpacity * fade;

          const isLight = resolvedTheme === 'light';
          const rgb = isLight ? '0, 0, 0' : '255, 255, 255';
          ctx.fillStyle = `rgba(${rgb}, ${Math.max(0, opacity)})`;
          ctx.fillText(str.text, col.x, str.y);
        });
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
