import { IoTrash } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { deleteTable } from '../../api'
import { Button } from '../ui'

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
