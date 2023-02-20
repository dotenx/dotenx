import { atom, useAtomValue } from 'jotai'

export type ViewportDevice = 'desktop' | 'tablet' | 'mobile'

export const viewportAtom = atom<ViewportDevice>('desktop')

export const useCanvasMaxWidth = () => {
	const viewport = useAtomValue(viewportAtom)
	const maxWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '766px' : '477px'
	// todo: check if we should use something like this const maxWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '992px' : '766px'
	return maxWidth
}
