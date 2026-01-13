"use client";

import React, { useState } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

interface ModelProps {
  onPartSelect?: (partName: string) => void;
  selectedPart?: string | null;
  [key: string]: any;
}

export function ComputerModel({ onPartSelect, selectedPart, ...props }: ModelProps) {
  const { nodes, materials } = useGLTF("/gaming-pc.glb") as any;
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  // --- 1. POPRAWKI WIZUALNE (POZYCJA I SKALA) ---
  const { viewport } = useThree();
  
  const isMobile = viewport.width < 5;

  // A. SKALA: Powiększamy model. 
  // Dzielnik 3.0 (zamiast 4.2) sprawi, że model będzie większy i lepiej wypełni ramkę.
  const responsiveScale = Math.min(1.3, viewport.width / 3.0);

  // B. POZYCJA Y: "Podciągamy" model do góry.
  // 0.5 dla Desktopu (żeby był na środku ramki)
  // 1.5 dla Mobile (bo tam kamera jest niżej/inaczej ustawiona)
  const yOffset = isMobile ? 1.5 : 0.5;

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
    // Zastosowanie offsetu Y w komponencie Center
    <Center position={[0, yOffset, 0]}>
      <group 
        {...props} 
        dispose={null} 
        scale={responsiveScale}
      >
        
        {Object.entries(nodes).map(([meshName, node]: [string, any]) => {
          if (!node.geometry) return null;
          // Ukrywamy szyby i inne elementy blokujące widok
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