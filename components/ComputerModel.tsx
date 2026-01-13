"use client";

import React, { useState } from "react";
import { useGLTF } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

interface ModelProps {
  onPartSelect?: (partName: string) => void;
  selectedPart?: string | null;
  [key: string]: any;
}

export function ComputerModel({ onPartSelect, selectedPart, ...props }: ModelProps) {
  const { nodes, materials } = useGLTF("/gaming-pc.glb") as any;
  
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  // --- 1. KONFIGURACJA GRUP ---
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

  // --- 2. Logika materiałów ---
  const getMaterial = (originalMaterial: THREE.Material, componentName: string) => {
    if (!originalMaterial) return undefined;
    const mat = originalMaterial.clone();

    const isSelected = selectedPart === componentName;
    const isHovered = hoveredGroup === componentName;
    const isAnythingHovered = hoveredGroup !== null;

    if (isSelected) {
      // === STAN 1: WYBRANO CZĘŚĆ (Solidny Niebieski) ===
      mat.transparent = false;
      mat.opacity = 1.0;
      
      // @ts-ignore
      mat.color.set("#2563EB"); 
      // @ts-ignore
      mat.emissive.set("#1D4ED8");
      // @ts-ignore
      mat.emissiveIntensity = 0.5;

    } else if (isHovered) {
      // === STAN 2: NAJECHANO MYSZKĄ (Solidny Błękit) ===
      mat.transparent = false;
      mat.opacity = 1.0;
      
      // @ts-ignore
      mat.color.set("#60A5FA"); 
      // @ts-ignore
      mat.emissive.set("#93C5FD");
      // @ts-ignore
      mat.emissiveIntensity = 0.4;

    } else if (isAnythingHovered) {
      // === STAN 3: TŁO (Mleczne szkło) ===
      // Tutaj zmieniliśmy wartości:
      mat.transparent = true;
      mat.opacity = 0.40;     // Zwiększono z 0.15 na 0.40 (są bardziej widoczne)
      mat.depthWrite = false;
      
      // Zmieniono kolor na jasnoszary (na czarnym tle będzie lepiej widać kształty)
      // @ts-ignore
      mat.color.set("#999999"); 
      // @ts-ignore
      mat.emissive.set("#000000"); 

    } 
    // === STAN 4: DOMYŚLNY (Bez zmian) ===
    
    return mat;
  };

  return (
    <group {...props} dispose={null}>
      
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
  );
}

useGLTF.preload("/gaming-pc.glb");