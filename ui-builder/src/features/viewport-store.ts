import create from 'zustand'

export type ViewportDevice = 'desktop' | 'tablet' | 'mobile'

interface ViewportState {
	device: ViewportDevice
	change: (device: ViewportDevice) => void
}

export const useViewportStore = create<ViewportState>()((set) => ({
	device: 'desktop',
	change: (device) => set({ device }),
}))

export const useMaxWidth = () => {
	const viewport = useViewportStore((store) => store.device)
	const maxWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '766px' : '477px'
	return maxWidth
}
