import { TextInput } from '@mantine/core'
import { useSetWithElement } from '../elements/elements-store'
import { LinkElement } from '../elements/extensions/link'
import { Expression } from '../states/expression'

export function LinkElementInput({ label, element }: { label: string; element: LinkElement }) {
	const set = useSetWithElement(element)
	const setText = (text: string) => {
		set((draft) => (draft.data.href = Expression.fromString(text)))
	}

	return (
		<TextInput
			size="xs"
			label={label}
			name={label}
			value={element.data.href.toString()}
			onChange={(event) => setText(event.target.value)}
		/>
	)
}
