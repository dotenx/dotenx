import { Button, Switch, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { createView, Filters } from '../../api'

export function ViewForm({
	filters,
	projectName,
	tableName,
	columns,
}: {
	filters: Filters
	projectName: string
	tableName: string
	columns: { name: string; type: string }[]
}) {
	const navigate = useNavigate()
	const mutation = useMutation(createView)
	const form = useForm({ initialValues: { isPublic: false, viewName: '' } })
	const onSubmit = form.onSubmit((values) =>
		mutation.mutate(
			{
				viewName: values.viewName,
				isPublic: values.isPublic,
				projectName,
				tableName,
				filters,
				columns: columns.map((column) => column.name),
			},
			{
				onSuccess: (data, variables) => {
					closeAllModals()
					navigate(`/builder/projects/${projectName}/views/${variables.viewName}`)
				},
			}
		)
	)

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<TextInput label="View name" {...form.getInputProps('viewName')} />
			<Switch label="Public" {...form.getInputProps('isPublic')} />
			<Button type="submit" loading={mutation.isLoading}>
				Create View
			</Button>
		</form>
	)
}
