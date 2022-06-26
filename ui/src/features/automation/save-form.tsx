import * as z from 'zod'
import { AutomationKind } from '../../api'
import { Button, Field, Form } from '../ui'
import { useSaveForm } from './use-save'

export const saveFormSchema = z.object({
	name: z.string().min(1),
})

export type SaveFormSchema = z.infer<typeof saveFormSchema>

export function SaveForm({ kind }: { kind: AutomationKind }) {
	const { control, errors, onSubmit, addAutomationMutation } = useSaveForm(kind)

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<Field name="name" label="Automation name" control={control} errors={errors} />
			</div>
			<Button loading={addAutomationMutation.isLoading} type="submit">
				Save
			</Button>
		</Form>
	)
}
