import { Button } from '@mantine/core'
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

	return (
		<Button
			leftIcon={<IoTrash />}
			variant="outline"
			type="button"
			size="xs"
			onClick={() => deleteMutation.mutate()}
			loading={deleteMutation.isLoading}
		>
			Delete Table
		</Button>
	)
}
