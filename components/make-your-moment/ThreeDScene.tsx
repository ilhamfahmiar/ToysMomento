"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ============================================================
// Nendoroid Fallback Figure (Three.js Primitives)
// ============================================================

interface FallbackFigureProps {
  chibiImageUrl: string;
}

function FallbackFigure({ chibiImageUrl }: FallbackFigureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [chibiTexture, setChibiTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      chibiImageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        setChibiTexture(texture);
      },
      undefined,
      (err) => {
        console.warn("Failed to load chibi texture:", err);
      },
    );
  }, [chibiImageUrl]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  const headRadius = 0.42;
  const bodyHeight = 0.55;
  const bodyRadius = 0.22;
  const legHeight = 0.28;
  const legRadius = 0.1;
  const armHeight = 0.3;
  const armRadius = 0.08;
  const footRadius = 0.13;

  const matteGray = new THREE.MeshStandardMaterial({
    color: "#e8e0d8",
    roughness: 0.85,
    metalness: 0.0,
  });

  const matteDark = new THREE.MeshStandardMaterial({
    color: "#5a4a3a",
    roughness: 0.9,
    metalness: 0.0,
  });

  const headMaterial = chibiTexture
    ? new THREE.MeshStandardMaterial({
        map: chibiTexture,
        roughness: 0.8,
        metalness: 0.0,
      })
    : new THREE.MeshStandardMaterial({
        color: "#f5d5b0",
        roughness: 0.8,
        metalness: 0.0,
      });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* HEAD */}
      <mesh position={[0, bodyHeight / 2 + headRadius * 0.85, 0]} castShadow>
        <sphereGeometry args={[headRadius, 32, 32]} />
        <primitive object={headMaterial} attach="material" />
      </mesh>

      {/* BODY */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry
          args={[bodyRadius * 0.9, bodyRadius, bodyHeight, 16]}
        />
        <primitive object={matteGray} attach="material" />
      </mesh>

      {/* LEFT ARM */}
      <mesh
        position={[-(bodyRadius + armRadius + 0.04), bodyHeight * 0.2, 0]}
        rotation={[0, 0, Math.PI / 8]}
        castShadow
      >
        <cylinderGeometry args={[armRadius * 0.8, armRadius, armHeight, 12]} />
        <primitive object={matteGray} attach="material" />
      </mesh>

      {/* RIGHT ARM */}
      <mesh
        position={[bodyRadius + armRadius + 0.04, bodyHeight * 0.2, 0]}
        rotation={[0, 0, -Math.PI / 8]}
        castShadow
      >
        <cylinderGeometry args={[armRadius * 0.8, armRadius, armHeight, 12]} />
        <primitive object={matteGray} attach="material" />
      </mesh>

      {/* LEFT LEG */}
      <mesh
        position={[-bodyRadius * 0.5, -(bodyHeight / 2 + legHeight / 2), 0]}
        castShadow
      >
        <cylinderGeometry args={[legRadius, legRadius * 1.1, legHeight, 12]} />
        <primitive object={matteDark} attach="material" />
      </mesh>

      {/* RIGHT LEG */}
      <mesh
        position={[bodyRadius * 0.5, -(bodyHeight / 2 + legHeight / 2), 0]}
        castShadow
      >
        <cylinderGeometry args={[legRadius, legRadius * 1.1, legHeight, 12]} />
        <primitive object={matteDark} attach="material" />
      </mesh>

      {/* LEFT FOOT */}
      <mesh
        position={[
          -bodyRadius * 0.5,
          -(bodyHeight / 2 + legHeight + footRadius * 0.4),
          0.06,
        ]}
        castShadow
      >
        <sphereGeometry args={[footRadius, 12, 8]} />
        <primitive object={matteDark} attach="material" />
      </mesh>

      {/* RIGHT FOOT */}
      <mesh
        position={[
          bodyRadius * 0.5,
          -(bodyHeight / 2 + legHeight + footRadius * 0.4),
          0.06,
        ]}
        castShadow
      >
        <sphereGeometry args={[footRadius, 12, 8]} />
        <primitive object={matteDark} attach="material" />
      </mesh>

      {/* 100cm LABEL */}
      <Html
        position={[headRadius + 0.15, bodyHeight / 2 + headRadius * 1.6, 0]}
        center={false}
        distanceFactor={4}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1.5px solid #1a6b3c",
            borderRadius: "6px",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#1a6b3c",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            userSelect: "none",
          }}
        >
          100cm
        </div>
      </Html>
    </group>
  );
}

// ============================================================
// GLTF Figure (loads actual model if available)
// ============================================================

interface GLTFFigureProps {
  chibiImageUrl: string;
}

function GLTFFigure({ chibiImageUrl }: GLTFFigureProps) {
  const { scene } = useGLTF("/models/nendoroid-template.glb");
  const [chibiTexture, setChibiTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      chibiImageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        setChibiTexture(texture);
      },
      undefined,
      (err) => {
        console.warn("Failed to load chibi texture for GLTF:", err);
      },
    );
  }, [chibiImageUrl]);

  useEffect(() => {
    if (!chibiTexture) return;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const nameLower = child.name.toLowerCase();
        if (nameLower.includes("head") || nameLower.includes("face")) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.map = chibiTexture;
                mat.needsUpdate = true;
              }
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.map = chibiTexture;
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }, [scene, chibiTexture]);

  return (
    <>
      <primitive object={scene} />
      <Html
        position={[0.6, 1.8, 0]}
        center={false}
        distanceFactor={4}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1.5px solid #1a6b3c",
            borderRadius: "6px",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#1a6b3c",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            userSelect: "none",
          }}
        >
          100cm
        </div>
      </Html>
    </>
  );
}

// ============================================================
// Scene Content
// ============================================================

interface SceneContentProps {
  chibiImageUrl: string;
}

function SceneContent({ chibiImageUrl }: SceneContentProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [useGLTFModel, setUseGLTFModel] = useState(false);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 5, 3]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} />

      {useGLTFModel ? (
        <Suspense fallback={<FallbackFigure chibiImageUrl={chibiImageUrl} />}>
          <GLTFFigure chibiImageUrl={chibiImageUrl} />
        </Suspense>
      ) : (
        <FallbackFigure chibiImageUrl={chibiImageUrl} />
      )}

      {/* Platform / Base */}
      <mesh position={[0, -1.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.7, 0.8, 0.08, 32]} />
        <meshStandardMaterial color="#d4c5b5" roughness={0.9} metalness={0.0} />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0, 0]}
      />
    </>
  );
}

// ============================================================
// ThreeDScene — exported default (dynamically imported)
// ============================================================

interface ThreeDSceneProps {
  chibiImageUrl: string;
}

export default function ThreeDScene({ chibiImageUrl }: ThreeDSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 45 }}
      shadows
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneContent chibiImageUrl={chibiImageUrl} />
    </Canvas>
  );
}
