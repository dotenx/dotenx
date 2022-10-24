import { Button, TextInput } from '@mantine/core'
import _ from 'lodash'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import {
	FieldType,
	getInteractionEndpointFields,
	QueryKey,
	startAutomation,
	StartAutomationRequest,
} from '../../api'
import { AUTOMATION_PROJECT_NAME } from '../../pages/automation'
import { Modals, useModal } from '../hooks'
import { Form, Loader } from '../ui'
import { ComplexField } from '../ui/complex-field'
import { JsonEditorInput } from '../ui/json-editor-input'

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
	const onSubmit = form.handleSubmit((values) => {
		Object.keys(values).forEach(function (key) {
			const newObj = values[key as keyof typeof values]
			Object.keys(newObj).forEach(function (key) {
				if (newObj[key as keyof typeof newObj] === undefined) {
					switch (key) {
						case 'column_values':
							newObj[key as keyof typeof newObj] = {}
							break
						case 'text':
							newObj[key as keyof typeof newObj] = ''
							break
						default:
							break
					}
				} else newObj[key as keyof typeof newObj] = newObj[key as keyof typeof newObj].data
			})
		})

		mutation.mutate({ interactionRunTime: values })
	})
	if (query.isLoading) return <Loader />
	const fields = _.toPairs(query.data?.data).flatMap(([taskName, fields]) =>
		fields.map((field) => ({ name: `${taskName}.${field.key}`, value: field }))
	)
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
					<ComplexField {...props} valueKinds={['input-or-select']} />
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
