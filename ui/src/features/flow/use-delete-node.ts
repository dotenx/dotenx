import { useSetAtom } from 'jotai'
import { flowAtom } from '../atoms'

export function useDeleteNode() {
	const setElements = useSetAtom(flowAtom)

	const deleteNode = (id: string) => {
		setElements((elements) => elements.filter((element) => element.id !== id))
	}

	return deleteNode
}
