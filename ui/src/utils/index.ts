import _ from 'lodash'

export function getDisplayText(str: string) {
	return _.upperFirst(str).replaceAll('-', ' ').replaceAll('_', ' ')
}
