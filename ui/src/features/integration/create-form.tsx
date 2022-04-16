import { useState } from 'react'
import { Button, Field, Form, Select } from '../ui'
import { useNewIntegration } from './use-create-form'

export function NewIntegration() {
	const {
		control,
		errors,
		integrationKindOptions,
		integrationTypeFields,
		integrationTypesQuery,
		oauth,
		onSubmit,
	} = useNewIntegration()
	const [isAdvanced, setIsAdvanced] = useState(false)

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex items-center justify-between">
				<h2 className="text-2xl">New integration</h2>
				<label className="flex items-center gap-3 text-xs">
					Advanced
					<input
						checked={isAdvanced}
						onChange={() => setIsAdvanced((isAdvanced) => !isAdvanced)}
						className="bg-gray-100 rounded checked:bg-gray-900 checked:focus:bg-gray-700 checked:hover:bg-gray-700"
						type="checkbox"
					/>
				</label>
			</div>
			<div className="flex flex-col gap-5 grow">
				<Field
					label="Name"
					name="name"
					placeholder="Integration name"
					control={control}
					errors={errors}
				/>
				<Select
					label="Type"
					name="type"
					control={control}
					isLoading={integrationTypesQuery.isLoading}
					errors={errors}
					options={integrationKindOptions}
					placeholder="Integration type"
				/>
				{!isAdvanced && integrationTypeFields?.oauth_provider && (
					<Button
						type="button"
						className="text-sm h8"
						onClick={() => oauth.connect(integrationTypeFields.oauth_provider)}
					>
						Connect
					</Button>
				)}
				{integrationTypeFields?.secrets
					.filter(({ key }) =>
						isAdvanced ? true : key !== 'ACCESS_TOKEN' && key !== 'REFRESH_TOKEN'
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
