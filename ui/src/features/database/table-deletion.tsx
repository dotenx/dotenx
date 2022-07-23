import { Button, Popover } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IoTrash } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { deleteTable } from '../../api'

interface TableDeletionProps {
	projectName: string
	tableName: string
}

export function TableDeletion({ projectName, tableName }: TableDeletionProps) {
	const navigate = useNavigate()
	const deleteMutation = useMutation(() => deleteTable(projectName, tableName), {
		onSuccess: () => navigate(`/builder/projects/${projectName}/tables`),
	})
	const [opened, handlers] = useDisclosure(false)

	return (
		<Popover
			opened={opened}
			onClose={handlers.close}
			target={
				<Button
					leftIcon={<IoTrash />}
					variant="outline"
					type="button"
					size="xs"
					onClick={handlers.open}
					loading={deleteMutation.isLoading}
				>
					Delete Table
				</Button>
			}
			withArrow
			position="bottom"
		>
			<div className="flex flex-col gap-6">
				<p className="text-sm">Are you sure you want to delete this user table?</p>
				<Button type="button" onClick={() => deleteMutation.mutate()}>
					Confirm Delete
				</Button>
			</div>
		</Popover>
	)
}
