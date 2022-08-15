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
