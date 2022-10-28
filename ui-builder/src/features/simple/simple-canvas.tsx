import { useHotkeys } from '@mantine/hooks'
import { atom, useSetAtom } from 'jotai'
import { FaPlus } from 'react-icons/fa'
import styled from 'styled-components'
import { RenderElements } from '../advanced/renderer'
import { useElementsStore } from '../elements/elements-store'
import { CanvasFrame, ROOT_ID } from '../frame/canvas'
import { useCanvasHotkeys } from '../hotkey/hotkeys'
import { ElementOverlay } from './simple-renderer'

export const insertingAtom = atom<Inserting | null>(null)

interface Inserting {
	where: string
	placement: 'before' | 'after' | 'initial'
}

export function SimpleCanvas() {
	const elements = useElementsStore((store) => store.elements)
	const hotkeys = useCanvasHotkeys({ noCopyPaste: true })
	useHotkeys(hotkeys)
	const isEmpty = elements.length === 0

	const prompt = (
		<Prompt>
			<AddElementButton insert={{ where: ROOT_ID, placement: 'initial' }} />
		</Prompt>
	)

	return (
		<CanvasFrame>
			{isEmpty ? (
				prompt
			) : (
				<RenderElements elements={elements} isDirectRootChildren overlay={ElementOverlay} />
			)}
		</CanvasFrame>
	)
}

const Prompt = styled.div`
	display: flex;
	justify-content: center;
	padding-top: 40px;
`

export function AddElementButton({ insert }: { insert: Inserting }) {
	const setInserting = useSetAtom(insertingAtom)

	return (
		<AddButton
			onClick={(event) => {
				event.stopPropagation()
				setInserting(insert)
			}}
		>
			<FaPlus />
			Section
		</AddButton>
	)
}

const AddButton = styled.button`
	border: none;
	background-color: #f43f5e;
	border-radius: 4px;
	color: white;
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	padding-right: 12px;
	font-weight: 600;
	cursor: pointer;
	:hover {
		background-color: #e11d48;
	}
	:active {
		background-color: #9b1633;
	}
	transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 100ms;
`
