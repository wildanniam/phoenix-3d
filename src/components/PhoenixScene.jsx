import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, PresentationControls, useAnimations, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'

const MODEL_URL = '/assets/phoenix-bird.glb'

const keyframes = [
  { at: 0, position: [1.62, 0.12, -0.1], rotation: [-0.02, -0.22, -0.08], scale: 0.82 },
  { at: 0.24, position: [-1.2, -0.15, -0.2], rotation: [0.08, 0.72, 0.12], scale: 0.92 },
  { at: 0.5, position: [1.05, 0.18, -0.45], rotation: [-0.08, 2.16, -0.15], scale: 1.12 },
  { at: 0.73, position: [0, 0.2, -0.75], rotation: [0.04, 3.1, 0.02], scale: 1.52 },
  { at: 1, position: [0, 0.18, -0.15], rotation: [-0.04, 6.08, 0], scale: 1.02 },
]

function sampleKeyframes(progress, property, target) {
  const upperIndex = keyframes.findIndex((frame) => frame.at >= progress)
  const endIndex = upperIndex === -1 ? keyframes.length - 1 : upperIndex
  const startIndex = Math.max(0, endIndex - 1)
  const start = keyframes[startIndex]
  const end = keyframes[endIndex]
  const span = end.at - start.at || 1
  const t = THREE.MathUtils.smoothstep((progress - start.at) / span, 0, 1)

  if (property === 'scale') {
    return THREE.MathUtils.lerp(start.scale, end.scale, t)
  }

  target.set(...start[property]).lerp(new THREE.Vector3(...end[property]), t)
  return target
}

function Phoenix({ animate, reducedMotion }) {
  const stage = useRef()
  const rig = useRef()
  const smoothedProgress = useRef(0)
  const currentPosition = useMemo(() => new THREE.Vector3(), [])
  const currentRotation = useMemo(() => new THREE.Vector3(), [])
  const targetPosition = useMemo(() => new THREE.Vector3(), [])
  const targetRotation = useMemo(() => new THREE.Vector3(), [])
  const { scene, animations } = useGLTF(MODEL_URL)
  const model = useMemo(() => clone(scene), [scene])
  const { actions } = useAnimations(animations, rig)
  const { viewport, camera, pointer } = useThree()

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxAxis = Math.max(size.x, size.y, size.z)

    const normalizedScale = 4.45 / maxAxis
    model.scale.setScalar(normalizedScale)
    model.position.copy(center).multiplyScalar(-normalizedScale)

    model.traverse((object) => {
      if (!object.isMesh) return
      object.frustumCulled = false
      object.castShadow = false
      object.receiveShadow = false
      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material]
      const materials = sourceMaterials.map((material) => {
        const copy = material.clone()
        if ('emissive' in copy) {
          copy.emissive = new THREE.Color('#2c0902')
          copy.emissiveIntensity = 0.3
        }
        copy.needsUpdate = true
        return copy
      })
      object.material = Array.isArray(object.material) ? materials : materials[0]
    })

    return () => {
      model.traverse((object) => {
        if (!object.isMesh) return
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => material.dispose())
      })
    }
  }, [model])

  useEffect(() => {
    const action = actions['Take 001'] ?? Object.values(actions)[0]
    if (!action) return undefined
    action.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.6).play()
    return () => action.fadeOut(0.25)
  }, [actions])

  useEffect(() => {
    const action = actions['Take 001'] ?? Object.values(actions)[0]
    if (action) action.paused = !animate
  }, [actions, animate])

  useFrame((state, delta) => {
    if (!stage.current) return
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const rawProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0
    const damping = reducedMotion ? 1 : 1 - Math.exp(-delta * 3.25)
    smoothedProgress.current = THREE.MathUtils.lerp(smoothedProgress.current, rawProgress, damping)

    const progress = smoothedProgress.current
    sampleKeyframes(progress, 'position', targetPosition)
    sampleKeyframes(progress, 'rotation', targetRotation)
    const targetScale = sampleKeyframes(progress, 'scale')

    const mobile = viewport.width < 6.4
    const horizontalScale = mobile ? 0.52 : 1
    targetPosition.x *= horizontalScale
    targetPosition.y += mobile ? 0.75 : 0
    targetPosition.z += mobile ? -0.8 : 0

    if (!reducedMotion) {
      targetRotation.x += pointer.y * 0.035
      targetRotation.y += pointer.x * 0.055
      targetPosition.y += Math.sin(state.clock.elapsedTime * 0.68) * 0.035
    }

    currentPosition.lerp(targetPosition, 1 - Math.exp(-delta * 4.5))
    currentRotation.lerp(targetRotation, 1 - Math.exp(-delta * 3.6))
    stage.current.position.copy(currentPosition)
    stage.current.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z)
    stage.current.scale.setScalar(THREE.MathUtils.lerp(stage.current.scale.x, targetScale * (mobile ? 0.78 : 1), 1 - Math.exp(-delta * 4)))

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mobile ? 0 : pointer.x * 0.12, 0.04)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mobile ? 0.15 : pointer.y * 0.08, 0.04)
    camera.lookAt(0, 0.1, 0)
  })

  return (
    <group ref={stage}>
      <PresentationControls
        global
        cursor
        snap
        speed={0.7}
        zoom={1}
        rotation={[0, 0, 0]}
        polar={[-0.25, 0.25]}
        azimuth={[-0.42, 0.42]}
        config={{ mass: 2, tension: 280, friction: 42 }}
      >
        <group ref={rig} rotation={[0, -Math.PI / 2, 0]}>
          <primitive object={model} />
        </group>
      </PresentationControls>
    </group>
  )
}

function EmberField({ animate }) {
  const points = useRef()
  const positions = useMemo(() => {
    const array = new Float32Array(420 * 3)
    let seed = 42
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    for (let i = 0; i < 420; i += 1) {
      array[i * 3] = (random() - 0.5) * 15
      array[i * 3 + 1] = (random() - 0.5) * 10
      array[i * 3 + 2] = -1.5 - random() * 7
    }
    return array
  }, [])

  useFrame(({ clock }, delta) => {
    if (!animate || !points.current) return
    points.current.rotation.y += delta * 0.008
    points.current.position.y = Math.sin(clock.elapsedTime * 0.14) * 0.12
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#e5521f" size={0.026} transparent opacity={0.46} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function Lighting() {
  const ember = useRef()

  useFrame(({ clock }) => {
    if (ember.current) ember.current.intensity = 27 + Math.sin(clock.elapsedTime * 1.35) * 3
  })

  return (
    <>
      <ambientLight intensity={0.72} color="#c7b2a4" />
      <directionalLight position={[4, 5, 5]} intensity={3.8} color="#fff1db" />
      <pointLight ref={ember} position={[-2.8, -2, 2.5]} intensity={28} distance={11} decay={2} color="#ef4b13" />
      <pointLight position={[3.5, 1.2, -1]} intensity={17} distance={9} decay={2} color="#b6290c" />
    </>
  )
}

export default function PhoenixScene({ animate, reducedMotion }) {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.15, 7.4], fov: 35, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
        fallback={<div className="canvas-fallback">WebGL is unavailable in this browser.</div>}
      >
        <AdaptiveDpr pixelated />
        <Suspense fallback={null}>
          <Lighting />
          <EmberField animate={animate && !reducedMotion} />
          <Phoenix animate={animate} reducedMotion={reducedMotion} />
          <EffectComposer multisampling={0} enableNormalPass={false}>
            <Bloom intensity={0.58} luminanceThreshold={0.62} luminanceSmoothing={0.75} mipmapBlur />
            <Vignette eskil={false} offset={0.22} darkness={0.72} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_URL)
