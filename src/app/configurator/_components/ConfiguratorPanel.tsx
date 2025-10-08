"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Circle from '@uiw/react-color-circle'
import type { PartInfo } from './GolfBagModel'

type ConfiguratorPanelProps = {
	selectedPart: PartInfo | null
	colors: Map<string, string>
	defaultColors: Map<string, string>
	parts: PartInfo[]
	onSelectPart: (part: PartInfo) => void
	onChangeColor: (partId: string, color: string) => void
	onCategoryChange?: (category: 'Panels' | 'Accents' | 'Trim' | 'Personalise') => void
	// Personalisation props
	personalisationText?: string
	onChangePersonalisationText?: (text: string) => void
	logoPreviewUrl?: string | null
	onUploadLogoFile?: (file: File) => void
	onRemoveLogo?: () => void
	personalisationColor?: string
	onChangePersonalisationColor?: (color: string) => void
	personalisationOffset?: { x: number; y: number; z: number }
	onNudgePersonalisation?: (dx: number, dy: number, dz: number) => void
	onResetPersonalisationOffset?: () => void
}

const CATEGORIES = ['Panels', 'Accents', 'Trim', 'Personalise'] as const
type Category = typeof CATEGORIES[number]

export default function ConfiguratorPanel({
	selectedPart,
	colors,
	defaultColors,
	parts,
	onSelectPart,
	onChangeColor,
	onCategoryChange,
	personalisationText,
	onChangePersonalisationText,
	logoPreviewUrl,
	onUploadLogoFile,
	onRemoveLogo,
	personalisationColor,
	onChangePersonalisationColor,
	personalisationOffset,
	onNudgePersonalisation,
	onResetPersonalisationOffset,
}: ConfiguratorPanelProps) {
	const [activeCategory, setActiveCategory] = useState<Category>('Panels')
	const [selectOpen, setSelectOpen] = useState(false)
	const [activeOptionIndex, setActiveOptionIndex] = useState<number>(0)
	const optionsWrapRef = useRef<HTMLUListElement | null>(null)

	const grouped = useMemo(() => groupPartsByCategory(parts), [parts])
	const currentList = grouped[activeCategory]

	// Keep active option aligned with current selection when list or selection changes
	useEffect(() => {
		const idx = Math.max(0, currentList.findIndex((x) => x.id === (selectedPart?.id ?? '')))
		setActiveOptionIndex(idx === -1 ? 0 : idx)
	}, [currentList, selectedPart?.id])

	// Close dropdown on outside click
	useEffect(() => {
		if (!selectOpen) return
		const onClick = (e: MouseEvent) => {
			const target = e.target as Node
			// If click is inside the options list, ignore; otherwise close
			if (optionsWrapRef.current && optionsWrapRef.current.contains(target)) return
			setSelectOpen(false)
		}
		document.addEventListener('mousedown', onClick)
		return () => document.removeEventListener('mousedown', onClick)
	}, [selectOpen])

	const commitSelection = useCallback((idx: number) => {
		const item = currentList[idx]
		if (!item) return
		onSelectPart(item)
		setSelectOpen(false)
	}, [currentList, onSelectPart])

	const selectedColor = useMemo(() => {
		if (!selectedPart) return '#ffffff'
		return colors.get(selectedPart.id) ?? defaultColors.get(selectedPart.id) ?? '#ffffff'
	}, [selectedPart, colors, defaultColors])

	const palette = useMemo(
		() => [
			'#000000', '#7d7d7d', '#c9c9c9', '#ffffff',
			'#0b3a5b', '#0f6c94', '#8e1f28', '#0e3a2c', '#8a6432',
			'#001a33', '#1f4aa8', '#134d73', '#0a7f7f', '#0b4d20', '#2e7d32', '#6b8e23',
			'#6a1b2a', '#7b1e3c', '#4e342e', '#c2a178', '#d8c3a5', '#f5f1e6', '#eae6df',
			'#2a3439', '#4a5568', '#b76e79', '#b87333'
		],
		[]
	)

	const swatchesRef = useRef<HTMLDivElement | null>(null)

	// width of the long inner palette so it stays on a single row
	const itemSize = 25
	const itemGap = 16
	const oneSetWidth = useMemo(() => (palette.length * (itemSize + itemGap)) - itemGap, [palette])
	const loopedPalette = useMemo(() => [...palette, ...palette, ...palette], [palette])
	const loopedWidth = useMemo(() => (loopedPalette.length * (itemSize + itemGap)) - itemGap, [loopedPalette])

	const normalizeScroll = () => {
		const el = swatchesRef.current
		if (!el) return
		const startOfMiddle = oneSetWidth
		const endOfMiddle = startOfMiddle + oneSetWidth
		const threshold = itemSize + itemGap
		if (el.scrollLeft < startOfMiddle - threshold) {
			el.scrollLeft += oneSetWidth
		} else if (el.scrollLeft > endOfMiddle + threshold) {
			el.scrollLeft -= oneSetWidth
		}
	}

	const getScrollStep = () => {
		const el = swatchesRef.current
		if (!el) return 0
		return el.clientWidth
	}
	const scrollByAmount = (delta: number) => {
		const el = swatchesRef.current
		if (!el) return
		el.scrollBy({ left: delta, behavior: 'smooth' })
		// Schedule a state update after the scroll starts
		requestAnimationFrame(normalizeScroll)
	}

	useEffect(() => {
		const el = swatchesRef.current
		if (el) {
			// Jump to the middle copy so we can scroll infinitely in both directions
			el.scrollLeft = oneSetWidth
		}
	}, [oneSetWidth])

	return (
		<div className="config-panel">
			<div className="panel-header">
				<div className="config-header">
					{CATEGORIES.map((c) => (
						<button
							key={c}
							className={`tab${c === activeCategory ? ' active' : ''}`}
							onClick={() => {
								setActiveCategory(c)
								onCategoryChange?.(c)
							}}
						>
							{c}
						</button>
					))}
				</div>
			</div>

			{activeCategory !== 'Personalise' && (
				<>
					<div className="sub-selector">
						<div className={`select-wrap${selectOpen ? ' open' : ''}`}>
							<button
								id="part-select"
								type="button"
								className="select-button"
								aria-haspopup="listbox"
								aria-expanded={selectOpen}
								onClick={() => setSelectOpen((v) => !v)}
								onKeyDown={(e) => {
									if (e.key === 'ArrowDown') {
										e.preventDefault()
										setSelectOpen(true)
										setActiveOptionIndex((i) => Math.min(currentList.length - 1, i + 1))
									} else if (e.key === 'ArrowUp') {
										e.preventDefault()
										setSelectOpen(true)
										setActiveOptionIndex((i) => Math.max(0, i - 1))
									} else if (e.key === 'Enter') {
										e.preventDefault()
										commitSelection(activeOptionIndex)
									} else if (e.key === 'Escape') {
										setSelectOpen(false)
									}
								}}
							>
								<span className="select-label">{(currentList.find((x) => x.id === selectedPart?.id)?.name) ?? 'Select a section'}</span>
								<span className="chevron">▾</span>
							</button>
							{selectOpen && (
								<ul
									ref={optionsWrapRef}
									role="listbox"
									className="options"
									aria-labelledby="part-select"
								>
									{currentList.map((p, i) => (
										<li
											key={p.id}
											role="option"
											aria-selected={selectedPart?.id === p.id}
											className={`option${i === activeOptionIndex ? ' active' : ''}${selectedPart?.id === p.id ? ' selected' : ''}`}
											onMouseEnter={() => setActiveOptionIndex(i)}
											onMouseDown={(e) => {
												// Prevent blur before click completes
												e.preventDefault()
												commitSelection(i)
											}}
										>
											{p.name}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					<div className="color-bar">
						<button className="arrow" aria-label="prev" onClick={() => scrollByAmount(-getScrollStep())}>‹</button>
						<div className="swatches" ref={swatchesRef} onScroll={normalizeScroll}>
							<Circle
								colors={loopedPalette}
								color={selectedColor}
								onChange={({ hex }) => selectedPart && onChangeColor(selectedPart.id, hex)}
								style={{ width: loopedWidth }}
							/>
						</div>
						<button className="arrow" aria-label="next" onClick={() => scrollByAmount(getScrollStep())}>›</button>
					</div>

					<div className="color-picker-wrap">
						<div
							className="leather-preview"
							aria-label="Leather preview"
							style={{
								backgroundImage: `linear-gradient(${selectedColor}, ${selectedColor}), url('/white_leather.jpg')`,
								backgroundSize: '1000px',
								backgroundPosition: 'center',
							}}
						/>
					</div>
				</>
			)}

			{activeCategory === 'Personalise' && (
				<div className="personalise-wrap">
					{/* Text color selection */}
					<div className="color-bar">
						<button className="arrow" aria-label="prev" onClick={() => scrollByAmount(-getScrollStep())}>‹</button>
						<div className="swatches" ref={swatchesRef} onScroll={normalizeScroll}>
							<Circle
								colors={loopedPalette}
								color={personalisationColor ?? '#000000'}
								onChange={({ hex }) => onChangePersonalisationColor?.(hex)}
								style={{ width: loopedWidth }}
							/>
						</div>
						<button className="arrow" aria-label="next" onClick={() => scrollByAmount(getScrollStep())}>›</button>
					</div>

					<label className="personalise-label" htmlFor="personalise-text">Add text</label>
					<input
						id="personalise-text"
						type="text"
						className="personalise-input"
						placeholder="Name, nickname, business..."
						value={personalisationText ?? ''}
						onChange={(e) => onChangePersonalisationText?.(e.target.value)}
					/>

					<div className="upload-section">
						<label className="personalise-label" htmlFor="logo-upload">Upload image/logo</label>
						<div className="upload-area">
							{logoPreviewUrl ? (
								<div className="upload-preview">
									<img src={logoPreviewUrl} alt="Logo preview" />
									<button type="button" className="remove-logo" onClick={() => onRemoveLogo?.()}>Remove</button>
								</div>
							) : (
								<>
									<input
										id="logo-upload"
										type="file"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files?.[0]
											if (file) onUploadLogoFile?.(file)
										}}
									/>
									<p className="upload-hint">PNG, JPG, SVG. Max 5MB.</p>
								</>
							)}
						</div>
					</div>

					{/* Nudge controls */}
					<div className="nudge-wrap">
						<div className="nudge-row">
							<button type="button" className="nudge-btn" onClick={() => onNudgePersonalisation?.(0, 0.005, 0)}>↑</button>
						</div>
						<div className="nudge-row">
							<button type="button" className="nudge-btn" onClick={() => onNudgePersonalisation?.(-0.005, 0, 0)}>←</button>
							<div className="nudge-center">
								<span className="nudge-readout">X: {personalisationOffset?.x?.toFixed(3) ?? '0.000'}</span>
								<span className="nudge-readout">Y: {personalisationOffset?.y?.toFixed(3) ?? '0.000'}</span>
								<span className="nudge-readout">Z: {personalisationOffset?.z?.toFixed(3) ?? '0.000'}</span>
							</div>
							<button type="button" className="nudge-btn" onClick={() => onNudgePersonalisation?.(0.005, 0, 0)}>→</button>
						</div>
						<div className="nudge-row">
							<button type="button" className="nudge-btn" onClick={() => onNudgePersonalisation?.(0, -0.005, 0)}>↓</button>
						</div>
						<div className="nudge-row">
							<button type="button" className="nudge-btn" onClick={() => onResetPersonalisationOffset?.()}>Reset</button>
						</div>
					</div>
				</div>
			)}

			{/* Checkout CTA */}
			<div className="checkout-wrap" style={{ marginTop: 16 }}>
				{activeCategory !== 'Personalise' ? (
					<button
						type="button"
						className="select-button"
						onClick={() => {
							setActiveCategory('Personalise')
							onCategoryChange?.('Personalise')
						}}
					>
						Finalise
					</button>
				) : (
					<button
						type="button"
						className="select-button"
						onClick={async () => {
							try {
								const payload = {
									colors: Object.fromEntries(colors.entries()),
									personalisationText: personalisationText ?? '',
									personalisationColor: personalisationColor ?? '#000000',
									personalisationOffset: personalisationOffset ?? { x: 0, y: 0, z: 0 },
								}
								const res = await fetch('/api/checkout', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify(payload),
								})
								if (!res.ok) throw new Error(await res.text())
								const data = await res.json()
								if (data?.url) {
									window.location.href = data.url as string
								} else if (data?.id) {
									window.location.href = `/checkout/${data.id}`
								} else {
									alert('Unable to start checkout.')
								}
							} catch (err: any) {
								console.error('[Checkout] error', err)
								alert(`Checkout error: ${err?.message || 'unknown'}`)
							}
						}}
					>
						Add to cart
					</button>
				)}
			</div>
		</div>
	)
}

function groupPartsByCategory(parts: PartInfo[]): Record<Category, PartInfo[]> {
	const initial: Record<Category, PartInfo[]> = {
		Panels: [],
		Accents: [],
		Trim: [],
		Personalise: [],
	}
	for (const p of parts) {
		const name = p.name.toLowerCase()
		let key: Category = 'Panels'
		if (name.includes('accent')) key = 'Accents'
		else if (name.includes('trim')) key = 'Trim'
		else if (name.includes('personal')) key = 'Personalise'
		initial[key].push(p)
	}
	// Ensure there is at least one item in Panels if empty
	if (initial.Panels.length === 0) initial.Panels = parts
	return initial
}


