import { TextInput } from '@mantine/core'
import { useSetWithElement } from '../elements/elements-store'
import { TextElement } from '../elements/extensions/text'
import { Expression } from '../states/expression'
import { SpacingEditor } from '../style/spacing-editor'
import { TypographyEditor } from '../style/typography-editor'
import { InputStyler } from './input-styler'

export function TextElementInput({
	label,
	element,
	placeholder,
}: {
	label: string
	element: TextElement
	placeholder?: string
}) {
	const set = useSetWithElement(element)
	const setText = (text: string) => {
		set((draft) => (draft.data.text = Expression.fromString(text)))
	}

	return (
		<TextInput
			size="xs"
			label={label}
			name={label}
			placeholder={placeholder}
			value={element.data.text.toString()}
			onChange={(event) => setText(event.target.value)}
			rightSection={<StyleEditor element={element} />}
		/>
	)
}

function StyleEditor({ element }: { element: TextElement }) {
	return (
		<InputStyler>
			<TypographyEditor element={element} simple />
			<SpacingEditor element={element} />
		</InputStyler>
	)
}
