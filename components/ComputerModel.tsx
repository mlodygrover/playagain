"use client";

import React, { useState } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { useThree } from "@react-three/fiber"; // Importujemy useThree
import * as THREE from "three";

interface ModelProps {
  onPartSelect?: (partName: string) => void;
  selectedPart?: string | null;
  [key: string]: any;
}

export function ComputerModel({ onPartSelect, selectedPart, ...props }: ModelProps) {
  const { nodes, materials } = useGLTF("/gaming-pc.glb") as any;
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  // --- 1. DYNAMICZNE SKALOWANIE (Fix na Mobile) ---
  const { viewport } = useThree();
  
  // Wzór: viewport.width to szerokość ekranu w jednostkach 3D.
  // Dzielimy ją przez liczbę (np. 5), która reprezentuje "szerokość modelu + margines".
  // Math.min(1, ...) zapewnia, że na dużych ekranach model nie powiększy się ponad 100%.
  
  // Zwiększ liczbę '4.2', jeśli nadal przycina (np. na 5.0).
  // Zmniejsz, jeśli model jest za mały.
  const responsiveScale = Math.min(1, viewport.width / 4.2);

  // --- 2. KONFIGURACJA GRUP ---
  const PART_MAPPING: Record<string, string> = {
    // Chłodzenie procesora
    "Cube009": "Chłodzenie CPU",
    "Cube012": "Chłodzenie CPU",
    "Cube010": "Chłodzenie CPU",
    "BezierCurve001": "Chłodzenie CPU",
    "BezierCurve": "Chłodzenie CPU",

    // GPU (Karta Graficzna)
    "Cube013": "Karta Graficzna",
    "Cube014": "Karta Graficzna",
    "Cube015": "Karta Graficzna",

    // CPU (Procesor)
    "Cylinder001": "Procesor",
    "Cylinder003": "Procesor",

    // Pamięć RAM
    "Cube005": "Pamięć RAM",
    "Cube011": "Pamięć RAM",
    "Cube001": "Pamięć RAM",
    "Cube004": "Pamięć RAM",

    // Płyta główna
    "Plane": "Płyta Główna",
    "Cube003": "Płyta Główna",
    "Cube008": "Płyta Główna",
    "Cube002": "Płyta Główna",
    "Cube007": "Płyta Główna",
    "Plane001": "Płyta Główna",
    
    // Obudowa
    "Cube": "Obudowa PC",
    "Cube006": "Obudowa PC",
    "Cylinder011": "Obudowa PC",
    "Cylinder012": "Obudowa PC",
    "Cube016": "Obudowa PC",
  };

  // --- 3. Logika materiałów ---
  const getMaterial = (originalMaterial: THREE.Material, componentName: string) => {
    if (!originalMaterial) return undefined;
    const mat = originalMaterial.clone();

    const isSelected = selectedPart === componentName;
    const isHovered = hoveredGroup === componentName;
    const isAnythingHovered = hoveredGroup !== null;

    if (isSelected) {
      mat.transparent = false;
      mat.opacity = 1.0;
      // @ts-ignore
      mat.color.set("#2563EB"); 
      // @ts-ignore
      mat.emissive.set("#1D4ED8");
      // @ts-ignore
      mat.emissiveIntensity = 0.5;

    } else if (isHovered) {
      mat.transparent = false;
      mat.opacity = 1.0;
      // @ts-ignore
      mat.color.set("#60A5FA"); 
      // @ts-ignore
      mat.emissive.set("#93C5FD");
      // @ts-ignore
      mat.emissiveIntensity = 0.4;

    } else if (isAnythingHovered) {
      mat.transparent = true;
      mat.opacity = 0.40;
      mat.depthWrite = false;
      // @ts-ignore
      mat.color.set("#999999"); 
      // @ts-ignore
      mat.emissive.set("#000000"); 
    } 
    return mat;
  };

  return (
    // Center centruje model. Dodatkowo upewniamy się, że obrót jest wyzerowany na grupie nadrzędnej.
    <Center>
      <group 
        {...props} 
        dispose={null} 
        scale={responsiveScale}
      >
        
        {Object.entries(nodes).map(([meshName, node]: [string, any]) => {
          if (!node.geometry) return null;
          if (meshName === "Plane019" || meshName === "Plane002") return null;

          const friendlyName = PART_MAPPING[meshName];

          return (
            <mesh
              key={meshName}
              name={meshName}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
              castShadow
              receiveShadow
              geometry={node.geometry}
              
              material={getMaterial(node.material, friendlyName)}
              
              onPointerOver={(e) => { 
                e.stopPropagation(); 
                setHoveredGroup(friendlyName || meshName); 
              }}
              
              onPointerOut={(e) => setHoveredGroup(null)}
              
              onClick={(e) => {
                e.stopPropagation();
                if (friendlyName) {
                  if (onPartSelect) onPartSelect(friendlyName);
                }
              }}
            />
          );
        })}
      </group>
    </Center>
  );
}

useGLTF.preload("/gaming-pc.glb");