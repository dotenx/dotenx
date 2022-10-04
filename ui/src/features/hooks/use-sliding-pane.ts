import { useAtom } from 'jotai'
import { slidingPaneAtom } from '../atoms'

export enum SlidingPanes {
	Integration = 'integration',
}

export function useSlidingPane() {
	const [modal, setSlidingPane] = useAtom(slidingPaneAtom)

	return {
		...modal,
		open: (kind: SlidingPanes, data: unknown = null) => {
			setSlidingPane({ isOpen: true, kind, data })
		},
		close: () => setSlidingPane({ isOpen: false, kind: null, data: null }),
	}
}
