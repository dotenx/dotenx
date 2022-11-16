import { Autocomplete, Button, CloseButton, TextInput } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import cssProperties from 'known-css-properties'
import _ from 'lodash'
import { CSSProperties, useState } from 'react'
import { TbPlus } from 'react-icons/tb'
import { CollapseLine } from '../ui/collapse-line'
import { useEditStyle } from './use-edit-style'

export const normalizedCssProperties = cssProperties.all
	.map((property) =>
		property
			.split('-')
			.map((part, index) => (index !== 0 ? _.capitalize(part) : part))
			.join('')
	)
	.filter((property) => !property.includes('Epub'))
	.filter((property) => !property.includes('Webkit'))

export function CssPropertiesEditor() {
	const { style, editStyle } = useEditStyle()
	const styles = _.toPairs(style).filter(([, value]) => value !== undefined)
	const [isAdding, setIsAdding] = useState(false)

	return (
		<CollapseLine label="CSS Properties" defaultClosed>
			<div>
				<div className="space-y-4">
					{styles.map(([property, value]) => (
						<StyleInput
							key={property}
							property={property}
							value={value}
							onChangeProperty={(property, prev) =>
								editStyle(property as keyof CSSProperties, value, prev)
							}
							onChangeValue={(value) =>
								editStyle(property as keyof CSSProperties, value)
							}
							onDelete={() => editStyle(property as keyof CSSProperties, null)}
						/>
					))}
					{isAdding && (
						<StyleInput
							property={''}
							value={''}
							onDelete={() => setIsAdding(false)}
							onChangeProperty={(property) => {
								editStyle(property as keyof CSSProperties, '')
								setIsAdding(false)
							}}
							onChangeValue={() => null}
						/>
					)}
				</div>

				<Button leftIcon={<TbPlus />} onClick={() => setIsAdding(true)} size="xs" mt="md">
					Property
				</Button>
			</div>
		</CollapseLine>
	)
}

function StyleInput({
	property,
	value,
	onChangeProperty,
	onChangeValue,
	onDelete,
}: {
	property: string
	value: string
	onChangeProperty: (property: string, prev: string) => void
	onChangeValue: (value: string) => void
	onDelete: () => void
}) {
	const [newStyle, setNewStyle] = useInputState(property)

	return (
		<div className="flex items-center gap-2">
			<Autocomplete
				data={normalizedCssProperties}
				size="xs"
				value={newStyle}
				onChange={setNewStyle}
				onBlur={() => (newStyle ? onChangeProperty(newStyle, property) : null)}
			/>
			<TextInput
				size="xs"
				value={value ?? ''}
				onChange={(event) => onChangeValue(event.target.value)}
			/>
			<CloseButton size="xs" onClick={onDelete} />
		</div>
	)
}
