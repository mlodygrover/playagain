"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ComputerModel } from "./ComputerModel";

interface SceneProps {
  onPartSelect?: (partName: string) => void;
}

export default function Scene3D({ onPartSelect }: SceneProps) {
  const searchParams = useSearchParams();
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const configuredCategories = useMemo(() => {
    const cats = [];
    if (searchParams.get('gpu')) cats.push('gpu');
    if (searchParams.get('cpu')) cats.push('cpu');
    if (searchParams.get('mobo')) cats.push('mobo');
    if (searchParams.get('ram')) cats.push('ram');
    if (searchParams.get('disk')) cats.push('disk');
    if (searchParams.get('psu')) cats.push('psu');
    if (searchParams.get('cool')) cats.push('cool');
    if (searchParams.get('case')) cats.push('case');
    return cats;
  }, [searchParams]);

  const handleModelSelect = (partName: string) => {
    setSelectedPart(partName === selectedPart ? null : partName);
    if (onPartSelect) onPartSelect(partName);
  };

  return (
    <div className="h-[600px] w-full relative min-h-[400px]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 2, 7]} fov={40} />
        
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />
        <Environment preset="city" />

        <Suspense fallback={null}>
          {/* 1. POZYCJONOWANIE MODELU 
             Ustawiamy grupę w [0, 0, 0] (lub lekko wyżej, np. 0.5), aby środek obudowy
             pokrywał się z celem kamery. Usunąłem ujemny Y (-0.5).
          */}
          <group position={[0, 0, 0]}> 
             <ComputerModel 
                onPartSelect={handleModelSelect}
                configuredCategories={configuredCategories}
                selectedPart={selectedPart}
             />
          </group>

          {/* 2. POZYCJONOWANIE PODŁOGI
             Skoro podnieśliśmy model do 0, to podłoga też musi "podejść" do góry.
             W ComputerModel.tsx części leżą na wysokości -1.5. 
             Więc podłoga na -2.0 będzie idealnie tuż pod nimi.
          */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]} receiveShadow>
            <circleGeometry args={[10, 64]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
          </mesh>
          
          <ContactShadows position={[0, -1.99, 0]} opacity={0.6} scale={20} blur={2} far={4} color="#000000" />
        </Suspense>

        {/* 3. KAMERA
             Target ustawiony na [0,0,0]. Ponieważ model też jest w [0,0,0],
             zoomowanie będzie odbywać się idealnie "do środka" komputera.
        */}
        <OrbitControls 
          makeDefault 
          target={[0, 0, 0]} 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2.1} 
          autoRotate={configuredCategories.length === 0} 
          autoRotateSpeed={0.5}
          enablePan={false} 
        />
      </Canvas>
    </div>
  );
}