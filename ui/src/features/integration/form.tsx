import { useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { Button, Field, Form, Loader, NewSelect, Toggle } from '../ui'
import { useNewIntegration } from './use-create-form'

interface IntegrationFormProps {
	integrationKind?: string
	onSuccess?: (addedIntegrationName: string) => void
	onBack?: () => void
}

export function IntegrationForm({ integrationKind, onSuccess, onBack }: IntegrationFormProps) {
	const {
		control,
		errors,
		integrationKindOptions,
		integrationTypeFields,
		oauth,
		onSubmit,
		isSubmitting,
		integrationTypesQuery,
		integrationTypeFieldsQuery,
	} = useNewIntegration({ integrationKind, onSuccess })
	const [isAdvanced, setIsAdvanced] = useState(false)
	const hasOauth = integrationTypeFields?.oauth_provider

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<div className="flex items-center justify-between">
					{integrationKind && (
						<button type="button" onClick={onBack}>
							<IoArrowBack />
						</button>
					)}
					{hasOauth && (
						<Toggle
							className="ml-auto"
							checked={isAdvanced}
							onClick={() => setIsAdvanced((isAdvanced) => !isAdvanced)}
							label="Advanced"
						/>
					)}
				</div>
				<Field
					label="Name"
					name="name"
					placeholder="Integration name"
					control={control}
					errors={errors}
				/>
				{!integrationKind && (
					<NewSelect
						label="Type"
						name="type"
						control={control}
						errors={errors}
						options={integrationKindOptions}
						placeholder="Integration type"
						loading={integrationTypesQuery.isLoading}
					/>
				)}
				{integrationTypeFieldsQuery.isLoading && <Loader className="py-2" />}
				{!isAdvanced && integrationTypeFields?.oauth_provider && (
					<Button
						type="button"
						disabled={oauth.isSuccess}
						className="self-end disabled:!border-green-100 w-24 text-sm disabled:!text-green-600 disabled:!bg-green-100"
						onClick={() => oauth.connect(integrationTypeFields.oauth_provider)}
					>
						{oauth.isSuccess ? 'Connected' : 'Connect'}
					</Button>
				)}
				{integrationTypeFields?.secrets
					.filter(({ key }) =>
						isAdvanced || !integrationTypeFields.oauth_provider ? true : isTokenKey(key)
					)
					.filter(({ internal }) => !internal)
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
			<Button type="submit" loading={isSubmitting}>
				Add
			</Button>
		</Form>
	)
}

function isTokenKey(key: string): unknown {
	return key !== 'ACCESS_TOKEN' && key !== 'REFRESH_TOKEN' && key !== 'ACCESS_TOKEN_SECRET'
}
