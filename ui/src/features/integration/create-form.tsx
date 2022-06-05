import { useState } from 'react'
import { IoArrowBack } from 'react-icons/io5'
import { Button, Field, Form, NewSelect, Toggle } from '../ui'
import { useNewIntegration } from './use-create-form'

interface NewIntegrationProps {
	integrationKind?: string
	onSuccess?: (addedIntegrationName: string) => void
	onBack?: () => void
}

export function NewIntegration({ integrationKind, onSuccess, onBack }: NewIntegrationProps) {
	const { control, errors, integrationKindOptions, integrationTypeFields, oauth, onSubmit } =
		useNewIntegration({ integrationKind, onSuccess })
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
					/>
				)}
				{!isAdvanced && integrationTypeFields?.oauth_provider && (
					<Button
						type="button"
						disabled={oauth.isSuccess}
						className="self-end w-24 text-sm disabled:text-green-600 disabled:bg-green-100"
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
			<Button type="submit">Add</Button>
		</Form>
	)
}

function isTokenKey(key: string): unknown {
	return key !== 'ACCESS_TOKEN' && key !== 'REFRESH_TOKEN' && key !== 'ACCESS_TOKEN_SECRET'
}
