import { Menu, NumberInput, Popover, Text } from '@mantine/core'
import _ from 'lodash'
import { useState } from 'react'

export const getStyleNumber = (style?: string) => {
	const unit = (style?.replace(/[0-9]/g, '') as Unit) ?? 'auto'
	const number = (style ? _.parseInt(style.replace(unit, '')) : 0) || 0
	return number
}

const units = ['px', 'rem', 'em', '%', 'vw', 'vh', 'auto'] as const
type Unit = typeof units[number]

export function InputWithUnit({
	label,
	value,
	onChange,
	title,
	placeholder,
}: {
	label?: string
	value?: string
	onChange: (value: string) => void
	title?: string
	placeholder?: string
}) {
	const unit = (value?.replace(/[0-9.]/g, '') as Unit) ?? 'auto'
	const number = (value ? parseFloat(value.replace(unit, '')) : 0) || 0
	const [opened, setOpened] = useState(false)

	const unitSection = (
		<Menu shadow="sm" opened={opened} onChange={setOpened}>
			<Menu.Target>
				<button className="bg-gray-50 uppercase text-[10px] font-medium flex items-center justify-center rounded hover:bg-gray-100 px-px">
					{unit}
				</button>
			</Menu.Target>
			<Menu.Dropdown p={0}>
				<div>
					{units.map((unit) => (
						<button
							key={unit}
							onClick={() => {
								setOpened(false)
								if (unit === 'auto') onChange('auto')
								else onChange(number + unit)
							}}
							className="px-2 py-0.5 w-full hover:bg-gray-100"
						>
							{unit}
						</button>
					))}
				</div>
			</Menu.Dropdown>
		</Menu>
	)

	return (
		<div className="flex items-center gap-3">
			{label && (
				<Text className="whitespace-nowrap" weight={500}>
					{label}
				</Text>
			)}
			<NumberInput
				size="xs"
				value={unit === 'auto' ? undefined : number}
				onChange={(newValue) => {
					if (unit === 'auto') onChange(newValue + 'px')
					else onChange((newValue ?? '0') + unit)
				}}
				rightSection={unitSection}
				title={title}
				placeholder={placeholder}
				className="w-full"
			/>
		</div>
	)
}

export function MarginPaddingInput({
	value,
	onChange,
}: {
	value: string
	onChange: (value: string) => void
}) {
	const isZero = value === '0px'

	return (
		<Popover shadow="sm" withArrow position="left" withinPortal trapFocus>
			<Popover.Target>
				<button className="self-center w-[6ch] no-scrollbar overflow-auto">
					{isZero ? 0 : value}
				</button>
			</Popover.Target>
			<Popover.Dropdown p="xs">
				<InputWithUnit value={value} onChange={onChange} />
			</Popover.Dropdown>
		</Popover>
	)
}
