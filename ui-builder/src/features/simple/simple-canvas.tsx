import { useHotkeys } from '@mantine/hooks'
import { atom, useSetAtom } from 'jotai'
import { TbPlus } from 'react-icons/tb'
import styled from 'styled-components'
import { RenderElements } from '../advanced/renderer'
import { useElementsStore } from '../elements/elements-store'
import { CanvasFrame, ROOT_ID } from '../frame/canvas'
import { useCanvasHotkeys } from '../hotkey/hotkeys'
import { ElementOverlay } from './simple-renderer'

export const insertingAtom = atom<Inserting | null>(null)

export interface Inserting {
	where: string
	placement: 'before' | 'after' | 'initial'
}

export function SimpleCanvas() {
	const elements = useElementsStore((store) => store.elements)
	const hotkeys = useCanvasHotkeys()
	useHotkeys(hotkeys)
	const isEmpty = elements.length === 0

	const prompt = (
		<Prompt>
			<AddElementButton insert={{ where: ROOT_ID, placement: 'initial' }} />
		</Prompt>
	)

	return (
		<CanvasFrame>
			<div style={{ minHeight: 'calc(100vh - 6px)', paddingBottom: 16 }}>
				{isEmpty ? (
					prompt
				) : (
					<RenderElements
						elements={elements}
						isDirectRootChildren
						overlay={ElementOverlay}
						isSimple={true}
					/>
				)}
			</div>
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
		<AddSimpleComponentButton
			onClick={(event) => {
				event.stopPropagation()
				setInserting(insert)
			}}
		>
			<TbPlus size={30} />
		</AddSimpleComponentButton>
	)
}

export const AddSimpleComponentButton = styled.button`
	border: none;
	background-color: #f43f5e;
	border-radius: 9999px;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	cursor: pointer;
	:active {
		background-color: #d41b43;
	}
	// rotate the button 90 degrees on hover

	:hover {
		transform: rotate(90deg);
	}

	transition-property: color, background-color, border-color, text-decoration-color, fill, stroke,
		transform;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 100ms;
`
