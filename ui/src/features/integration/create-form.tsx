/** @jsxImportSource @emotion/react */
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
		<Form css={{ height: '100%' }} onSubmit={onSubmit}>
			<h2>New integration</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
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
						css={{ height: 30, fontSize: 14 }}
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
