"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../configurator.css'
import Scene from './Scene'
import ConfiguratorPanel from './ConfiguratorPanel'
import type { PartInfo, ModelReadyPayload } from './GolfBagModel'

export default function ConfiguratorApp() {
	const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null)
	const [colors, setColors] = useState<Map<string, string>>(new Map())
	const [defaultColors, setDefaultColors] = useState<Map<string, string>>(new Map())
	const [parts, setParts] = useState<PartInfo[]>([])
	const [activeCategory, setActiveCategory] = useState<'Panels' | 'Accents' | 'Trim' | 'Personalise' | null>(null)
	const [glbPath, setGlbPath] = useState<string>('/SS-001 copy.glb')
	const [personalisationText, setPersonalisationText] = useState<string>('')
	const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
	const logoObjectUrlRef = useRef<string | null>(null)
	const [personalisationColor, setPersonalisationColor] = useState<string>('#000000')
	const [personalisationOffset, setPersonalisationOffset] = useState<{x: number; y: number; z: number}>({x: 0, y: 0, z: 0})

	const colorsMemo = useMemo(() => new Map(colors), [colors])

	const handleModelReady = useCallback((payload: ModelReadyPayload) => {
		setDefaultColors(payload.defaultColors)
		setParts(payload.parts)
		// Initialize user colors with defaults on first load
		setColors(new Map(payload.defaultColors))
	}, [])

	const handleSelectPart = useCallback((p: PartInfo) => {
		setSelectedPart(p)
	}, [])

	const handleChangeColor = useCallback((partId: string, color: string) => {
		setColors((prev) => {
			const next = new Map(prev)
			next.set(partId, color)
			return next
		})
	}, [])

	const handleUploadLogoFile = useCallback((file: File) => {
		if (logoObjectUrlRef.current) {
			URL.revokeObjectURL(logoObjectUrlRef.current)
		}
		const objectUrl = URL.createObjectURL(file)
		logoObjectUrlRef.current = objectUrl
		setLogoPreviewUrl(objectUrl)
	}, [])

	const handleRemoveLogo = useCallback(() => {
		if (logoObjectUrlRef.current) {
			URL.revokeObjectURL(logoObjectUrlRef.current)
			logoObjectUrlRef.current = null
		}
		setLogoPreviewUrl(null)
	}, [])

	const handleNudgePersonalisation = useCallback((dx: number, dy: number, dz: number) => {
		setPersonalisationOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy, z: prev.z + dz }))
	}, [])

	const handleResetPersonalisationOffset = useCallback(() => {
		setPersonalisationOffset({ x: 0, y: 0, z: 0 })
	}, [])

	// Allow UI chips to trigger selection
	useEffect(() => {
		const onUiSelect = (e: Event) => {
			const { id, name } = (e as CustomEvent).detail as { id: string; name: string }
			setSelectedPart({ id, name })
		}
		window.addEventListener('ui-select-part', onUiSelect as EventListener)
		return () => window.removeEventListener('ui-select-part', onUiSelect as EventListener)
	}, [])

	// Choose a working GLB path if available; do not hide the scene if checks fail
	useEffect(() => {
		const checkAsset = async (path: string) => {
			try {
				const res = await fetch(path, { method: 'HEAD' })
				if (!res.ok) throw new Error(String(res.status))
				return true
			} catch {
				console.warn(`[Configurator] Expected asset missing: ${path}. Will continue rendering and attempt loading via default path.`)
				return false
			}
		}
		;(async () => {
			const leatherOk = await checkAsset('/white_leather.jpg')
			const preferred = '/SS-001 copy.glb'
			const fallback1 = '/models/SS-001.glb'
			const fallback2 = '/SS-001.glb'
			let chosen: string | null = null
			if (await checkAsset(preferred)) chosen = preferred
			else if (await checkAsset(fallback1)) chosen = fallback1
			else if (await checkAsset(fallback2)) chosen = fallback2
			setGlbPath(chosen ?? preferred)
		})()
	}, [])

	return (
		<div className="app-root">
			<div className="scene-wrap">
				<Scene
					selectedPartId={selectedPart?.id ?? null}
					colors={colorsMemo}
					onSelectPart={handleSelectPart}
					onModelReady={handleModelReady}
					activeCategory={activeCategory}
					glbPath={glbPath}
					personalisationText={personalisationText}
					personalisationColor={personalisationColor}
					logoPreviewUrl={logoPreviewUrl}
					personalisationOffset={personalisationOffset}
				/>
			</div>
			{/* Product Info Overlay*/}
			<div className="product-info-overlay" aria-label="Product Info">
				<div className="product-info-label-display">Display Name</div>
				<div className="product-info-label-code">Code</div>
				<div className="product-info-value-display">Solace One</div>
				<div className="product-info-value-code">S1/001</div>
				<div className="product-info-divider" />
			</div>
			<div className="panel-wrap">
				<ConfiguratorPanel
					selectedPart={selectedPart}
					colors={colorsMemo}
					defaultColors={defaultColors}
					parts={parts}
					onSelectPart={handleSelectPart}
					onChangeColor={handleChangeColor}
					onCategoryChange={(c) => setActiveCategory(c)}
					personalisationText={personalisationText}
					onChangePersonalisationText={setPersonalisationText}
					personalisationColor={personalisationColor}
					onChangePersonalisationColor={setPersonalisationColor}
					logoPreviewUrl={logoPreviewUrl}
					onUploadLogoFile={handleUploadLogoFile}
					onRemoveLogo={handleRemoveLogo}
					personalisationOffset={personalisationOffset}
					onNudgePersonalisation={handleNudgePersonalisation}
					onResetPersonalisationOffset={handleResetPersonalisationOffset}
				/>
			</div>
		</div>
	)
}


