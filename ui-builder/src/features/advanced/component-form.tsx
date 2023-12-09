import { Button, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { z } from 'zod'
import { createComponent, QueryKey } from '../../api'
import { Element } from '../elements/element'
import { Style } from '../elements/style'
import { projectTagAtom } from '../page/top-bar'
import { useClassesStore } from '../style/classes-store'

const componentSchema = z.object({
	name: z.string().min(2),
})

type ComponentSchema = z.infer<typeof componentSchema>

export function ComponentForm({ element }: { element: Element }) {
	const form = useForm<ComponentSchema>({
		initialValues: { name: '' },
		validate: zodResolver(componentSchema),
	})

	const queryClient = useQueryClient()
	const mutation = useMutation(createComponent, {
		onSuccess: () => {
			closeAllModals()
			queryClient.invalidateQueries([QueryKey.Components])
		},
	})
	const projectTag = useAtomValue(projectTagAtom)
	const classes = useClassesStore((store) => store.classes)
	const convertedClasses = _.toPairs(classes)
		.filter(([className]) => element.classes.includes(className))
		.map(([, value]) => value)
		.reduce<Style>(mergeStyles, { desktop: {}, tablet: {}, mobile: {} })

	const newComponent = produce(element, (draft) => {
		draft.style = mergeStyles(convertedClasses, draft.style)
		draft.classes = []
	})
	const handleSubmit = form.onSubmit((values) => {
		mutation.mutate({
			projectTag,
			payload: {
				name: values.name,
				content: newComponent,
			},
		})
	})

	return (
		<form onSubmit={handleSubmit}>
			<TextInput label="Name" placeholder="Component name" {...form.getInputProps('name')} />
			<Button fullWidth mt="xl" type="submit" loading={mutation.isLoading}>
				{mutation.isLoading ? 'Creating' : 'Create'}
			</Button>
		</form>
	)
}

const mergeStyles = (first: Style, second: Style) => {
	return {
		desktop: {
			default: { ...first.desktop?.default, ...second.desktop?.default },
			hover: { ...first.desktop?.hover, ...second.desktop?.hover },
			focus: { ...first.desktop?.focus, ...second.desktop?.focus },
		},
		tablet: {
			default: { ...first.tablet?.default, ...second.tablet?.default },
			hover: { ...first.tablet?.hover, ...second.tablet?.hover },
			focus: { ...first.tablet?.focus, ...second.tablet?.focus },
		},
		mobile: {
			default: { ...first.mobile?.default, ...second.mobile?.default },
			hover: { ...first.mobile?.hover, ...second.mobile?.hover },
			focus: { ...first.mobile?.focus, ...second.mobile?.focus },
		},
	}
}
