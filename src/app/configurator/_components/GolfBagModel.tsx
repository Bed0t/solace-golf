"use client"
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Group, Mesh, MeshStandardMaterial, Color, Texture, CanvasTexture, Box3, Vector3, Euler } from 'three'

export type PartInfo = {
	id: string
	name: string
}

export type ModelReadyPayload = {
	defaultColors: Map<string, string>
	parts: PartInfo[]
}

type GolfBagModelProps = {
	glbPath?: string
	selectedPartId: string | null
	colors: Map<string, string>
	onSelectPart: (part: PartInfo) => void
	onModelReady?: (payload: ModelReadyPayload) => void
	activeCategory?: 'Panels' | 'Accents' | 'Trim' | 'Personalise' | null
    personalisationText?: string
    personalisationColor?: string
    logoPreviewUrl?: string | null
    personalisationOffset?: { x: number; y: number; z: number }
}

// Preload only the preferred path to avoid unnecessary 404s; the actual `glbPath` will be loaded by useGLTF
useGLTF.preload('/SS-001 copy.glb')

export default function GolfBagModel({
	glbPath = '/SS-001 copy.glb',
	selectedPartId,
	colors,
	onSelectPart,
	onModelReady,
	activeCategory = null,
    personalisationText,
    personalisationColor = '#000000',
    logoPreviewUrl,
    personalisationOffset,
}: GolfBagModelProps) {
	const { scene } = useGLTF(glbPath) as unknown as { scene: Group }

	// Clone the scene and ensure unique materials for independent recoloring
	const cloned = useMemo(() => {
		const deepClone = scene.clone(true)
		const meshList: Mesh[] = []
		deepClone.traverse((obj) => {
			if ((obj as Mesh).isMesh) {
				const mesh = obj as Mesh
				// Ensure material is standard and clonable
				if (Array.isArray(mesh.material)) {
					mesh.material = mesh.material.map((m) => (m as MeshStandardMaterial).clone()) as any
				} else if (mesh.material) {
					mesh.material = (mesh.material as MeshStandardMaterial).clone()
				}
				mesh.castShadow = true
				mesh.receiveShadow = true
				meshList.push(mesh)
			}
		})
		return { root: deepClone, meshes: meshList }
	}, [scene])

	// Find the target personalisation panel mesh by name
	const targetPanelMesh = useMemo(() => {
		return cloned.meshes.find((m) => (m.name || '').toLowerCase() === 'centre_pocket_panel'.toLowerCase()) ?? null
	}, [cloned.meshes])

	// Compute world-space center and size of the target panel for positioning the overlay
	const panelCenter = useMemo(() => {
		if (!targetPanelMesh) return null
		const box = new Box3().setFromObject(targetPanelMesh)
		const center = new Vector3()
		box.getCenter(center)
		return center
	}, [targetPanelMesh])

	const panelSize = useMemo(() => {
		if (!targetPanelMesh) return null
		const box = new Box3().setFromObject(targetPanelMesh)
		const size = new Vector3()
		box.getSize(size)
		return size
	}, [targetPanelMesh])

	// Build a dynamic canvas texture for text/logo personalisation
	const personalisationTexture = useMemo(() => {
		if (!personalisationText && !logoPreviewUrl) return null
		const canvas = document.createElement('canvas')
		canvas.width = 1024
		canvas.height = 512
		const ctx = canvas.getContext('2d')!
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		// Transparent background
		ctx.fillStyle = 'rgba(0,0,0,0)'
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		const padding = 40
		let drawY = canvas.height / 2
		const availableWidth = canvas.width - padding * 2

		if (personalisationText) {
			// Fit text into available width
			let fontSize = 180
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.fillStyle = personalisationColor || '#000000'
			ctx.font = `700 ${fontSize}px Montserrat, sans-serif`
			while (fontSize > 24 && ctx.measureText(personalisationText).width > availableWidth) {
				fontSize -= 6
				ctx.font = `700 ${fontSize}px Montserrat, sans-serif`
			}
			ctx.fillText(personalisationText, canvas.width / 2, drawY)
		}

		if (logoPreviewUrl) {
			const img = new Image()
			img.crossOrigin = 'anonymous'
			img.src = logoPreviewUrl
			img.onload = () => {
				const maxH = canvas.height * 0.6
				const maxW = availableWidth
				let w = img.width
				let h = img.height
				const scale = Math.min(maxW / w, maxH / h, 1)
				w *= scale
				h *= scale
				ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
				texture.needsUpdate = true
			}
		}

		const texture = new CanvasTexture(canvas)
		texture.anisotropy = 4
		texture.needsUpdate = true
		return texture as Texture
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [personalisationText, personalisationColor, logoPreviewUrl])

	// Report parts and default colors once
	useEffect(() => {
		const defaultColors = new Map<string, string>()
		const parts: PartInfo[] = []
		for (const mesh of cloned.meshes) {
			const id = mesh.uuid
			const name = mesh.name || `Part-${id.slice(0, 8)}`
			const material = getStandardMaterial(mesh)
			const colorHex = material?.color?.getHexString?.() ?? 'ffffff'
			defaultColors.set(id, `#${colorHex}`)
			parts.push({ id, name })
		}
		onModelReady?.({ defaultColors, parts })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cloned])

	// Apply external colors map to materials
	useEffect(() => {
		for (const mesh of cloned.meshes) {
			const id = mesh.uuid
			const color = colors.get(id)
			if (!color) continue
			const material = getStandardMaterial(mesh)
			if (material) {
				// Avoid unnecessary color set to reduce renders
				const current = `#${material.color.getHexString()}`
				if (current.toLowerCase() !== color.toLowerCase()) {
					material.color = new Color(color)
					material.needsUpdate = true
				}
			}
		}
	}, [colors, cloned.meshes])

	// Highlight selection via emissive glow
	const highlightStartRef = useRef<number | null>(null)
	const highlightedIdRef = useRef<string | null>(null)
	const categoryHighlightStartRef = useRef<number | null>(null)
	const activeCategoryRef = useRef<string | null>(null)

	// Initialize highlight when selection changes
	useEffect(() => {
		highlightedIdRef.current = selectedPartId
		highlightStartRef.current = selectedPartId ? performance.now() : null
		for (const mesh of cloned.meshes) {
			const material = getStandardMaterial(mesh)
			if (!material) continue
			if (mesh.uuid === selectedPartId) {
				material.emissive = new Color('#00ffdd')
				material.emissiveIntensity = 100
			} else {
				material.emissive = new Color('#000000')
				material.emissiveIntensity = 0
			}
			material.needsUpdate = true
		}
	}, [selectedPartId, cloned.meshes])

	// Animate emissive fade over a short duration to 0
	useFrame(() => {
		const selectedId = highlightedIdRef.current
		const start = highlightStartRef.current
		if (!selectedId || start == null) return

		const now = performance.now()
		const durationMs = 1200
		const progress = Math.min((now - start) / durationMs, 1)
		// ease out quad for a smooth finish
		const remaining = 1 - progress
		const eased = remaining * remaining
		const intensity = 10 * eased

		for (const mesh of cloned.meshes) {
			if (mesh.uuid !== selectedId) continue
			const material = getStandardMaterial(mesh)
			if (!material) continue
			material.emissiveIntensity = intensity
			if (progress >= 1) {
				material.emissive = new Color('#000000')
				material.emissiveIntensity = 0
				highlightedIdRef.current = null
				highlightStartRef.current = null
			}
			material.needsUpdate = true
			break
		}
	})

	// Category highlighting: start a timed same-color glow (uses the part's actual color)
	useEffect(() => {
		activeCategoryRef.current = activeCategory?.toLowerCase() ?? null
		categoryHighlightStartRef.current = activeCategory ? performance.now() : null

		const category = activeCategoryRef.current
		for (const mesh of cloned.meshes) {
			const material = getStandardMaterial(mesh)
			if (!material) continue
			if (!category) {
				if (!highlightedIdRef.current || mesh.uuid !== highlightedIdRef.current) {
					material.emissive = new Color('#000000')
					material.emissiveIntensity = 0
					material.needsUpdate = true
				}
				continue
			}
			const name = mesh.name.toLowerCase()
			const isAccent = name.includes('accent')
			const isTrim = name.includes('trim')
			const isPersonal = name.includes('personal')
			const isPanel = !isAccent && !isTrim && !isPersonal
			const match =
				(category === 'accents' && isAccent) ||
				(category === 'trim' && isTrim) ||
				(category === 'personalise' && isPersonal) ||
				(category === 'panels' && isPanel)
			if (match && mesh.uuid !== highlightedIdRef.current) {
				// Copy the current base color so the glow matches the real material color
				material.emissive = material.color as Color
				material.emissiveIntensity = 2
				material.needsUpdate = true
			} else if (!highlightedIdRef.current || mesh.uuid !== highlightedIdRef.current) {
				material.emissive = new Color('#000000')
				material.emissiveIntensity = 0
				material.needsUpdate = true
			}
		}
	}, [activeCategory, cloned.meshes])

	// Animate category emissive fade out (same-color glow fades to 0)
	useFrame(() => {
		const start = categoryHighlightStartRef.current
		const category = activeCategoryRef.current
		if (start == null || !category) return

		const now = performance.now()
		const durationMs = 1000
		const progress = Math.min((now - start) / durationMs, 1)
		const remaining = 1 - progress
		const eased = remaining * remaining
		const intensity = 0.8 * eased

		for (const mesh of cloned.meshes) {
			const material = getStandardMaterial(mesh)
			if (!material) continue
			const name = mesh.name.toLowerCase()
			const isAccent = name.includes('accent')
			const isTrim = name.includes('trim')
			const isPersonal = name.includes('personal')
			const isPanel = !isAccent && !isTrim && !isPersonal
			const match =
				(category === 'accents' && isAccent) ||
				(category === 'trim' && isTrim) ||
				(category === 'personalise' && isPersonal) ||
				(category === 'panels' && isPanel)

			if (match && mesh.uuid !== highlightedIdRef.current) {
				material.emissive = material.color.clone()
				material.emissiveIntensity = intensity * 2
				if (progress >= 1) {
					material.emissive = new Color('#000000')
					material.emissiveIntensity = 0
				}
				material.needsUpdate = true
			}
		}

		if (progress >= 1) {
			categoryHighlightStartRef.current = null
			activeCategoryRef.current = null
		}
	})

	return (
		<group>
			<primitive
				object={cloned.root}
				onPointerDown={(e: any) => {
					const target = e.object as Mesh
					if (!target || !(target as any).isMesh) return
					e.stopPropagation()
					const id = target.uuid
					const name = target.name || `Part-${id.slice(0, 8)}`
					onSelectPart({ id, name })
				}}
			/>

			{/* Personalisation overlay plane anchored to Centre_Pocket_Panel */}
			{targetPanelMesh && personalisationTexture && panelCenter && panelSize && (
				(() => {
					const local = new Vector3(
						personalisationOffset?.x ?? 0,
						personalisationOffset?.y ?? 0,
						personalisationOffset?.z ?? 0,
					)
					// Rotate offsets by plane's rotation so moves are locked to the plane orientation
					local.applyEuler(new Euler(-0.45, 0, 0))
					return (
						<mesh
							position={[
								panelCenter.x + local.x,
								panelCenter.y + local.y,
								panelCenter.z + (panelSize.z * 0.12) + local.z,
							]}
							rotation={[-0.45, 0, 0]}
						>
							<planeGeometry args={[panelSize.x * 0.8, panelSize.y * 0.35]} />
							<meshBasicMaterial map={personalisationTexture as any} transparent depthWrite={false} 
							/>
						</mesh>
					)
				})()
			)}
		</group>
	)
}

function getStandardMaterial(mesh: Mesh): MeshStandardMaterial | null {
	const material = mesh.material
	if (Array.isArray(material)) return (material[0] as MeshStandardMaterial) ?? null
	if (!material) return null
	if ((material as MeshStandardMaterial).color) return material as MeshStandardMaterial
	return null
}


