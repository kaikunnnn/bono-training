/**
 * 璃奈フラワー3Dコンポーネント
 * 5段階の成長を表現する3D花
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { GrowthStage, RINA_FLOWER_COLORS } from '@/types/flower';

interface RinaFlower3DProps {
  growthStage: GrowthStage;
  animate?: boolean;
  scale?: number;
}

export function RinaFlower3D({
  growthStage,
  animate = true,
  scale = 1
}: RinaFlower3DProps) {
  const groupRef = useRef<Group>(null);
  const petalRefs = useRef<Mesh[]>([]);

  // アイドル時の揺れアニメーション
  useFrame((state) => {
    if (!animate || !groupRef.current) return;

    const time = state.clock.getElapsedTime();
    // 風に揺れるような動き
    groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;

    // 花びらの微細な動き（満開時のみ）
    if (growthStage === 5) {
      petalRefs.current.forEach((petal, i) => {
        if (petal) {
          petal.rotation.y = Math.sin(time * 0.8 + i) * 0.1;
        }
      });
    }
  });

  // 成長段階に応じたサイズ調整
  const sizes = useMemo(() => {
    const baseScale = scale;
    switch (growthStage) {
      case 0: return { stem: 0, leaf: 0, bud: 0, petal: 0, seedSize: 0.15 * baseScale };
      case 1: return { stem: 0.3 * baseScale, leaf: 0.1 * baseScale, bud: 0, petal: 0, seedSize: 0 };
      case 2: return { stem: 0.6 * baseScale, leaf: 0.2 * baseScale, bud: 0, petal: 0, seedSize: 0 };
      case 3: return { stem: 0.8 * baseScale, leaf: 0.25 * baseScale, bud: 0.15 * baseScale, petal: 0, seedSize: 0 };
      case 4: return { stem: 1.0 * baseScale, leaf: 0.3 * baseScale, bud: 0, petal: 0.15 * baseScale, seedSize: 0 };
      case 5: return { stem: 1.0 * baseScale, leaf: 0.3 * baseScale, bud: 0, petal: 0.25 * baseScale, seedSize: 0 };
      default: return { stem: 0, leaf: 0, bud: 0, petal: 0, seedSize: 0.15 * baseScale };
    }
  }, [growthStage, scale]);

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Stage 0: 種 */}
      {growthStage === 0 && (
        <group>
          {/* 土 */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.5, 32]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          {/* 種 */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[sizes.seedSize, 16, 16]} />
            <meshStandardMaterial color={RINA_FLOWER_COLORS.seed} />
          </mesh>
        </group>
      )}

      {/* Stage 1-5: 茎 */}
      {growthStage >= 1 && (
        <mesh position={[0, sizes.stem / 2, 0]}>
          <cylinderGeometry args={[0.02 * scale, 0.03 * scale, sizes.stem, 8]} />
          <meshStandardMaterial color={RINA_FLOWER_COLORS.stem} />
        </mesh>
      )}

      {/* Stage 1-5: 葉 */}
      {growthStage >= 1 && (
        <>
          {/* 左の葉 */}
          <mesh
            position={[-sizes.leaf, sizes.stem * 0.4, 0]}
            rotation={[0, 0, Math.PI / 4]}
          >
            <boxGeometry args={[sizes.leaf * 1.5, sizes.leaf * 0.5, 0.01]} />
            <meshStandardMaterial color={RINA_FLOWER_COLORS.leaf} />
          </mesh>
          {/* 右の葉 */}
          <mesh
            position={[sizes.leaf, sizes.stem * 0.4, 0]}
            rotation={[0, 0, -Math.PI / 4]}
          >
            <boxGeometry args={[sizes.leaf * 1.5, sizes.leaf * 0.5, 0.01]} />
            <meshStandardMaterial color={RINA_FLOWER_COLORS.leaf} />
          </mesh>
        </>
      )}

      {/* Stage 2-5: 追加の葉 */}
      {growthStage >= 2 && (
        <>
          <mesh
            position={[0, sizes.stem * 0.6, -sizes.leaf]}
            rotation={[Math.PI / 4, 0, 0]}
          >
            <boxGeometry args={[sizes.leaf * 0.5, sizes.leaf * 1.5, 0.01]} />
            <meshStandardMaterial color={RINA_FLOWER_COLORS.leaf} />
          </mesh>
          <mesh
            position={[0, sizes.stem * 0.6, sizes.leaf]}
            rotation={[-Math.PI / 4, 0, 0]}
          >
            <boxGeometry args={[sizes.leaf * 0.5, sizes.leaf * 1.5, 0.01]} />
            <meshStandardMaterial color={RINA_FLOWER_COLORS.leaf} />
          </mesh>
        </>
      )}

      {/* Stage 3: つぼみ */}
      {growthStage === 3 && (
        <mesh position={[0, sizes.stem + sizes.bud, 0]}>
          <sphereGeometry args={[sizes.bud, 16, 16]} />
          <meshStandardMaterial color={RINA_FLOWER_COLORS.bud} />
        </mesh>
      )}

      {/* Stage 4-5: 花びら */}
      {growthStage >= 4 && (
        <group position={[0, sizes.stem, 0]}>
          {/* 6枚の花びら */}
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const openAngle = growthStage === 5 ? 0 : Math.PI / 6;
            const radius = sizes.petal;

            return (
              <mesh
                key={i}
                ref={(el) => {
                  if (el) petalRefs.current[i] = el;
                }}
                position={[
                  Math.cos(angle) * radius,
                  0.1,
                  Math.sin(angle) * radius
                ]}
                rotation={[openAngle, angle, 0]}
              >
                <boxGeometry args={[sizes.petal * 0.8, sizes.petal * 1.2, 0.02]} />
                <meshStandardMaterial
                  color={RINA_FLOWER_COLORS.petal}
                  emissive={growthStage === 5 ? RINA_FLOWER_COLORS.petal : '#000000'}
                  emissiveIntensity={growthStage === 5 ? 0.2 : 0}
                />
              </mesh>
            );
          })}

          {/* 花の中心 */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[sizes.petal * 0.3, 16, 16]} />
            <meshStandardMaterial
              color={RINA_FLOWER_COLORS.center}
              emissive={RINA_FLOWER_COLORS.center}
              emissiveIntensity={growthStage === 5 ? 0.5 : 0.2}
            />
          </mesh>

          {/* Stage 5: キラキラエフェクト */}
          {growthStage === 5 && (
            <>
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const distance = sizes.petal * 1.5;
                return (
                  <mesh
                    key={`sparkle-${i}`}
                    position={[
                      Math.cos(angle) * distance,
                      0.3 + Math.sin(i) * 0.1,
                      Math.sin(angle) * distance
                    ]}
                  >
                    <sphereGeometry args={[0.02 * scale, 8, 8]} />
                    <meshStandardMaterial
                      color={RINA_FLOWER_COLORS.sparkle}
                      emissive={RINA_FLOWER_COLORS.sparkle}
                      emissiveIntensity={1}
                    />
                  </mesh>
                );
              })}
            </>
          )}
        </group>
      )}
    </group>
  );
}
