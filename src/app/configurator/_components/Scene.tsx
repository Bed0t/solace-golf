"use client"
import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, AdaptiveDpr, ContactShadows } from '@react-three/drei'
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib'
import GolfBagModel from './GolfBagModel'
import type { PartInfo, ModelReadyPayload } from './GolfBagModel'

type SceneProps = {
	selectedPartId: string | null
	colors: Map<string, string>
	onSelectPart: (part: PartInfo) => void
	onModelReady: (payload: ModelReadyPayload) => void
	glbPath?: string
	activeCategory?: 'Panels' | 'Accents' | 'Trim' | 'Personalise' | null
	personalisationText?: string
	personalisationColor?: string
	logoPreviewUrl?: string | null
	personalisationOffset?: { x: number; y: number; z: number }
}

export default function Scene({
	selectedPartId,
	colors,
	onSelectPart,
	onModelReady,
	glbPath = '/SS-001 copy.glb',
	activeCategory = null,
	personalisationText,
	personalisationColor,
	logoPreviewUrl,
	personalisationOffset,
}: SceneProps) {
	const controlsRef = useRef<ThreeOrbitControls>(null)
	const [autoRotate, setAutoRotate] = useState(false)
	const idleTimeoutRef = useRef<number | null>(null)
	const [glDom, setGlDom] = useState<HTMLCanvasElement | null>(null)
	const [canvasKey, setCanvasKey] = useState(0)

	// Restart idle timer to re-enable auto-rotate after user interaction
	const scheduleIdle = () => {
		if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current)
		idleTimeoutRef.current = window.setTimeout(() => setAutoRotate(true), 5000)
	}

	useEffect(() => {
		return () => {
			if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current)
		}
	}, [])

	// Attach and cleanup WebGL context listeners
	useEffect(() => {
		if (!glDom) return
		const onLost = () => {
			console.warn('[Configurator] WebGL context lost; remounting Canvas')
			setCanvasKey((k) => k + 1)
		}
		const onRestored = () => {
			console.info('[Configurator] WebGL context restored; remounting Canvas')	
			// Force a remount to ensure all GPU resources and materials are reinitialized
			setCanvasKey((k) => k + 1)
		}
		glDom.addEventListener('webglcontextlost', onLost as EventListener, {once: true})
		glDom.addEventListener('webglcontextrestored', onRestored as EventListener, false)
		return () => {
			glDom.removeEventListener('webglcontextlost', onLost as EventListener, false)
			glDom.removeEventListener('webglcontextrestored', onRestored as EventListener, false)
		}
	}, [glDom])

	return (
		<Canvas
			key={canvasKey}
			shadows
			dpr={[1, 1.5]}
			style={{ background: '#f5f6f7' }}
			gl={{
				powerPreference: 'high-performance',
				antialias: false,
				alpha: true,
				stencil: false,
				depth: true,
				preserveDrawingBuffer: false,
				failIfMajorPerformanceCaveat: false,
			}}
			camera={{ position: [2.5, 1.5, 3.5], fov: 20}}
			onCreated={({ gl }) => {
				setGlDom(gl.domElement)
				gl.setClearAlpha(0)
			}}
		>

			<hemisphereLight intensity={0.2} color={0xf0f0f0} groundColor={0x888888} />
			<directionalLight
				castShadow
				position={[3, 4, 6]}
				intensity={1.15}
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
				shadow-bias={-0.0002}
			/>

			<group position={[0, -0.5, 0]}>
				<GolfBagModel
					glbPath={glbPath}
					selectedPartId={selectedPartId}
					colors={colors}
					onSelectPart={onSelectPart}
					onModelReady={onModelReady}
					activeCategory={activeCategory}
					personalisationText={personalisationText}
					personalisationColor={personalisationColor}
					logoPreviewUrl={logoPreviewUrl}
					personalisationOffset={personalisationOffset}
				/>
			</group>

			<Environment preset="warehouse" resolution={64} frames={30} />
			<ContactShadows
				position={[0, -0.52, 0]}
				scale={8}
				resolution={1024}
				blur={3.2}
				far={2}
				opacity={1}
				frames={1}
				color="#000000"
			/>
			<AdaptiveDpr pixelated />

			<OrbitControls
				ref={controlsRef}
				enableDamping
				dampingFactor={0.1}
				minDistance={3.1}
				maxDistance={6}
				minPolarAngle={Math.PI * 0.2}
				maxPolarAngle={Math.PI * 0.49}
				autoRotate={autoRotate}
				autoRotateSpeed={0.8}
				onStart={() => {
					setAutoRotate(false)
					if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current)
				}}
				onEnd={() => {
					scheduleIdle()
				}}
			/>
		</Canvas>
	)
}



