import { Button, CloseButton, Select, Switch, TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbPlus, TbSelect } from 'react-icons/tb'
import { uuid } from '../../../utils'
import { Expression } from '../../states/expression'
import { useGetStates } from '../../states/use-get-states'
import { SingleIntelinput } from '../../ui/intelinput'
import { Element } from '../element'
import { useSetElement } from '../elements-store'

export class SelectElement extends Element {
	name = 'Select'
	icon = (<TbSelect />)
	data = {
		options: [] as Option[],
		defaultValue: new Expression(),
		name: '',
		required: false,
		optionsFromState: null as string | null,
	}

	render(): ReactNode {
		return <></>
	}

	renderOptions(): ReactNode {
		return <SelectOptions element={this} />
	}
}

type Option = {
	label: string
	value: string
	key: string
}

export function SelectOptions({ element, simple }: { element: SelectElement; simple?: boolean }) {
	const set = useSetElement()
	const { options, required } = element.data
	const states = useGetStates()

	const changeOptions = (options: Option[]) => {
		set(element, (draft) => {
			draft.data.options = options
		})
	}
	const changeName = (name: string) => {
		set(element, (draft) => {
			draft.data.name = name
		})
	}
	const changeDefaultValue = (defaultValue: Expression) => {
		set(element, (draft) => {
			draft.data.defaultValue = defaultValue
		})
	}
	const changeRequired = (required: boolean) => {
		set(element, (draft) => {
			draft.data.required = required
		})
	}

	const optionsForm = (
		<form className="space-y-4">
			{options.map((item, index) => (
				<div className="px-4 py-2 border rounded" key={item.key}>
					<CloseButton
						ml="auto"
						size="xs"
						onClick={() =>
							changeOptions(options.filter((option) => item.key !== option.key))
						}
					/>
					<TextInput
						size="xs"
						label="Label"
						mb="xs"
						value={options[index].label}
						onChange={(event) =>
							changeOptions(
								options.map((option) =>
									option.key === item.key
										? { ...option, label: event.target.value }
										: option
								)
							)
						}
					/>
					<TextInput
						size="xs"
						label="Value"
						value={options[index].value}
						onChange={(event) =>
							changeOptions(
								options.map((option) =>
									option.key === item.key
										? { ...option, value: event.target.value }
										: option
								)
							)
						}
					/>
				</div>
			))}
			<div className="flex items-center gap-2">
				<Button
					leftIcon={<TbPlus />}
					onClick={() =>
						changeOptions([...options, { label: '', value: '', key: uuid() }])
					}
					size="xs"
				>
					Option
				</Button>
				{!simple && (
					<Select
						size="xs"
						placeholder="Get options from state"
						data={states.map((state) => state.name)}
						value={element.data.optionsFromState}
						onChange={(value) =>
							set(element, (draft) => {
								draft.data.optionsFromState = value
							})
						}
					/>
				)}
			</div>
		</form>
	)

	if (simple) return optionsForm

	return (
		<div className="space-y-6">
			{optionsForm}
			<TextInput
				size="xs"
				label="Name"
				value={element.data.name}
				onChange={(event) => changeName(event.target.value)}
			/>
			<SingleIntelinput
				label="Default value"
				value={element.data.defaultValue}
				onChange={(value) => changeDefaultValue(value)}
			/>
			<Switch
				size="xs"
				label="Required"
				value={required.toString()}
				onChange={(event) => changeRequired(Boolean(event.target.value))}
			/>
		</div>
	)
}
