import { getHotkeyHandler } from '@mantine/hooks'
import { ReactNode, useContext, useEffect } from 'react'
import { FrameContext } from 'react-frame-component'
import { useCanvasHotkeys } from '../hotkey/hotkeys'

export function FrameHotkeys({ children }: { children: ReactNode }) {
	const { window } = useContext(FrameContext)
	const hotkeys = useCanvasHotkeys()

	useEffect(() => {
		const hotkeysEvent = getHotkeyHandler(hotkeys as any)
		window?.document.body.addEventListener('keydown', hotkeysEvent)
		return () => window?.document.body.removeEventListener('keydown', hotkeysEvent)
	}, [hotkeys, window?.document.body])

	return <>{children}</>
}
