import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function RotatingShield() {
  const meshRef = useRef();
  const ringRef = useRef();
  const outerRingRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.4;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * 0.25;
      outerRingRef.current.rotation.y -= delta * 0.25;
    }
  });

  return (
    <group>
      {/* Central Organic AI Core */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere ref={meshRef} args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color="#2563eb"
            attach="material"
            distort={0.4}
            speed={3}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
          />
        </Sphere>
      </Float>

      {/* Inner Telemetry Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.8, 0.04, 16, 100]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.9} emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>

      {/* Outer Medical Shield Orbit Ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.4, 0.03, 16, 100]} />
        <meshStandardMaterial color="#0d9488" roughness={0.2} metalness={0.8} emissive="#0d9488" emissiveIntensity={0.4} />
      </mesh>

      {/* Floating Data Nodes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const theta = (i / 8) * Math.PI * 2;
        const x = Math.cos(theta) * 2.8;
        const z = Math.sin(theta) * 2.8;
        return (
          <mesh key={i} position={[x, Math.sin(i) * 0.8, z]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function MedicalShield3D() {
  return (
    <div style={{ width: '100%', height: '460px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#06b6d4" />
        <RotatingShield />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}
