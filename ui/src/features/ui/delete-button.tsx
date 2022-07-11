import { ActionIcon, ActionIconProps } from '@mantine/core'
import { IoTrash } from 'react-icons/io5'

export function DeleteButton(props: ActionIconProps<'button'>) {
	return (
		<ActionIcon {...props} className="ml-auto" type="button">
			<IoTrash />
		</ActionIcon>
	)
}
