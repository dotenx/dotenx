import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'
import { useElementsStore } from '../elements/elements-store'
import { customCodesAtom } from '../page/actions'
import { useGenerateStyles } from '../style/generate-styles'

export function FrameHead() {
	const elements = useElementsStore((store) => store.elements)
	const generatedStyles = useGenerateStyles(elements)
	const customCodes = useAtomValue(customCodesAtom)
	const headRef = useRef<HTMLHeadElement | null>(null)

	useEffect(() => {
		const frame = window.frames[0]
		const head = frame.document.head
		headRef.current = head
	}, [])

	useEffect(() => {
		if (!headRef.current) return
		headRef.current.innerHTML = `
			<link
				rel="stylesheet"
				href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
			/>
			<link
				rel="stylesheet"
				href="https://cdn.jsdelivr.net/npm/@splidejs/splide@latest/dist/css/splide.min.css"
			/>
			<style>${generatedStyles}</style>
			${customCodes.head}
		`
	}, [customCodes.head, generatedStyles])

	return <></>
}
