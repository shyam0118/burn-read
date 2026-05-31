'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  extraScale?: number;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = 'var(--color-accent)',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  extraScale = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const resolvedColorRef = useRef<string>('#38bdf8');

  // Resolve color once and on theme changes/resize
  const resolveColor = useCallback(() => {
    if (sparkColor.startsWith('var')) {
      const prop = sparkColor.replace('var(', '').replace(')', '').trim();
      const val = getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
      if (val) resolvedColorRef.current = val;
    } else {
      resolvedColorRef.current = sparkColor;
    }
  }, [sparkColor]);

  const draw = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out

        const distance = easedProgress * sparkRadius * extraScale * dpr;
        const lineLength = sparkSize * (1 - easedProgress) * dpr;

        const x1 = spark.x * dpr + Math.cos(spark.angle) * distance;
        const y1 = spark.y * dpr + Math.sin(spark.angle) * distance;
        const x2 = spark.x * dpr + Math.cos(spark.angle) * (distance + lineLength);
        const y2 = spark.y * dpr + Math.sin(spark.angle) * (distance + lineLength);

        ctx.beginPath();
        ctx.strokeStyle = resolvedColorRef.current;
        ctx.lineWidth = 2 * dpr;
        ctx.lineCap = 'round';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return progress < 1;
      });
    },
    [sparkSize, sparkRadius, duration, extraScale]
  );

  useEffect(() => {
    let animationId: number;
    
    const animate = (timestamp: number) => {
      draw(timestamp);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  const handleResize = useCallback(() => {
    if (canvasRef.current) {
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      canvasRef.current.style.width = `${window.innerWidth}px`;
      canvasRef.current.style.height = `${window.innerHeight}px`;
      resolveColor();
    }
  }, [resolveColor]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleGlobalClick = (e: MouseEvent) => {
      const now = performance.now();
      const newSparks: Spark[] = [];

      for (let i = 0; i < sparkCount; i++) {
        newSparks.push({
          x: e.clientX,
          y: e.clientY,
          angle: (i / sparkCount) * Math.PI * 2,
          startTime: now,
        });
      }

      sparksRef.current.push(...newSparks);
    };

    // Use both click and pointerdown for better mobile/prod support
    window.addEventListener('pointerdown', handleGlobalClick, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleGlobalClick, true);
    };
  }, [handleResize, sparkCount]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
    />
  );
};

export default ClickSpark;
