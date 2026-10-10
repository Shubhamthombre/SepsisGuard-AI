import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LandingVisual = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.width = 450;
    let height = canvas.height = 450;

    // Neural nodes
    const nodes = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 3 + 2,
    }));

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw glowing background orb
      const gradient = ctx.createRadialGradient(width/2, height/2, 20, width/2, height/2, 200);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw rotating medical shield rings
      ctx.save();
      ctx.translate(width/2, height/2);
      ctx.rotate(angle);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 15]);
      ctx.beginPath();
      ctx.arc(0, 0, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(-angle * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Update & draw neural nodes and connections
      ctx.fillStyle = '#2563eb';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - node.x;
          const dy = nodes[j].y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      });

      angle += 0.005;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '450px', height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 20px 30px rgba(37,99,235,0.15))' }} />
      <motion.div 
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
          bottom: '20px',
          left: '20px'
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>AI Neural Engine</span>
        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-blue)' }}>PhysioNet 2019 Active</span>
      </motion.div>
    </div>
  );
};

export default LandingVisual;
