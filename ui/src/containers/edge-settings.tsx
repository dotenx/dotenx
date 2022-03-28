/** @jsxImportSource @emotion/react */
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '../components/button'
import { Form } from '../components/form'
import { Select } from '../components/select'

const triggers = ['failed', 'completed'] as const
export type Trigger = typeof triggers[number]
const options = triggers.map((option) => ({ label: option, value: option }))

const schema = z.object({
	triggers: z.string().array().optional(),
})

interface Schema {
	triggers: Trigger[]
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
		<Form css={{ height: '100%' }} onSubmit={handleSubmit(onSave)}>
			<h2>Edge Settings</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
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
