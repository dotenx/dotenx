import { IoTrash } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { deleteProject } from '../../api'
import { Button } from '../ui'

export function ProjectDeletion({ name }: { name: string }) {
	const navigate = useNavigate()
	const deleteMutation = useMutation(() => deleteProject(name), {
		onSuccess: () => {
			navigate('/builder/projects', { replace: true })
		},
	})

	return (
		<Button
			variant="outlined"
			type="button"
			onClick={() => deleteMutation.mutate()}
			loading={deleteMutation.isLoading}
		>
			<IoTrash />
			Delete Project
		</Button>
	)
}
