import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button, Form, Select } from '../ui'

const triggers = ['failed', 'completed'] as const
export type EdgeCondition = typeof triggers[number]
const options = triggers.map((option) => ({ label: option, value: option }))

const schema = z.object({
	triggers: z.string().array().optional(),
})

interface Schema {
	triggers: EdgeCondition[]
}

interface EdgeSettingsProps {
	defaultValues: Schema
	onSave: (values: Schema) => void
}

export function EdgeSettings({ defaultValues, onSave }: EdgeSettingsProps) {
	const {
		control,
		formState: { errors },
		handleSubmit,
	} = useForm<Schema>({ resolver: zodResolver(schema), defaultValues })

	return (
		<Form className="h-full" onSubmit={handleSubmit(onSave)}>
			<h2 className="text-2xl">Edge Settings</h2>
			<div className="flex flex-col gap-5 grow">
				<Select
					label="Triggers"
					name="triggers"
					control={control}
					options={options}
					errors={errors}
					isMulti
				/>
			</div>
			<Button type="submit">Save</Button>
		</Form>
	)
}
