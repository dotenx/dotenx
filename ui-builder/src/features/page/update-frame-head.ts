import { htmlToElement, runScripts } from '../../utils'

export function updateFrameHead(value: string) {
	console.log(value)
	const elements = htmlToElement(value)
	const frame = window.frames[0]
	const head = frame.document.head
	frame.document.querySelectorAll('.FRAME_HEAD').forEach((element) => element.remove())
	elements.forEach((element) => {
		element.classList.add('FRAME_HEAD')
		head.appendChild(element)
	})
	runScripts(head)
}
