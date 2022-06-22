import { IoTrash } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { deleteTable } from '../../api'
import { Button } from '../ui'

interface TableDeletionProps {
	projectName: string
	tableName: string
}

export function TableDeletion({ projectName, tableName }: TableDeletionProps) {
	const deleteMutation = useMutation(() => deleteTable(projectName, tableName))

	return (
		<Button
			className="w-40"
			type="button"
			variant="outlined"
			onClick={() => deleteMutation.mutate()}
			loading={deleteMutation.isLoading}
		>
			<IoTrash className="text-lg" />
			Delete Table
		</Button>
	)
}
