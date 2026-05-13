import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useAppStore from '@/stores/appStore'

// ============================================================
// 情绪粒子配置
// ============================================================
const EMOTION_PARTICLE_CONFIGS = {
  idle:    { color: '#4488ff', speed: 1,   opacity: 0.15, size: 0.03,  count: 200 },
  curious: { color: '#66aaff', speed: 1.5, opacity: 0.2,  size: 0.032, count: 220 },
  happy:   { color: '#ff88aa', speed: 2,   opacity: 0.25,  size: 0.035, count: 250 },
  sad:     { color: '#3355aa', speed: 0.5, opacity: 0.1,  size: 0.025, count: 180 },
  excited: { color: '#ff6688', speed: 3,   opacity: 0.3,  size: 0.04,  count: 280 },
  listening: { color: '#88ccff', speed: 1.2, opacity: 0.18, size: 0.03, count: 200 },
}

function Particles({ count = 250 }) {
  const meshRef = useRef()
  const matRef = useRef()
  const currentEmotion = useAppStore((s) => s.currentEmotion)
  const isTyping = useAppStore((s) => s.isTyping)
  const activeEmotion = isTyping ? 'listening' : currentEmotion
  const cfg = EMOTION_PARTICLE_CONFIGS[activeEmotion] || EMOTION_PARTICLE_CONFIGS.idle

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      vel[i * 3] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.001
    }
    return [pos, vel]
  }, [count])

  const targetColor = useRef(new THREE.Color(cfg.color))
  const currentColor = useRef(new THREE.Color(cfg.color))

  useMemo(() => {
    targetColor.current.set(cfg.color)
  }, [cfg.color])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const posAttr = meshRef.current.geometry.attributes.position.array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      posAttr[i3] += velocities[i3] * cfg.speed + Math.sin(t * 0.3 + i) * 0.001
      posAttr[i3 + 1] += velocities[i3 + 1] * cfg.speed + Math.cos(t * 0.2 + i) * 0.001
      posAttr[i3 + 2] += velocities[i3 + 2] * cfg.speed

      if (posAttr[i3] > 10) posAttr[i3] = -10
      if (posAttr[i3] < -10) posAttr[i3] = 10
      if (posAttr[i3 + 1] > 6) posAttr[i3 + 1] = -6
      if (posAttr[i3 + 1] < -6) posAttr[i3 + 1] = 6
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true

    if (matRef.current) {
      currentColor.current.lerp(targetColor.current, 0.03)
      matRef.current.color.copy(currentColor.current)
      matRef.current.opacity += (cfg.opacity - matRef.current.opacity) * 0.03
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={cfg.size}
        color={cfg.color}
        transparent
        opacity={cfg.opacity}
        sizeAttenuation
      />
    </points>
  )
}

// ============================================================
// 浮动光球装饰
// ============================================================
function FloatingOrbs() {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.y = t * 0.02
    groupRef.current.children.forEach((child, i) => {
      child.position.y += Math.sin(t * 0.5 + i * 2) * 0.002
      child.position.x += Math.cos(t * 0.3 + i * 1.5) * 0.001
    })
  })

  const orbs = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 3,
      ],
      scale: 0.1 + Math.random() * 0.2,
      color: ['#4488ff', '#66aaff', '#88ccff', '#ff88aa', '#aa66ff'][i],
    }))
  }, [])

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[orb.scale, 16, 16]} />
          <meshBasicMaterial
            color={orb.color}
            transparent
            opacity={0.08}
          />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================
// 背景色随情绪动态变化
// ============================================================
export default function BackgroundCanvas() {
  const currentEmotion = useAppStore((s) => s.currentEmotion)
  const isTyping = useAppStore((s) => s.isTyping)
  const activeEmotion = isTyping ? 'listening' : currentEmotion

  const bgColors = {
    idle:      ['#070B14', '#001a4d', '#003399'],
    curious:   ['#0a0b15', '#001a55', '#0044aa'],
    happy:     ['#120a12', '#2a0a3d', '#550066'],
    sad:       ['#080a12', '#000d2a', '#001133'],
    excited:   ['#120808', '#2a0810', '#550020'],
    listening: ['#0a0c15', '#001a55', '#0044aa'],
  }

  const colors = bgColors[activeEmotion] || bgColors.idle

  return (
    <div className="fixed inset-0 z-0"
      style={{
        background: `radial-gradient(ellipse at top left, ${colors[2]}40, transparent 50%),
                     radial-gradient(ellipse at bottom right, ${colors[1]}30, transparent 50%),
                     radial-gradient(ellipse at center, ${colors[0]}20, transparent 70%),
                     ${colors[0]}`,
        transition: 'background 2s ease-in-out',
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: 'transparent' }}>
        <Particles />
        <FloatingOrbs />
      </Canvas>

      {/* 额外的 CSS 光晕效果 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{
            background: `radial-gradient(circle, ${colors[2]}, transparent)`,
            animation: 'float 20s ease-in-out infinite',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-5"
          style={{
            background: `radial-gradient(circle, ${colors[1]}, transparent)`,
            animation: 'float 25s ease-in-out infinite reverse',
            filter: 'blur(50px)',
          }}
        />
      </div>
    </div>
  )
}
