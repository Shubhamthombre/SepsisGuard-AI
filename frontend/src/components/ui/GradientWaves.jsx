import { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

export default function GradientWaves() {
  const ctnRef = useRef(null);

  useEffect(() => {
    const container = ctnRef.current;
    if (!container) return;

    let renderer, camera, scene, mesh, animationFrameId;
    try {
      renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 2) });
      const gl = renderer.gl;
      container.appendChild(gl.canvas);

      camera = new Camera(gl, { fov: 45 });
      camera.position.set(0, 0, 5);

      scene = new window.Object3D ? new window.Object3D() : {}; // OGL group/scene

      // Create a full screen plane
      const geometry = new Geometry(gl, {
        position: { size: 3, data: new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
      });

      const vertex = `
        attribute vec2 uv;
        attribute vec3 position;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragment = `
        precision highp float;
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        void main() {
          vec2 st = gl_FragCoord.xy / uResolution.xy;
          vec2 p = vUv * 2.0 - 1.0;
          
          float wave1 = sin(p.x * 2.5 + uTime * 0.6) * cos(p.y * 2.0 + uTime * 0.4);
          float wave2 = sin(p.x * 3.5 - uTime * 0.5) * sin(p.y * 3.0 + uTime * 0.7);
          float combined = (wave1 + wave2) * 0.5;

          vec3 colorNavy = vec3(0.04, 0.08, 0.18);
          vec3 colorBlue = vec3(0.09, 0.38, 0.92);
          vec3 colorCyan = vec3(0.02, 0.71, 0.83);
          vec3 colorTeal = vec3(0.05, 0.58, 0.53);
          vec3 colorViolet = vec3(0.31, 0.27, 0.90);

          vec3 col = mix(colorNavy, colorBlue, smoothstep(-1.0, 0.2, combined));
          col = mix(col, colorCyan, sin(vUv.x * 3.14 + uTime * 0.3) * 0.5 + 0.5);
          col = mix(col, colorTeal, cos(vUv.y * 3.14 - uTime * 0.2) * 0.5 + 0.5);
          col = mix(col, colorViolet, 0.2 * abs(combined));

          // Vignette & lighting gradient
          col *= (1.0 - 0.25 * length(p));

          gl_FragColor = vec4(col, 0.85);
        }
      `;

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [window.innerWidth, window.innerHeight] }
        }
      });

      mesh = new Mesh(gl, { geometry, program });

      function resize() {
        if (!container) return;
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        program.uniforms.uResolution.value = [container.offsetWidth, container.offsetHeight];
      }
      window.addEventListener('resize', resize);
      resize();

      let lastTime = 0;
      function update(t) {
        animationFrameId = requestAnimationFrame(update);
        const time = t * 0.001;
        program.uniforms.uTime.value = time;
        renderer.render({ scene: mesh, camera });
      }
      animationFrameId = requestAnimationFrame(update);

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
        if (gl && gl.canvas && gl.canvas.parentNode) {
          gl.canvas.parentNode.removeChild(gl.canvas);
        }
      };
    } catch (err) {
      console.error('GradientWaves OGL Error:', err);
    }
  }, []);

  return (
    <div 
      ref={ctnRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, #070b19 0%, #0b132b 50%, #1c2541 100%)',
        overflow: 'hidden'
      }}
    />
  );
}
