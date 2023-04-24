import { Switch } from '@mantine/core'
import { Element } from '../elements/element'
import { CollapseLine } from '../ui/collapse-line'
import { useEditStyle } from './use-edit-style'

export function DisplayEditor({ element }: { element: Element | Element[] }) {
	const { style, editStyle } = useEditStyle(element)

	return (
		<CollapseLine label="Display" defaultClosed>
			<Switch
				size="xs"
				checked={style.display === 'none'}
				label="Hide"
				onChange={(event) => editStyle('display', event.target.checked ? 'none' : null)}
			/>
		</CollapseLine>
	)
}
