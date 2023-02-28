import { TextInput } from '@mantine/core'
import _ from 'lodash'
import { useSetWithElement } from '../../elements/elements-store'
import { TextElement } from '../../elements/extensions/text'
import { Expression } from '../../states/expression'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { Styler } from './styler'

export function TextStyler({
	label,
	element,
	placeholder,
	noText,
	onChange,
}: {
	label: string
	element: TextElement | TextElement[]
	placeholder?: string
	noText?: boolean
	onChange?: (text: string) => void
}) {
	if (noText) return <TextStylerNoText label={label} element={element} />

	return (
		<TextStylerWithText
			label={label}
			element={_.isArray(element) ? element[0] : element}
			placeholder={placeholder}
			onChange={onChange}
		/>
	)
}

function TextStylerWithText({
	label,
	element,
	placeholder,
	onChange,
}: {
	label: string
	element: TextElement
	placeholder?: string
	onChange?: (text: string) => void
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
			onChange={(event) => {
				setText(event.target.value)
				onChange?.(event.target.value)
			}}
			rightSection={<StyleEditor element={element} />}
		/>
	)
}

function TextStylerNoText({
	element,
	label,
}: {
	element: TextElement | TextElement[]
	label: string
}) {
	return (
		<div className="flex justify-between items-center">
			<p className="font-medium">{label}</p>
			<StyleEditor element={element} />
		</div>
	)
}

function StyleEditor({ element }: { element: TextElement | TextElement[] }) {
	return (
		<Styler>
			<TypographyEditor element={element} simple />
			<SpacingEditor element={element} />
		</Styler>
	)
}
