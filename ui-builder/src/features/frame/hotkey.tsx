import { getHotkeyHandler } from '@mantine/hooks'
import { useAtomValue } from 'jotai'
import { ReactNode, useContext, useEffect } from 'react'
import { FrameContext } from 'react-frame-component'
import { useCanvasHotkeys } from '../hotkey/hotkeys'
import { customCodesAtom } from '../page/actions'
import { updateFrameHead } from '../page/update-frame-head'

export function FrameHotkeys({ children }: { children: ReactNode }) {
	const { window } = useContext(FrameContext)
	const hotkeys = useCanvasHotkeys()

	const customCodes = useAtomValue(customCodesAtom)
	useEffect(() => {
		updateFrameHead(customCodes.head)
	})

	useEffect(() => {
		const hotkeysEvent = getHotkeyHandler(hotkeys as any)
		window?.document.body.addEventListener('keydown', hotkeysEvent)
		return () => window?.document.body.removeEventListener('keydown', hotkeysEvent)
	}, [hotkeys, window?.document.body])

	return <>{children}</>
}
