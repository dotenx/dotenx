import { IoTrash } from 'react-icons/io5'
import { Button, ButtonProps } from './button'

export function DeleteButton(props: ButtonProps) {
	return (
		<Button {...props} className="ml-auto" type="button" variant="icon">
			<IoTrash />
		</Button>
	)
}
