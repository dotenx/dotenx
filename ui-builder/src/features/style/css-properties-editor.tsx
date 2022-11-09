import { Button, CloseButton, Select, TextInput } from '@mantine/core'
import cssProperties from 'known-css-properties'
import _ from 'lodash'
import { CSSProperties } from 'react'
import { TbPlus } from 'react-icons/tb'
import { CollapseLine } from '../ui/collapse-line'
import { useEditStyle } from './use-edit-style'

export const normalizedCssProperties = cssProperties.all.map((property) =>
	property
		.split('-')
		.map((part, index) => (index !== 0 ? _.capitalize(part) : part))
		.join('')
)

export function CssPropertiesEditor() {
	const { style, editStyle } = useEditStyle()
	const styles = _.toPairs(style).filter(([, value]) => value !== undefined)
	styles.sort(([a], [b]) => a.localeCompare(b))

	return (
		<CollapseLine label="CSS Properties" defaultClosed>
			<div>
				<div className="space-y-4">
					{styles.map(([property, value]) => (
						<div className="flex items-center gap-2" key={property}>
							<Select
								searchable
								creatable
								data={normalizedCssProperties}
								size="xs"
								value={property ?? ''}
								onChange={(newProperty) =>
									editStyle((newProperty ?? '') as keyof CSSProperties, value)
								}
							/>
							<TextInput
								size="xs"
								value={value ?? ''}
								onChange={(event) =>
									editStyle(property as keyof CSSProperties, event.target.value)
								}
							/>
							<CloseButton
								size="xs"
								onClick={() =>
									editStyle(property as keyof CSSProperties, undefined as any)
								}
							/>
						</div>
					))}
				</div>
				<Button
					leftIcon={<TbPlus />}
					onClick={() => editStyle('' as any, '')}
					size="xs"
					mt="md"
				>
					Property
				</Button>
			</div>
		</CollapseLine>
	)
}
