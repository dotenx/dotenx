import { Button, JsonInput, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createComponent, QueryKey } from '../../api'
import { deserializeElement } from '../../utils/deserialize'
import { useProjectStore } from '../page/project-store'

export function ImportComponent() {
	const projectTag = useProjectStore((store) => store.tag)
	const queryClient = useQueryClient()
	const createComponentMutation = useMutation(createComponent)
	const form = useForm({ initialValues: { name: '', data: '' } })

	const onSubmit = form.onSubmit((values) => {
		createComponentMutation.mutate(
			{
				payload: {
					name: values.name,
					content: deserializeElement(JSON.parse(values.data)),
				},
				projectTag,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries([QueryKey.Components])
					closeAllModals()
				},
			}
		)
	})

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<TextInput label="Name" {...form.getInputProps('name')} />
			<JsonInput
				label="Component JSON"
				autosize
				minRows={10}
				maxRows={24}
				{...form.getInputProps('data')}
			/>
			<Button type="submit" fullWidth size="xs" loading={createComponentMutation.isLoading}>
				Save
			</Button>
		</form>
	)
}
