import { Button, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import { useAtom } from 'jotai'
import { usePageData, useUpdatePage } from '../page/use-update'
import { fontsAtom } from './typography-editor'

export function FontForm({ fontName }: { fontName: string }) {
	const [fonts, setFonts] = useAtom(fontsAtom)
	const form = useForm({ initialValues: { url: '' } })
	const pageData = usePageData()
	const updateMutation = useUpdatePage()

	return (
		<form
			onSubmit={form.onSubmit((values) => {
				updateMutation.mutate(
					{ ...pageData, fonts: { ...fonts, [fontName]: values.url } },
					{
						onSuccess: () => {
							setFonts((fonts) => ({ ...fonts, [fontName]: form.values.url }))
							closeAllModals()
						},
					}
				)
			})}
		>
			<TextInput label="Font URL" {...form.getInputProps('url')} />
			<Button mt="xl" type="submit" loading={updateMutation.isLoading} fullWidth>
				Add
			</Button>
		</form>
	)
}
