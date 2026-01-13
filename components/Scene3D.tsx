"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { useState, Suspense } from "react";
import { ComputerModel } from "./ComputerModel";

interface SceneProps {
  onPartSelect?: (partName: string) => void;
}

export default function Scene3D({ onPartSelect }: SceneProps) {
  // Lokalny stan do wyświetlania dymka nad modelem
  const [localSelected, setLocalSelected] = useState<string | null>(null);

  const handleSelect = (partName: string) => {
    setLocalSelected(partName);
    if (onPartSelect) {
      onPartSelect(partName);
    }
  };

  return (
    <div className="h-[600px] w-full relative">
      
      {/* Overlay wewnątrz canvasu (opcjonalny) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm border border-white/10">
          Render: Realtime WebGL
        </span>
      </div>

      <Canvas>
        {/* 1. Ustawienia kamery - oddalona, żeby widzieć cały model */}
        <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={45} />
        
        {/* 2. Oświetlenie studyjne */}
        <ambientLight intensity={0.7} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={1} 
          castShadow 
        />
        <Environment preset="city" />

        {/* 3. Model 3D */}
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}> {/* Obniżamy model, żeby był na środku */}
            <ComputerModel 
              onPartSelect={handleSelect} 
              selectedPart={localSelected} 
              scale={0.5} // <--- SKALOWANIE: Zmniejszamy model o połowę
            />
          </group>
        </Suspense>

        {/* 4. Kontrola (Myszka) */}
        <OrbitControls 
          enablePan={false} // Blokada przesuwania modelu na boki (tylko obrót)
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 1.8} // Blokada, żeby nie wjeżdżać pod podłogę
        />
        
        {/* Cień pod modelem */}
        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
}