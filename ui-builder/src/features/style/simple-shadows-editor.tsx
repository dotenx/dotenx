import { Select } from '@mantine/core'
import { useEditStyle } from './use-edit-style'

const shadows = [
	{
		label: 'extra small',
		value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
	},
	{
		label: 'small',
		value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
	},
	{
		label: 'medium',
		value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);',
	},
	{
		label: 'large',
		value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
	},
	{
		label: 'extra large',
		value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
	},
]

export function SimpleShadowsEditor() {
	const { style: styles, editStyle } = useEditStyle()

	return (
		<Select
			size="xs"
			label="Shadow"
			allowDeselect
			clearable
			data={shadows}
			value={styles.boxShadow}
			onChange={(value) => editStyle('boxShadow', value ?? '')}
		/>
	)
}
