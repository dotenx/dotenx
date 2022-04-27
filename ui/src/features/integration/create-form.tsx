import { useState } from 'react'
import { Button, Field, Form, NewSelect, Toggle } from '../ui'
import { useNewIntegration } from './use-create-form'

export function NewIntegration() {
	const { control, errors, integrationKindOptions, integrationTypeFields, oauth, onSubmit } =
		useNewIntegration()
	const [isAdvanced, setIsAdvanced] = useState(false)

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<Toggle
					className="self-end"
					checked={isAdvanced}
					onClick={() => setIsAdvanced((isAdvanced) => !isAdvanced)}
					label="Advanced"
				/>
				<Field
					label="Name"
					name="name"
					placeholder="Integration name"
					control={control}
					errors={errors}
				/>
				<NewSelect
					label="Type"
					name="type"
					control={control}
					errors={errors}
					options={integrationKindOptions}
					placeholder="Integration type"
				/>
				{!isAdvanced && integrationTypeFields?.oauth_provider && (
					<Button
						type="button"
						className="self-end w-24 text-sm"
						onClick={() => oauth.connect(integrationTypeFields.oauth_provider)}
					>
						Connect
					</Button>
				)}
				{integrationTypeFields?.secrets
					.filter(({ key }) =>
						isAdvanced || !integrationTypeFields.oauth_provider
							? true
							: key !== 'ACCESS_TOKEN' && key !== 'REFRESH_TOKEN'
					)
					.map((field) => (
						<Field
							key={field.key}
							label={field.name}
							name={`secrets.${field.key}`}
							control={control}
							required
							errors={errors}
						/>
					))}
			</div>
			<Button type="submit">Add</Button>
		</Form>
	)
}
