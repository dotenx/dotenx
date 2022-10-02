import { Button, MultiSelect, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { z } from 'zod'
import { createDesignSystem, QueryKey } from '../../api'
import { projectTagAtom } from '../page/top-bar'
import { useComponents } from './use-components'

const designSystemSchema = z.object({
	name: z.string().min(1),
	components: z.array(z.string()),
})

type DesignSystemSchema = z.infer<typeof designSystemSchema>

export function DesignSystemForm() {
	const form = useForm<DesignSystemSchema>({ initialValues: { name: '', components: [] } })
	const projectTag = useAtomValue(projectTagAtom)
	const { components } = useComponents()
	const queryClient = useQueryClient()
	const createMutation = useMutation(createDesignSystem, {
		onSuccess: () => {
			closeAllModals()
			queryClient.invalidateQueries([QueryKey.DesignSystems])
		},
	})
	const handleSubmit = form.onSubmit((values) => {
		const content = components.filter((c) => values.components.includes(c.name))
		createMutation.mutate({
			projectTag,
			payload: { name: values.name, content },
		})
	})

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<TextInput
				label="Name"
				placeholder="Design system name"
				{...form.getInputProps('name')}
			/>
			<MultiSelect
				label="Components"
				{...form.getInputProps('components')}
				data={components.map((c) => c.name)}
			/>
			<Button fullWidth type="submit" loading={createMutation.isLoading}>
				{createMutation.isLoading ? 'Creating' : 'Create'}
			</Button>
		</form>
	)
}
