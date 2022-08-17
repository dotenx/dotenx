import produce from 'immer'

export function withInsert(array: string[], where: number, item: string) {
	return produce(array, (draft) => {
		draft.splice(where, 0, item)
	})
}
