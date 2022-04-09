/** @jsxImportSource @emotion/react */
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { BsChevronDown, BsChevronUp, BsXLg } from 'react-icons/bs'
import { fieldCss, FieldError } from './field'

interface InputOrSelectProps {
	name: string
	label: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	groups: GroupData[]
	errors: FieldErrors
}

export function InputOrSelect({ control, label, name, groups, errors }: InputOrSelectProps) {
	return (
		<div>
			<Controller
				control={control}
				name={name}
				defaultValue={{ type: 'text', data: '' }}
				render={({ field: { onChange, value } }) => (
					<InputOrSelectRaw
						onChange={onChange}
						value={value}
						label={label}
						name={name}
						groups={groups}
					/>
				)}
			/>
			<FieldError errors={errors} name={name} />
		</div>
	)
}

export interface GroupData {
	name: string
	options: string[]
	iconUrl?: string
}

export interface InputOrSelectValue {
	type: 'text' | 'option'
	data: string
	groupName?: string
	iconUrl?: string
}

interface InputOrSelectRawProps {
	name: string
	label: string
	groups: GroupData[]
	value: InputOrSelectValue
	onChange: (value: InputOrSelectValue) => void
}

function InputOrSelectRaw({ name, groups, value, onChange, label }: InputOrSelectRawProps) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const close = useCallback(() => setIsOpen(false), [])
	useOutsideClick(wrapperRef, close)
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div css={{ position: 'relative' }} ref={wrapperRef}>
			<div css={{ display: 'flex', flexDirection: 'column' }}>
				<label htmlFor={name} css={{ fontSize: 14 }}>
					{label}
				</label>
				{value.type === 'option' && (
					<SelectedData
						value={value}
						onClose={() =>
							onChange({
								type: 'text',
								data: '',
							})
						}
					/>
				)}
				{value.type === 'text' && (
					<input
						onFocus={() => setIsOpen(true)}
						id={name}
						autoComplete="off"
						name="name"
						css={fieldCss}
						value={value.data}
						onChange={(e) => onChange({ type: 'text', data: e.target.value })}
					/>
				)}
			</div>
			{isOpen && groups.length !== 0 && (
				<div
					css={(theme) => ({
						position: 'absolute',
						border: '1px solid',
						borderColor: theme.color.text,
						borderRadius: 4,
						marginTop: 4,
						left: 0,
						right: 0,
						padding: 10,
						display: 'flex',
						flexDirection: 'column',
						gap: 6,
						backgroundColor: theme.color.background,
						zIndex: 10,
						boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
					})}
				>
					{groups.map((group, index) => (
						<Group
							key={index}
							name={group.name}
							options={group.options}
							iconUrl={group.iconUrl}
							onSelect={(value) => {
								onChange({
									type: 'option',
									data: value,
									groupName: group.name,
									iconUrl: group.iconUrl,
								})
								setIsOpen(false)
							}}
						/>
					))}
				</div>
			)}
		</div>
	)
}

interface GroupProps {
	name: string
	options: string[]
	onSelect: (value: string) => void
	iconUrl?: string
}

function Group({ name, options, onSelect, iconUrl }: GroupProps) {
	const [isOpen, setIsOpen] = useState(false)

	if (options.length === 0) return null

	return (
		<div css={{ padding: 4 }} tabIndex={0}>
			<div
				css={{
					fontWeight: '500',
					cursor: 'pointer',
					borderRadius: 4,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					border: 'none',
					backgroundColor: 'white',
				}}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div css={{ display: 'flex', alignItems: 'center', gap: 6 }}>
					{iconUrl && <img src={iconUrl} alt="" css={{ width: 16, height: 16 }} />}
					<span>{name}</span>
				</div>
				{isOpen ? <BsChevronUp /> : <BsChevronDown />}
			</div>
			{isOpen && (
				<div css={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
					{options.map((option, index) => (
						<div
							key={index}
							css={(theme) => ({
								fontSize: 14,
								borderRadius: 4,
								padding: '2px 6px',
								cursor: 'pointer',
								':hover': {
									backgroundColor: theme.color.text,
									color: theme.color.background,
								},
							})}
							onClick={() => onSelect(option)}
						>
							{option}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

interface SelectedDataProps {
	value: InputOrSelectValue
	onClose: () => void
}

function SelectedData({ value, onClose }: SelectedDataProps) {
	return (
		<div
			css={[
				fieldCss,
				{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				},
			]}
		>
			<div
				css={(theme) => ({
					backgroundColor: theme.color.text + '11',
					borderRadius: 4,
					padding: '0 6px',
					display: 'flex',
					alignItems: 'center',
					gap: 6,
				})}
			>
				{value.iconUrl && (
					<img src={value.iconUrl} alt="" css={{ width: 14, height: 14 }} />
				)}
				<span css={{ fontWeight: 500 }}>{value.groupName}</span>
				<span> - {value.data}</span>
			</div>
			<button
				css={(theme) => ({
					border: '1px solid',
					borderColor: theme.color.negative,
					color: theme.color.negative,
					borderRadius: 4,
					width: 24,
					height: 24,
					backgroundColor: theme.color.background,
					cursor: 'pointer',
					':hover': {
						color: theme.color.background,
						backgroundColor: theme.color.negative,
					},
				})}
				onClick={onClose}
			>
				<BsXLg />
			</button>
		</div>
	)
}

function useOutsideClick(ref: RefObject<HTMLDivElement>, callback: () => void) {
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function handleClickOutside(event: any) {
			if (ref.current && !ref.current.contains(event.target)) {
				callback()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [callback, ref])
}
