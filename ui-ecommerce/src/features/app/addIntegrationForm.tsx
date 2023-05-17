import { Button } from "@mantine/core"
import { useState } from "react"
import { BiPlus } from "react-icons/bi"
import { IoChevronBackSharp } from "react-icons/io5"
import { useNewIntegration } from "../hooks/use-create-form"
import { Field, Form, Loader, NewSelect, Toggle } from "../ui"

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
		<Form className="flex flex-col h-full gap-10 -mt-10">
			<div className="flex flex-col gap-5 grow">
				<div className="flex items-center justify-between">
					{integrationKind && onBack && (
						<button type="button" onClick={onBack}>
							<IoChevronBackSharp />
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
				<div className="flex items-center text-sm text-gray-600">
					<span className="capitalize px-1">{integrationKind}</span> integration
				</div>
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
						variant="default"
						type="button"
						disabled={oauth.isSuccess}
						onClick={() => oauth.connect(integrationTypeFields.oauth_provider)}
						color={oauth.isSuccess ? "green" : "rose"}
					>
						{oauth.isSuccess ? "Connected" : "Connect"}
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
							errors={errors}
						/>
					))}
			</div>
			<div className="w-full flex justify-end">
				<Button
					leftIcon={<BiPlus className=" text-white  h-5  w-5 " />}
					size="sm"
					onClick={onSubmit}
					loading={isSubmitting}
				>
					Add
				</Button>
			</div>
		</Form>
	)
}

function isTokenKey(key: string): unknown {
	return key !== "ACCESS_TOKEN" && key !== "REFRESH_TOKEN" && key !== "ACCESS_TOKEN_SECRET"
}
