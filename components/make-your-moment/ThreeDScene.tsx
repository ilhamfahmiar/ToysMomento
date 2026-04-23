"use client";

/**
 * ThreeDScene — React Three Fiber scene untuk visualisasi model 3D dari Meshy AI.
 *
 * Menerima GLB URL dari Meshy API dan me-render model 3D interaktif.
 * Di-import secara dynamic (ssr: false) dari ThreeDVisualizer.tsx.
 */

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  useGLTF,
  Environment,
  Center,
} from "@react-three/drei";
import * as THREE from "three";

// ============================================================
// Meshy 3D Model Viewer
// ============================================================

interface MeshyModelProps {
  glbUrl: string;
}

function MeshyModel({ glbUrl }: MeshyModelProps) {
  const { scene } = useGLTF(glbUrl);
  const groupRef = useRef<THREE.Group>(null);

  // Subtle idle rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} />
      </Center>
      {/* 100cm label */}
      <Html
        position={[0.8, 1.5, 0]}
        center={false}
        distanceFactor={4}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1.5px solid #15803d",
            borderRadius: "6px",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#15803d",
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
// Fallback Nendoroid Primitives (jika GLB gagal load)
// ============================================================

function FallbackFigure() {
  const groupRef = useRef<THREE.Group>(null);

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

  const matteGreen = new THREE.MeshStandardMaterial({
    color: "#15803d",
    roughness: 0.85,
  });
  const matteDark = new THREE.MeshStandardMaterial({
    color: "#1c1917",
    roughness: 0.9,
  });
  const matteSkin = new THREE.MeshStandardMaterial({
    color: "#fde68a",
    roughness: 0.8,
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh position={[0, bodyHeight / 2 + headRadius * 0.85, 0]} castShadow>
        <sphereGeometry args={[headRadius, 32, 32]} />
        <primitive object={matteSkin} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry
          args={[bodyRadius * 0.9, bodyRadius, bodyHeight, 16]}
        />
        <primitive object={matteGreen} attach="material" />
      </mesh>
      <mesh
        position={[-(bodyRadius + armRadius + 0.04), bodyHeight * 0.2, 0]}
        rotation={[0, 0, Math.PI / 8]}
        castShadow
      >
        <cylinderGeometry args={[armRadius * 0.8, armRadius, armHeight, 12]} />
        <primitive object={matteSkin} attach="material" />
      </mesh>
      <mesh
        position={[bodyRadius + armRadius + 0.04, bodyHeight * 0.2, 0]}
        rotation={[0, 0, -Math.PI / 8]}
        castShadow
      >
        <cylinderGeometry args={[armRadius * 0.8, armRadius, armHeight, 12]} />
        <primitive object={matteSkin} attach="material" />
      </mesh>
      <mesh
        position={[-bodyRadius * 0.5, -(bodyHeight / 2 + legHeight / 2), 0]}
        castShadow
      >
        <cylinderGeometry args={[legRadius, legRadius * 1.1, legHeight, 12]} />
        <primitive object={matteDark} attach="material" />
      </mesh>
      <mesh
        position={[bodyRadius * 0.5, -(bodyHeight / 2 + legHeight / 2), 0]}
        castShadow
      >
        <cylinderGeometry args={[legRadius, legRadius * 1.1, legHeight, 12]} />
        <primitive object={matteDark} attach="material" />
      </mesh>
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
      <Html
        position={[headRadius + 0.15, bodyHeight / 2 + headRadius * 1.6, 0]}
        center={false}
        distanceFactor={4}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1.5px solid #15803d",
            borderRadius: "6px",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#15803d",
            whiteSpace: "nowrap",
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
// Scene Content
// ============================================================

interface SceneContentProps {
  glbUrl?: string;
}

function SceneContent({ glbUrl }: SceneContentProps) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 3]} intensity={1.0} castShadow />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} />
      <Environment preset="studio" />

      {glbUrl ? (
        <Suspense fallback={<FallbackFigure />}>
          <MeshyModel glbUrl={glbUrl} />
        </Suspense>
      ) : (
        <FallbackFigure />
      )}

      {/* Platform */}
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.08, 32]} />
        <meshStandardMaterial color="#d4c5b5" roughness={0.9} />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0, 0]}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// ============================================================
// ThreeDScene — exported default
// ============================================================

interface ThreeDSceneProps {
  chibiImageUrl: string; // now used as GLB URL from Meshy
}

export default function ThreeDScene({ chibiImageUrl }: ThreeDSceneProps) {
  // chibiImageUrl is now the GLB URL from Meshy API
  const isGlbUrl =
    chibiImageUrl?.includes(".glb") || chibiImageUrl?.includes("meshy");

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 45 }}
      shadows
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneContent glbUrl={isGlbUrl ? chibiImageUrl : undefined} />
    </Canvas>
  );
}
