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

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<h2 className="text-2xl">New integration</h2>
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
				{integrationTypeFields?.oauth_provider && (
					<Button
						type="button"
						className="text-sm h8"
						onClick={() => oauth.connect(integrationTypeFields.oauth_provider)}
					>
						Connect
					</Button>
				)}
				{integrationTypeFields?.secrets.map((field) => (
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
