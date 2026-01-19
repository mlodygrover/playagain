"use client";

import React, { useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated, config } from "@react-spring/three";

interface ModelProps {
  onPartSelect?: (partName: string) => void;
  configuredCategories?: string[]; 
  selectedPart?: string | null; // <--- 1. DODANO PROP
  [key: string]: any;
}

export function ComputerModel({ onPartSelect, configuredCategories = [], selectedPart, ...props }: ModelProps) {
  const { nodes } = useGLTF("/gaming-pc.glb") as any;
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  const MAPPING: Record<string, { id: string, label: string }> = {
    // ... (Twoje mapowanie bez zmian) ...
    "Cube013": { id: "gpu", label: "Karta Graficzna" },
    "Cube014": { id: "gpu", label: "Karta Graficzna" },
    "Cube015": { id: "gpu", label: "Karta Graficzna" },
    "Cylinder001": { id: "cpu", label: "Procesor" },
    "Cylinder003": { id: "cpu", label: "Procesor" },
    "Cube005": { id: "ram", label: "Pamięć RAM" },
    "Cube011": { id: "ram", label: "Pamięć RAM" },
    "Cube001": { id: "ram", label: "Pamięć RAM" },
    "Cube004": { id: "ram", label: "Pamięć RAM" },
    "Plane": { id: "mobo", label: "Płyta Główna" },
    "Cube003": { id: "mobo", label: "Płyta Główna" },
    "Cube008": { id: "mobo", label: "Płyta Główna" },
    "Cube002": { id: "mobo", label: "Płyta Główna" },
    "Cube007": { id: "mobo", label: "Płyta Główna" },
    "Plane001": { id: "mobo", label: "Płyta Główna" },
    "Cube": { id: "case", label: "Obudowa PC" },
    "Cube006": { id: "case", label: "Obudowa PC" },
    "Cylinder011": { id: "case", label: "Obudowa PC" },
    "Cylinder012": { id: "case", label: "Obudowa PC" },
    "Cube016": { id: "case", label: "Obudowa PC" },
    "Cube009": { id: "cool", label: "Chłodzenie CPU" },
    "Cube012": { id: "cool", label: "Chłodzenie CPU" },
    "Cube010": { id: "cool", label: "Chłodzenie CPU" },
    "BezierCurve001": { id: "cool", label: "Chłodzenie CPU" },
    "BezierCurve": { id: "cool", label: "Chłodzenie CPU" },
  };

  const groupData = useMemo(() => {
    const centers: Record<string, THREE.Vector3> = {};
    const counts: Record<string, number> = {};

    Object.entries(nodes).forEach(([name, node]: [string, any]) => {
      const info = MAPPING[name];
      if (info && node.position && node.geometry) {
        if (!centers[info.id]) centers[info.id] = new THREE.Vector3(0, 0, 0);
        if (!counts[info.id]) counts[info.id] = 0;
        centers[info.id].add(node.position);
        counts[info.id]++;
      }
    });

    Object.keys(centers).forEach(key => {
      if (counts[key] > 0) centers[key].divideScalar(counts[key]);
    });

    const tableSlots: Record<string, [number, number, number]> = {};
    const categories = Object.keys(centers).filter(k => k !== 'case');
    const TABLE_RADIUS = 4.5;
    const TABLE_HEIGHT = -1.5;

    categories.forEach((catId, index) => {
      const angle = (index / categories.length) * Math.PI * 2;
      tableSlots[catId] = [
        Math.cos(angle) * TABLE_RADIUS,
        TABLE_HEIGHT, 
        Math.sin(angle) * TABLE_RADIUS
      ];
    });

    return { centers, tableSlots };
  }, [nodes]);

  return (
    <group {...props} dispose={null}>
      {Object.entries(nodes).map(([meshName, node]: [string, any]) => {
        if (!node.geometry) return null;
        if (meshName === "Plane019" || meshName === "Plane002") return null;

        const info = MAPPING[meshName];
        if (!info) return null;

        const isConfigured = configuredCategories.includes(info.id);
        const isCase = info.id === "case";
        const isAssembled = isCase || isConfigured;
        
        // --- 2. CZY TEN KONKRETNY ELEMENT JEST WYBRANY PRZEZ UŻYTKOWNIKA? ---
        const isSelected = selectedPart === info.label;

        let targetPos: [number, number, number];
        const targetRot: [number, number, number] = [
            node.rotation.x, 
            node.rotation.y, 
            node.rotation.z
        ];

        if (isAssembled) {
          targetPos = [node.position.x, node.position.y, node.position.z];
        } else {
          const groupCenter = groupData.centers[info.id];
          const slotPos = groupData.tableSlots[info.id];

          if (groupCenter && slotPos) {
            targetPos = [
              (node.position.x - groupCenter.x) + slotPos[0],
              (node.position.y - groupCenter.y) + slotPos[1], 
              (node.position.z - groupCenter.z) + slotPos[2],
            ];
          } else {
            targetPos = [node.position.x, -5, node.position.z];
          }
        }

        const { position, rotation, color, emissiveIntensity } = useSpring({
          position: targetPos,
          rotation: targetRot,
          // --- 3. POPRAWIONA LOGIKA KOLORÓW ---
          // Świecimy TYLKO jeśli isSelected jest true.
          // Jeśli jest w obudowie (isAssembled), ale nie wybrany -> biały (normalny).
          color: isSelected 
            ? "#2563EB" // Wybrany = Niebieski
            : (hoveredGroup === info.label ? "#60A5FA" : "#ffffff"), // Hover = Jasny niebieski, Inne = Biały
          
          emissiveIntensity: isSelected ? 0.6 : 0, // Tylko wybrany emituje światło
          
          config: { mass: 1, tension: 120, friction: 26 }
        });

        return (
          <animated.mesh
            key={meshName}
            name={meshName}
            geometry={node.geometry}
            castShadow
            receiveShadow
            position={position as any}
            rotation={rotation as any}
            scale={node.scale}
            onClick={(e) => {
              e.stopPropagation();
              if (onPartSelect) onPartSelect(info.label);
            }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredGroup(info.label); }}
            onPointerOut={() => setHoveredGroup(null)}
          >
            <animated.meshStandardMaterial
              color={color}
              emissive="#1D4ED8"
              emissiveIntensity={emissiveIntensity}
              roughness={0.5}
              metalness={0.6}
            />
          </animated.mesh>
        );
      })}
    </group>
  );
}

useGLTF.preload("/gaming-pc.glb");