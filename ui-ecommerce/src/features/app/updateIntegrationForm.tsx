import { Button } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { IoChevronBackSharp } from "react-icons/io5"
import { getIntegrationDetails, QueryKey } from "../../api"
import { useNewIntegration } from "../hooks/use-create-form"
import { Field, Form, Loader, NewSelect, Toggle } from "../ui"

interface IntegrationFormProps {
	name: string
	integrationKind?: string
	onSuccess?: (addedIntegrationName: string) => void
	onBack?: () => void
}

export function UpdateIntegrationForm({
	name,
	integrationKind,
	onSuccess,
	onBack,
}: IntegrationFormProps) {
	const {
		control,
		errors,
		integrationTypeFields,
		oauth,
		onSubmit,
		isSubmitting,
		integrationTypeFieldsQuery,
	} = useNewIntegration({ integrationKind, onSuccess, update: true, integrationName: name })
	const [isAdvanced, setIsAdvanced] = useState(false)
	const hasOauth = integrationTypeFields?.oauth_provider
	const { data, isLoading } = useQuery([QueryKey.GetIntegrationDetails, name], () =>
		getIntegrationDetails(name)
	)
	const email = data?.data?.email
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
				<div className="border border-gray-300 -mt-2 bg-gray-50 p-2 text-sm rounded space-y-1">
					<div>
						Name: <span className="text-cyan-800">{name}</span>
					</div>
					<div className="flex items-center gap-x-1">
						Email:{" "}
						<span className="text-cyan-800">
							{isLoading ? (
								<div className="bg-gray-200 animate-pulse h-5 w-32 rounded"></div>
							) : email ? (
								email
							) : (
								"N/A"
							)}
						</span>
					</div>
				</div>
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
				<Button size="sm" onClick={onSubmit} loading={isSubmitting}>
					Update
				</Button>
			</div>
		</Form>
	)
}

function isTokenKey(key: string): unknown {
	return key !== "ACCESS_TOKEN" && key !== "REFRESH_TOKEN" && key !== "ACCESS_TOKEN_SECRET"
}
