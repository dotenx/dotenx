import _ from 'lodash'

export const gridCols = (cols: number) =>
	_.range(cols)
		.map(() => '1fr')
		.join(' ')

export const getGridCols = (cols: string): number => {
	const colsArray = cols.split(' ')
	return colsArray.length
}
