import { Button, TextInput } from "@mantine/core"
import _ from "lodash"
import { Controller, useForm } from "react-hook-form"
import { useMutation, useQuery } from "react-query"
import { useParams } from "react-router-dom"
import {
	FieldType,
	getInteractionEndpointFields,
	QueryKey,
	startAutomation,
	StartAutomationRequest,
} from "../../api"
import { AUTOMATION_PROJECT_NAME } from "../../pages/automation"
import { Modals, useModal } from "../hooks"
import { Form, Loader } from "../ui"
import { ComplexField } from "../ui/complex-field"
import { JsonEditorInput } from "../ui/json-editor-input"

export function RunInteractionForm({ interactionName }: { interactionName: string }) {
	const modal = useModal()
	const form = useForm()
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const mutation = useMutation(
		(values: StartAutomationRequest) =>
			startAutomation({ automationName: interactionName, projectName, payload: values }),
		{ onSuccess: (data) => modal.open(Modals.InteractionResponse, data.data) }
	)
	const query = useQuery(
		[QueryKey.GetInteractionEndpointFields, interactionName],
		() => getInteractionEndpointFields({ interactionName, projectName }),
		{ enabled: !!interactionName }
	)

	if (query.isLoading) return <Loader />
	const fields = _.toPairs(query.data?.data).flatMap(([taskName, fields]) =>
		fields.map((field) => ({ name: `${taskName}.${field.key}`, value: field }))
	)
	const onSubmit = form.handleSubmit((values) => {
		const types = query.data?.data || {}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		function compactObject(data: any) {
			if (typeof data !== "object") {
				return data as any
			}

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return Object.keys(data).reduce(function (accumulator, key) {
				const isObject = typeof data[key] === ("object" as string)
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const value = isObject ? compactObject(data[key]) : data[key]
				const isEmptyObject = isObject && !Object.keys(value).length
				if (value === undefined || isEmptyObject || "") {
					return accumulator
				}
				return Object.assign(accumulator, { [key]: value })
			}, {})
		}

		const toSendWithoutUndefined = compactObject(values)

		const defaults = {} as any

		Object.keys(types).map((key) => {
			defaults[key] = types[key].reduce((acc, { key, type }) => {
				if (type === "text") {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					acc[key] = ""
				} else if (type === "object") {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					acc[key] = {}
				}
				return acc
			}, {})
		})

		const merged = Object.keys(defaults).reduce((acc, key) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			acc[key] = { ...defaults[key], ...toSendWithoutUndefined[key] }

			return acc
		}, {})

		mutation.mutate({ interactionRunTime: merged })
	})
	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				{fields.map((field) => {
					return getFieldComponentRun({
						kind: field.value.type,
						key: `others.${field.value.key}`,
						control: form.control,
						errors: form.formState.errors,
						label: field.name,
						name: field.name,
					})
				})}
			</div>
			<Button loading={mutation.isLoading} type="submit">
				Run
			</Button>
		</Form>
	)
}

const getFieldComponentRun = (props: any) => {
	switch (props.kind) {
		case FieldType.Text:
			return (
				<div key={props.key}>
					<Controller
						control={props.control}
						name={props.name}
						render={({ field: { onChange, value } }) => (
							<TextInput value={value ?? ""} {...props} onChange={onChange} />
						)}
					/>
				</div>
			)
		case FieldType.Object:
			return (
				<div key={props.key}>
					<JsonEditorInput simpleInput {...props} />
				</div>
			)

		default:
			return null
	}
}
