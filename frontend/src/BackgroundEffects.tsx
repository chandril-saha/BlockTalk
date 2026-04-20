import { useEffect, useRef } from 'react';

type Point = { x: number; y: number; timestamp: number };
type Stroke = Point[];

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-dpi sizing
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let strokes: Stroke[] = [];
    let lastMoveTime = 0;

    const draw = (e: PointerEvent) => {
      const now = Date.now();
      // If the mouse was idle or just entered the window, start a new trailing stroke
      if (strokes.length === 0 || now - lastMoveTime > 200) {
        strokes.push([{ x: e.clientX, y: e.clientY, timestamp: now }]);
      } else {
        strokes[strokes.length - 1].push({ x: e.clientX, y: e.clientY, timestamp: now });
      }
      lastMoveTime = now;
    };

    const stopDraw = () => { lastMoveTime = 0; };

    // Simply attach to raw pointer movement
    window.addEventListener('pointermove', draw, { passive: true });
    window.addEventListener('pointerleave', stopDraw);
    window.addEventListener('blur', stopDraw);

    let animationFrameId: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      const FADE_DURATION = 1500; // 1.5 seconds lifespan for ink

      for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i];
        
        // Retain only points younger than the fade duration
        const validPoints = stroke.filter(p => now - p.timestamp < FADE_DURATION);
        
        if (validPoints.length < 2) {
           strokes[i] = validPoints;
           if (validPoints.length === 0) strokes.splice(i, 1);
           continue;
        }

        strokes[i] = validPoints;

        ctx.beginPath();
        ctx.moveTo(validPoints[0].x, validPoints[0].y);
        for (let j = 1; j < validPoints.length; j++) {
          ctx.lineTo(validPoints[j].x, validPoints[j].y);
        }
        
        // Bold stark black
        ctx.strokeStyle = `rgba(0, 0, 0, 1)`;
        ctx.lineWidth = 12; // Thinner marker
        ctx.lineCap = 'square'; // Hard brutalist edges instead of round!
        ctx.lineJoin = 'bevel'; // Sharp corners
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', draw);
      window.removeEventListener('pointerleave', stopDraw);
      window.removeEventListener('blur', stopDraw);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
}
