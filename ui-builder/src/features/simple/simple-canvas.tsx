import { useHotkeys } from '@mantine/hooks'
import { atom, useSetAtom } from 'jotai'
import { TbPlus } from 'react-icons/tb'
import styled from 'styled-components'
import { useElementsStore } from '../elements/elements-store'
import { CanvasFrame, ROOT_ID } from '../frame/canvas'
import { useCanvasHotkeys } from '../hotkey/hotkeys'
import { RenderElements } from './simple-renderer'

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
			{isEmpty ? prompt : <RenderElements elements={elements} isDirectRootChildren />}
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
			<TbPlus />
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
`
