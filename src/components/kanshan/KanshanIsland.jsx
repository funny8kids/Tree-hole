import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Environment, ContactShadows, Html, useProgress } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import useAppStore from '@/stores/appStore'

// ============================================================
// 情绪动作配置 — 操作最外层 group，严禁拆解 glb 内部节点
// ============================================================
const EMOTION_CONFIGS = {
  idle: {
    pos: [0, 0, 0], rot: [0, 0, 0], scale: 1,
    bobSpeed: 0.8, bobAmount: 0.03,
    breathScale: 0.008,
    glowColor: '#0066FF',
    glowIntensity: 0.4,
    particleColor: '#88CCFF',
    particleCount: 30,
  },
  curious: {
    pos: [0, 0.05, 0], rot: [0, 0, 0.18], scale: 1.02,
    bobSpeed: 1.5, bobAmount: 0.05,
    breathScale: 0.012,
    glowColor: '#4499FF',
    glowIntensity: 0.6,
    particleColor: '#66BBFF',
    particleCount: 40,
  },
  happy: {
    pos: [0, 0.15, 0], rot: [0, 0, 0], scale: 1.08,
    bobSpeed: 2.0, bobAmount: 0.08,
    breathScale: 0.015,
    glowColor: '#FF88AA',
    glowIntensity: 0.7,
    particleColor: '#FFAACC',
    particleCount: 50,
  },
  sad: {
    pos: [0, -0.08, 0.05], rot: [0.12, 0, -0.06], scale: 0.96,
    bobSpeed: 0.4, bobAmount: 0.01,
    breathScale: 0.005,
    glowColor: '#334488',
    glowIntensity: 0.2,
    particleColor: '#556699',
    particleCount: 20,
  },
  excited: {
    pos: [0, 0.25, 0], rot: [0, 0.1, 0.1], scale: 1.12,
    bobSpeed: 3.0, bobAmount: 0.12,
    breathScale: 0.02,
    glowColor: '#FF6688',
    glowIntensity: 0.9,
    particleColor: '#FF88AA',
    particleCount: 60,
  },
  listening: {
    pos: [0, 0.03, 0.08], rot: [-0.08, 0, 0.1], scale: 1.0,
    bobSpeed: 1.0, bobAmount: 0.02,
    breathScale: 0.01,
    glowColor: '#88CCFF',
    glowIntensity: 0.5,
    particleColor: '#AADDFF',
    particleCount: 35,
  },
  click: {
    pos: [0, 0.3, 0], rot: [0, 0, 0], scale: 1.15,
    bobSpeed: 4.0, bobAmount: 0.15,
    breathScale: 0.025,
    glowColor: '#FFD700',
    glowIntensity: 1.0,
    particleColor: '#FFE44D',
    particleCount: 80,
  },
}

// ============================================================
// 自定义动画 Hook — lerp 平滑过渡 + 呼吸 + 微动
// ============================================================
function useKanshanAnimation(emotion) {
  const groupRef = useRef()
  const config = EMOTION_CONFIGS[emotion] || EMOTION_CONFIGS.idle

  const state = useRef({
    pos: new THREE.Vector3(0, 0, 0),
    rot: new THREE.Euler(0, 0, 0),
    scale: 1,
  })

  useFrame((frameState) => {
    if (!groupRef.current) return
    const t = frameState.clock.elapsedTime
    const damp = 0.035

    // 呼吸效果
    const breath = Math.sin(t * 1.2) * config.bobAmount * config.breathScale

    // 目标值
    const targetY = config.pos[1] + Math.sin(t * config.bobSpeed) * config.bobAmount + breath
    const targetRotZ = config.rot[2] + Math.sin(t * 0.7) * 0.015
    const targetRotY = config.rot[1] + Math.sin(t * 0.4) * 0.025

    // Lerp position
    state.current.pos.x += (config.pos[0] - state.current.pos.x) * damp
    state.current.pos.y += (targetY - state.current.pos.y) * damp
    state.current.pos.z += (config.pos[2] - state.current.pos.z) * damp

    // Lerp rotation
    state.current.rot.x += (config.rot[0] - state.current.rot.x) * damp
    state.current.rot.y += (targetRotY - state.current.rot.y) * damp
    state.current.rot.z += (targetRotZ - state.current.rot.z) * damp

    // Lerp scale
    state.current.scale += (config.scale - state.current.scale) * damp

    groupRef.current.position.copy(state.current.pos)
    groupRef.current.rotation.copy(state.current.rot)
    groupRef.current.scale.setScalar(state.current.scale)
  })

  return groupRef
}

// ============================================================
// 加载进度组件
// ============================================================
function LoadingIndicator() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-2 border-zhihu-blue/30 border-t-zhihu-blue animate-spin" />
        <span className="text-xs text-white/40">{Math.round(progress)}%</span>
      </div>
    </Html>
  )
}

// ============================================================
// 黑盒 3D 模型 — 只操作最外层 group
// ============================================================
function KanshanModel() {
  const currentEmotion = useAppStore((s) => s.currentEmotion)
  const isTyping = useAppStore((s) => s.isTyping)
  const [clickEffect, setClickEffect] = useState(false)
  const groupRef = useKanshanAnimation(clickEffect ? 'click' : (isTyping ? 'listening' : currentEmotion))

  const gltf = useLoader(GLTFLoader, '/models/kanshan.glb', (loader) => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log(`[GLB] Loading: ${itemsLoaded}/${itemsTotal}`)
    }
  })

  // 点击特效
  const handleClick = () => {
    setClickEffect(true)
    setTimeout(() => setClickEffect(false), 800)
  }

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={gltf.scene} scale={1} />
    </group>
  )
}

// ============================================================
// 光环底座 — 跟随情绪律动 + 颜色联动
// ============================================================
function GlowBase() {
  const meshRef = useRef()
  const ringRef = useRef()
  const glowRef = useRef()
  const currentEmotion = useAppStore((s) => s.currentEmotion)
  const isTyping = useAppStore((s) => s.isTyping)
  const config = EMOTION_CONFIGS[isTyping ? 'listening' : currentEmotion] || EMOTION_CONFIGS.idle

  const targetColor = useRef(new THREE.Color(config.glowColor))
  const currentColor = useRef(new THREE.Color(config.glowColor))

  useEffect(() => {
    targetColor.current.set(config.glowColor)
  }, [config.glowColor])

  useFrame((state) => {
    if (!meshRef.current || !ringRef.current) return
    const t = state.clock.elapsedTime

    // 颜色平滑过渡
    currentColor.current.lerp(targetColor.current, 0.02)
    meshRef.current.material.color.copy(currentColor.current)
    meshRef.current.material.emissive.copy(currentColor.current)
    ringRef.current.material.color.copy(currentColor.current)
    ringRef.current.material.emissive.copy(currentColor.current)

    // 光环呼吸
    const pulseSpeed = config.bobSpeed * 0.8
    const baseOpacity = isTyping ? 0.18 : 0.12
    meshRef.current.material.opacity = baseOpacity + Math.sin(t * pulseSpeed) * 0.06

    // 外圈旋转
    ringRef.current.rotation.z = t * 0.15
    ringRef.current.material.opacity = 0.08 + Math.sin(t * pulseSpeed * 0.6) * 0.04

    // 附加辉光
    if (glowRef.current) {
      const glowOpacity = config.glowIntensity * 0.15 * (0.6 + Math.sin(t * pulseSpeed * 1.2) * 0.4)
      glowRef.current.material.opacity = glowOpacity
      glowRef.current.material.emissive.copy(currentColor.current)
    }
  })

  return (
    <group position={[0, -0.85, 0]}>
      {/* 内圈发光 */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 48]} />
        <meshStandardMaterial
          color={config.glowColor}
          transparent
          opacity={0.12}
          emissive={config.glowColor}
          emissiveIntensity={config.glowIntensity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 外圈旋转环 */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.15, 48]} />
        <meshStandardMaterial
          color={config.glowColor}
          transparent
          opacity={0.08}
          emissive={config.glowColor}
          emissiveIntensity={config.glowIntensity * 0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 附加辉光层 */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.3, 48]} />
        <meshStandardMaterial
          color={config.glowColor}
          transparent
          opacity={0}
          emissive={config.glowColor}
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ============================================================
// 浮动装饰粒子 — 固定最大缓冲区，动态显示子集
// ============================================================
const MAX_PARTICLES = 100

function FloatingParticles() {
  const meshRef = useRef()
  const currentEmotion = useAppStore((s) => s.currentEmotion)
  const isTyping = useAppStore((s) => s.isTyping)
  const config = EMOTION_CONFIGS[isTyping ? 'listening' : currentEmotion] || EMOTION_CONFIGS.idle
  const activeCount = config.particleCount

  // 只创建一次固定大小的缓冲区
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3)
    const vel = new Float32Array(MAX_PARTICLES * 3)
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 4
      pos[i3 + 1] = (Math.random() - 0.5) * 3
      pos[i3 + 2] = (Math.random() - 0.5) * 2
      vel[i3] = (Math.random() - 0.5) * 0.02
      vel[i3 + 1] = Math.random() * 0.01 + 0.005
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01
    }
    return { positions: pos, velocities: vel }
  }, [])

  const activeCountRef = useRef(activeCount)
  activeCountRef.current = activeCount

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const posAttr = meshRef.current.geometry.attributes.position.array
    const count = activeCountRef.current

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const i3 = i * 3
      if (i < count) {
        // 活跃粒子：正常运动
        posAttr[i3] += velocities[i3] + Math.sin(t * 0.5 + i) * 0.002
        posAttr[i3 + 1] += velocities[i3 + 1] + Math.cos(t * 0.3 + i) * 0.001
        posAttr[i3 + 2] += velocities[i3 + 2] + Math.sin(t * 0.7 + i * 0.5) * 0.001
        if (posAttr[i3 + 1] > 2) posAttr[i3 + 1] = -2
        if (Math.abs(posAttr[i3]) > 2.5) posAttr[i3] *= -0.8
      } else {
        // 隐藏粒子：移到不可见位置
        posAttr[i3] = 0
        posAttr[i3 + 1] = -999
        posAttr[i3 + 2] = 0
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_PARTICLES}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={config.particleColor}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ============================================================
// 点击波纹效果
// ============================================================
function ClickRipple({ position }) {
  const meshRef = useRef()
  const [scale, setScale] = useState(0)
  const [opacity, setOpacity] = useState(1)

  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    setScale(prev => Math.min(prev + delta * 3, 2))
    setOpacity(prev => Math.max(prev - delta * 2, 0))
    
    meshRef.current.scale.setScalar(scale)
    meshRef.current.material.opacity = opacity
  })

  if (opacity <= 0) return null

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 0.6, 32]} />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ============================================================
// 光源配置 — 打造盲盒手办质感
// ============================================================
function Lights() {
  const currentEmotion = useAppStore((s) => s.currentEmotion)
  const isTyping = useAppStore((s) => s.isTyping)

  const fillColors = {
    idle: '#4488FF',
    curious: '#66AAFF',
    happy: '#FF88AA',
    sad: '#334488',
    excited: '#FF6688',
    listening: '#88CCFF',
  }
  const fill = fillColors[isTyping ? 'listening' : currentEmotion] || fillColors.idle

  return (
    <>
      {/* 主光：左上柔光 */}
      <directionalLight
        position={[-5, 8, 5]}
        intensity={0.9}
        color="#e8eeff"
        castShadow
      />

      {/* 补光：右下微蓝（随情绪变色） */}
      <pointLight
        position={[3, -2, 2]}
        intensity={isTyping ? 0.6 : 0.4}
        color={fill}
        distance={10}
      />

      {/* 环境光：底部暖色提亮 */}
      <pointLight
        position={[0, -3, 0]}
        intensity={0.2}
        color="#ffeedd"
        distance={8}
      />

      {/* 背景光：营造氛围 */}
      <pointLight
        position={[0, 3, -3]}
        intensity={0.3}
        color={fill}
        distance={12}
      />

      {/* 环境基础光 */}
      <ambientLight intensity={0.3} />
    </>
  )
}

// ============================================================
// 主导出组件
// ============================================================
export default function KanshanIsland() {
  const [hasError, setHasError] = useState(false)
  const [clickPos, setClickPos] = useState(null)

  if (hasError) {
    return <StaticFallback />
  }

  return (
    <div className="w-[350px] h-[400px] relative">
      <Canvas
        camera={{ position: [0, 0.3, 2.8], fov: 38 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.2
        }}
        onError={() => setHasError(true)}
      >
        <Suspense fallback={<LoadingIndicator />}>
          <KanshanModel />
        </Suspense>

        <GlowBase />
        <FloatingParticles />
        <Lights />

        {/* 点击波纹 */}
        {clickPos && <ClickRipple position={clickPos} />}

        <ContactShadows
          position={[0, -0.85, 0]}
          opacity={0.35}
          scale={4}
          blur={2.5}
          far={3.5}
          color="#001a4d"
        />

        <Environment preset="night" />
      </Canvas>

      {/* 交互提示 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/20 text-center">
        点击看山互动
      </div>
      
      {/* 情绪指示器 */}
      <EmotionIndicator />
    </div>
  )
}

// ============================================================
// 情绪指示器 — 显示当前情绪状态
// ============================================================
function EmotionIndicator() {
  const currentEmotion = useAppStore((s) => s.currentEmotion)
  const isTyping = useAppStore((s) => s.isTyping)
  const config = EMOTION_CONFIGS[isTyping ? 'listening' : currentEmotion] || EMOTION_CONFIGS.idle

  const emotionLabels = {
    idle: '平静',
    curious: '好奇',
    happy: '开心',
    sad: '难过',
    excited: '兴奋',
    listening: '倾听',
    click: '互动',
  }

  const emotionEmojis = {
    idle: '😌',
    curious: '🤔',
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    listening: '👂',
    click: '✨',
  }

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
      <span className="text-sm">{emotionEmojis[isTyping ? 'listening' : currentEmotion] || '😌'}</span>
      <span className="text-[10px] text-white/60">{emotionLabels[isTyping ? 'listening' : currentEmotion] || '平静'}</span>
    </div>
  )
}

function StaticFallback() {
  return (
    <div className="w-[350px] h-[400px] flex flex-col items-center justify-center gap-3">
      <img src="/images/icon.png" alt="看山" className="w-40 h-40 object-contain opacity-60" />
      <span className="text-xs text-white/25">WebGL 不可用，降级为静态图片</span>
    </div>
  )
}
