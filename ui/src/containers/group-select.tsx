import styled from '@emotion/styled'
import { Fragment, useState } from 'react'
import { Control, Controller, FieldErrors, useController } from 'react-hook-form'
import { BsChevronDown } from 'react-icons/bs'
import { FieldError } from '../features/ui'

const Wrapper = styled.div({ position: 'relative' })

const SelectBox = styled.button<{ invalid: boolean }>(({ theme, invalid }) => ({
	border: '1px solid',
	borderColor: invalid ? theme.color.negative : theme.color.text,
	borderRadius: 4,
	padding: '5px 4px',
	width: '100%',
	cursor: 'pointer',
	textAlign: 'start',
	backgroundColor: 'white',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
}))

const Placeholder = styled.span<{ invalid: boolean }>(({ theme, invalid }) => ({
	color: (invalid ? theme.color.negative : theme.color.text) + 'aa',
}))

const OptionsWrapper = styled.div({
	position: 'absolute',
	border: '1px solid black',
	borderRadius: 4,
	padding: '4px 0',
	marginTop: 6,
	backgroundColor: 'white',
	zIndex: 10,
	left: 0,
	right: 0,
})

const GroupName = styled.div({
	fontSize: 14,
	color: 'gray',
	paddingLeft: 4,
	':not(:first-of-type)': {
		paddingTop: 10,
	},
})

const OptionBox = styled.button(({ theme }) => ({
	padding: 6,
	display: 'flex',
	border: 'none',
	backgroundColor: theme.color.background,
	width: '100%',
	cursor: 'pointer',
	alignItems: 'center',
	gap: 10,
	':hover': {
		backgroundColor: theme.color.text,
		color: theme.color.background,
	},
}))

const GroupSelectWrapper = styled.div({ display: 'flex', flexDirection: 'column', gap: 2 })

const Label = styled.span<{ error?: FieldErrors }>({ fontSize: 14 }, (props) => ({
	color: props.error ? props.theme.color.negative : props.theme.color.text,
}))

const Icon = styled.img({
	width: 20,
	height: 20,
})

const SelectContent = styled.div({
	display: 'flex',
	alignItems: 'center',
	gap: 10,
})

export interface GroupSelectOption {
	value: string
	label: string
	iconUrl?: string
}

interface GroupSelectProps {
	name: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	options: GroupOption[]
	errors?: FieldErrors
	placeholder: string
}

export function GroupSelect({ control, name, options, errors, placeholder }: GroupSelectProps) {
	const {
		fieldState: { error },
	} = useController({ name: name, control })

	return (
		<GroupSelectWrapper>
			<Label error={error}>Type</Label>
			<ControlledGroupSelect
				name={name}
				control={control}
				options={options}
				placeholder={placeholder}
			/>
			{name && errors && <FieldError errors={errors} name={name} />}
		</GroupSelectWrapper>
	)
}

export function ControlledGroupSelect({ control, name, options, placeholder }: GroupSelectProps) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value }, fieldState: { invalid } }) => {
				return (
					<GroupSelectInner
						onChange={(newValue) => onChange(newValue.value)}
						value={options
							.map((group) => group.options)
							.flat()
							.find((option) => option.value === value)}
						options={options}
						invalid={invalid}
						placeholder={placeholder}
					/>
				)
			}}
		/>
	)
}

interface GroupOption {
	group: string
	options: GroupSelectOption[]
}

interface GroupSelectInnerProps {
	value?: GroupSelectOption
	onChange: (value: GroupSelectOption) => void
	options: GroupOption[]
	invalid: boolean
	placeholder: string
}

function GroupSelectInner({
	value,
	onChange,
	options,
	invalid,
	placeholder,
}: GroupSelectInnerProps) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Wrapper>
			<SelectBox
				type="button"
				onClick={() => setIsOpen((isOpen) => !isOpen)}
				invalid={invalid}
			>
				{value ? (
					<SelectContent>
						{value.iconUrl && <Icon src={value.iconUrl} alt="" />}
						{value.label}
					</SelectContent>
				) : (
					<Placeholder invalid={invalid}>{placeholder}</Placeholder>
				)}
				<BsChevronDown />
			</SelectBox>

			{isOpen && (
				<OptionsWrapper>
					{options.map((group, index) => (
						<Fragment key={index}>
							<GroupName>{group.group}</GroupName>
							{group.options.map((option, index) => (
								<OptionBox
									key={index}
									type="button"
									onClick={() => {
										onChange(option)
										setIsOpen(false)
									}}
								>
									{option.iconUrl && <Icon src={option.iconUrl} alt="" />}
									{option.label}
								</OptionBox>
							))}
						</Fragment>
					))}
				</OptionsWrapper>
			)}
		</Wrapper>
	)
}
