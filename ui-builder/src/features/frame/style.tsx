import { useElementsStore } from '../elements/elements-store'
import { useGenerateStyles } from '../style/generate-styles'

export function FrameStyles() {
	const elements = useElementsStore((store) => store.elements)
	const generatedStyles = useGenerateStyles(elements)

	return (
		<>
			<link
				rel="stylesheet"
				href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
			/>
			<style>{generatedStyles}</style>
		</>
	)
}
