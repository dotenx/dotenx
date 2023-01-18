import { Button } from "@mantine/core"
import { FieldErrors, FieldPath, FieldValues, UseControllerProps } from "react-hook-form"
import { useQuery } from "react-query"
import { getIntegrationsByKinds, QueryKey } from "../../api"
import { NewSelect } from "../ui"

interface SelectIntegrationProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
	errors: FieldErrors<TFieldValues>
	integrationTypes: string[]
	onAddIntegration?: () => void
}

export function SelectIntegration<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({
	control,
	errors,
	integrationTypes,
	onAddIntegration,
	name,
}: SelectIntegrationProps<TFieldValues, TName>) {
	const integrationQuery = useQuery(
		[QueryKey.GetIntegrationsByType, integrationTypes],
		() => getIntegrationsByKinds(integrationTypes),
		{ enabled: !!integrationTypes }
	)
	const availableIntegrations = integrationQuery?.data?.data ?? []

	return (
		<div className="flex items-end gap-4">
			<div className="grow shrink-0">
				<NewSelect
					label="Integration"
					name={name}
					control={control}
					errors={errors}
					options={availableIntegrations.map((integration) => ({
						label: integration.name,
						value: integration.name,
					}))}
					placeholder="Integration name"
					loading={integrationQuery.isLoading}
				/>
			</div>
			{onAddIntegration && (
				<Button type="button" onClick={onAddIntegration}>
					New
				</Button>
			)}
		</div>
	)
}
