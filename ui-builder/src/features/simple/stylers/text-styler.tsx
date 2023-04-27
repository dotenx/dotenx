import { ActionIcon, TextInput } from '@mantine/core'
import { closeAllModals, openModal } from '@mantine/modals'
import _ from 'lodash'
import { TbEdit } from 'react-icons/tb'
import { useSetWithElement } from '../../elements/elements-store'
import { TextElement } from '../../elements/extensions/text'
import { Expression } from '../../states/expression'
import { DisplayEditor } from '../../style/display-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { TextEditor } from '../../ui/text-editor'
import { Styler } from './styler'

export function TextStyler({
	label,
	element,
	placeholder,
	noText,
	onChange,
	rich,
	textOnly,
}: {
	label: string
	element: TextElement | TextElement[]
	placeholder?: string
	noText?: boolean
	onChange?: (text: string) => void
	rich?: boolean
	textOnly?: boolean
}) {
	if (noText) return <TextStylerNoText label={label} element={element} />

	return (
		<TextStylerWithText
			label={label}
			element={_.isArray(element) ? element[0] : element}
			placeholder={placeholder}
			onChange={onChange}
			rich={rich}
			textOnly={textOnly}
		/>
	)
}

function TextStylerWithText({
	label,
	element,
	placeholder,
	onChange,
	rich,
	textOnly,
}: {
	label: string
	element: TextElement
	placeholder?: string
	onChange?: (text: string) => void
	rich?: boolean
	textOnly?: boolean
}) {
	const set = useSetWithElement(element)
	const setText = (text: string) => {
		set((draft) => (draft.data.text = Expression.fromString(text)))
	}

	const value = element.data.text.toString()
	const isHtml = value.startsWith('<') && value.endsWith('>')

	const openEditor = () => {
		closeAllModals()
		openModal({
			children: (
				<TextEditor
					onSave={(html) => {
						set((draft) => {
							draft.data.text = Expression.fromString(html)
							draft.data.raw = true
						})
						onChange?.(html)
					}}
					content={value}
				/>
			),
			size: 'xl',
		})
	}

	return (
		<TextInput
			size="xs"
			label={label}
			name={label}
			placeholder={placeholder}
			value={isHtml ? 'Open editor to edit' : value}
			onClick={isHtml ? openEditor : undefined}
			readOnly={isHtml}
			onChange={(event) => {
				setText(event.target.value)
				onChange?.(event.target.value)
			}}
			rightSection={
				textOnly ? null : rich ? (
					<div className="flex gap-1 bg-white">
						<ActionIcon size="xs" onClick={openEditor}>
							<TbEdit size={12} />
						</ActionIcon>
						<StyleEditor element={element} />
					</div>
				) : (
					<StyleEditor element={element} />
				)
			}
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
			<TypographyEditor element={element} />
			<SpacingEditor element={element} />
			<DisplayEditor element={element} />
		</Styler>
	)
}
