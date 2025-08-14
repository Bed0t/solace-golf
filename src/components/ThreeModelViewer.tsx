"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

interface RotatingModelProps {
  url?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  scale?: number;
}

function Model({ url, autoRotate, rotationSpeed, scale }: RotatingModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      url || "/models/SS-001.glb",
      (loadedGltf) => {
        // Replace all mesh materials with a uniform wireframe material
        loadedGltf.scene.traverse((object: THREE.Object3D) => {
          if (object instanceof THREE.Mesh) {
            const mesh = object as THREE.Mesh;

            const replaceWithWireframe = (material?: THREE.Material | null): THREE.Material => {
              if (material) {
                material.dispose();
              }
              return new THREE.MeshBasicMaterial({
                color: 0x202020,
                wireframe: true,
              });
            };

            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map((m) => replaceWithWireframe(m));
            } else {
              mesh.material = replaceWithWireframe(mesh.material as THREE.Material | null | undefined);
            }
          }
        });
        setGltf(loadedGltf);
        setError(null);
      },
      undefined,
      (err) => {
        console.error("Error loading GLB:", err);
        setError("Failed to load 3D model");
      }
    );
  }, [url]);

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * (rotationSpeed || 1);
    }
  });
  if (!gltf) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    );
  }
  return (
    <group ref={meshRef} scale={scale || 1.2}>
      <primitive object={gltf.scene} />
    </group>
  );
}

interface RotatingGLBProps {
  modelUrl?: string;
  width?: string;
  height?: string;
  backgroundColor?: string;
}

export default function ThreeModelViewer({
  modelUrl = "/models/SS-001.glb",
  width = "75%",
  height = "-5",
  backgroundColor = "bg-transparent",
}: RotatingGLBProps) {
  // Fixed, subtle auto-rotation and fixed scale for a small floating icon
  const isRotating = true;
  const rotationSpeed = 0.5;
  const modelScale = .8;

  return (
    <div className="w-full mx-auto" style={{ width }}>
      <div className={`${backgroundColor} `} style={{ width, height }}>
        <Canvas camera={{ position: [10, 1, 10], fov:10 }} style={{ width: "100%", height: "200%", pointerEvents: "none" }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[1, 100, 5]} intensity={5} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <Model url={modelUrl} autoRotate={isRotating} rotationSpeed={rotationSpeed} scale={modelScale} />
        </Canvas>
      </div>
    </div>
  );
}


