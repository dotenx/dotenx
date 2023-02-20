import { TextInput } from '@mantine/core'
import { useSetWithElement } from '../../elements/elements-store'
import { LinkElement } from '../../elements/extensions/link'
import { Expression } from '../../states/expression'
import { BordersEditor } from '../../style/border-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { BackgroundsEditor } from '../../style/background-editor'
import { Styler } from './styler'

export function LinkStyler({
	label,
	element,
	placeholder,
}: {
	label?: string
	element: LinkElement
	placeholder?: string
}) {
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
			placeholder={placeholder}
			rightSection={<StyleEditor element={element} />}
		/>
	)
}

function StyleEditor({ element }: { element: LinkElement }) {
	return (
		<Styler>
			<BackgroundsEditor element={element} simple />
			<BordersEditor element={element} simple />
			<SpacingEditor element={element} />
		</Styler>
	)
}
