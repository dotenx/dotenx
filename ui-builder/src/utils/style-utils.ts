import _ from 'lodash'

export const gridCols = (cols: number) =>
	_.range(cols)
		.map(() => '1fr')
		.join(' ')
