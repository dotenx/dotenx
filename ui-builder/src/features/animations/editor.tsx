import {
	ActionIcon,
	Autocomplete,
	Button,
	CloseButton,
	Divider,
	NumberInput,
	Popover,
	ScrollArea,
	Select,
	Switch,
	Text,
	TextInput,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import anime, { AnimeInstance } from 'animejs'
import { useAtomValue, useSetAtom } from 'jotai'
import _ from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { TbPlayerPlay, TbPlus, TbSettings, TbTrash } from 'react-icons/tb'
import { uuid } from '../../utils'
import { animationsAtom } from '../atoms'
import { CollapseLine } from '../ui/collapse-line'
import { DIRECTIONS, Easing, EASINGS, EASING_PARAMS, PROPERTIES } from './options'
import { PRESETS } from './presets'
import { Animation, animationSchema } from './schema'

export function AnimationsEditor() {
	const [selectedAnimation, setSelectedAnimation] = useState<Animation | null>(null)
	const [isAdding, setIsAdding] = useState(false)

	return (
		<div className="space-y-4">
			{!isAdding && (
				<AnimationList
					onClick={(animation) => {
						setSelectedAnimation(animation)
						setIsAdding(true)
					}}
					onAdd={() => setIsAdding(true)}
				/>
			)}
			{isAdding && (
				<AnimationEditor
					initialValues={selectedAnimation ?? undefined}
					onClose={() => {
						setIsAdding(false)
						setSelectedAnimation(null)
					}}
				/>
			)}
		</div>
	)
}

function AnimationList({
	onClick,
	onAdd,
}: {
	onClick: (animation: Animation) => void
	onAdd: () => void
}) {
	const animations = useAtomValue(animationsAtom)

	return (
		<div>
			<div className="space-y-4">
				<p className="font-medium">Animations</p>
				{animations.map((animation) => (
					<Button
						key={animation.id}
						variant="light"
						size="xs"
						fullWidth
						onClick={() => onClick(animation)}
					>
						{animation.name}
					</Button>
				))}
			</div>
			<Button mt="xl" size="xs" fullWidth leftIcon={<TbPlus />} onClick={onAdd}>
				Animation
			</Button>
		</div>
	)
}

function AnimationEditor({
	initialValues,
	onClose,
}: {
	initialValues?: Animation
	onClose: () => void
}) {
	const animationInstance = useRef<AnimeInstance | null>(null)
	const animationElement = useRef<HTMLDivElement | null>(null)
	const setAnimations = useSetAtom(animationsAtom)
	const form = useAnimationForm(initialValues)
	const mode = initialValues ? 'edit' : 'add'

	const play = () => {
		if (!animationElement.current) return
		const animation = animationInstance.current
		animation?.pause()
		animation?.restart()
		animation?.pause()
		const newAnimation = playAnimation(form.values, animationElement.current)
		animationInstance.current = newAnimation
	}

	const onSubmit = form.onSubmit((values) => {
		if (mode === 'add') {
			setAnimations((animations) => [...animations, values])
		} else {
			setAnimations((animations) => animations.map((a) => (a.id === values.id ? values : a)))
		}
		onClose()
	})

	const deleteAnimation = () => {
		setAnimations((animations) => animations.filter((a) => a.id !== initialValues?.id))
		onClose()
	}
	const presets = PRESETS.map((preset) => ({ label: preset.name, value: preset.id }))

	const onPresetChange = (value: string | null): void => {
		const preset = PRESETS.find((p) => p.id === value)
		if (preset) form.setValues(preset)
	}

	const addProperty = () =>
		form.insertListItem('properties', {
			id: uuid(),
			name: '',
			keyframes: [{ id: uuid(), value: '' }],
		})
	const onStaggerChange = (value: boolean) => {
		if (value) {
			animationInstance.current?.pause()
			animationInstance.current?.restart()
			animationInstance.current?.pause()
			const children = [...(animationElement.current?.children ?? [])]
			children.forEach((child) => child.removeAttribute('style'))
		}
	}
	const onEasingChange = (value: Easing) => {
		form.getInputProps('easing').onChange(value)
		const params = EASING_PARAMS[value]
		form.setFieldValue('easingParams', params)
	}

	return (
		<div className="pb-10">
			<div className="flex justify-end gap-2">
				{mode === 'edit' && (
					<ActionIcon size="xs" title="Delete animation" onClick={deleteAnimation}>
						<TbTrash size={12} />
					</ActionIcon>
				)}
				<CloseButton size="xs" onClick={onClose} title="Close animation" />
			</div>
			<Select data={presets} label="Preset" onChange={onPresetChange} size="xs" />
			<div ref={animationElement} className="my-6 space-y-2 border rounded py-28">
				{_.range(form.values.stagger ? 3 : 1).map((i) => (
					<div key={i} className="w-6 h-6 mx-auto rounded bg-rose-400" />
				))}
			</div>
			<form onSubmit={onSubmit}>
				<div className="flex gap-4">
					<Button
						fullWidth
						size="xs"
						leftIcon={<TbPlayerPlay />}
						variant="outline"
						onClick={play}
					>
						Play
					</Button>
					<Button fullWidth size="xs" leftIcon={<TbPlus />} type="submit">
						Save
					</Button>
				</div>
				<TextInput size="xs" label="Name" {...form.getInputProps('name')} mt="xs" />
				<div className="flex items-baseline gap-2">
					<Divider label="Properties" mb="xs" className="grow" mt="xl" />
					<ActionIcon size="xs" onClick={addProperty}>
						<TbPlus size={12} />
					</ActionIcon>
				</div>
				<div className="space-y-2">
					{form.values.properties.map((property, index) => (
						<div className="flex items-center gap-2" key={property.id}>
							<Autocomplete
								data={PROPERTIES}
								placeholder="e.g. translateX"
								size="xs"
								name="property"
								className="grow"
								{...form.getInputProps(`properties.${index}.name`)}
							/>
							<div className="space-y-1">
								<CloseButton
									size="xs"
									onClick={() => form.removeListItem('properties', index)}
								/>
								<Popover position="left" withinPortal shadow="sm" width={300}>
									<Popover.Target>
										<ActionIcon size="xs">
											<TbSettings size={12} />
										</ActionIcon>
									</Popover.Target>
									<Popover.Dropdown className="!pr-3">
										<ScrollArea style={{ height: 410 }} offsetScrollbars>
											{form.values.properties[index].keyframes.length ===
												0 && (
												<Text size="xs" color="dimmed">
													No keyframes
												</Text>
											)}
											<div className="space-y-4">
												{form.values.properties[index].keyframes.map(
													(keyframe, keyframeIndex) => (
														<CollapseLine
															key={keyframe.id}
															label={`Keyframe ${keyframeIndex + 1}`}
														>
															<CloseButton
																size="xs"
																ml="auto"
																onClick={() =>
																	form.removeListItem(
																		`properties.${index}.keyframes`,
																		keyframeIndex
																	)
																}
															/>
															<TextInput
																size="xs"
																name="value"
																label="Value"
																{...form.getInputProps(
																	`properties.${index}.keyframes.${keyframeIndex}.value`
																)}
															/>
															<NumberInput
																size="xs"
																name="duration"
																label="Duration"
																{...form.getInputProps(
																	`properties.${index}.keyframes.${keyframeIndex}.duration`
																)}
															/>
															<NumberInput
																size="xs"
																name="delay"
																label="Delay"
																{...form.getInputProps(
																	`properties.${index}.keyframes.${keyframeIndex}.delay`
																)}
															/>
														</CollapseLine>
													)
												)}
											</div>
										</ScrollArea>
										<Button
											mt="xl"
											size="xs"
											leftIcon={<TbPlus />}
											onClick={() =>
												form.insertListItem(
													`properties.${index}.keyframes`,
													{
														id: uuid(),
														value: '',
													}
												)
											}
										>
											Keyframe
										</Button>
									</Popover.Dropdown>
								</Popover>
							</div>
						</div>
					))}
				</div>
				<Divider label="Settings" mb="xs" mt="xl" />
				<div className="space-y-2">
					<NumberInput
						label="Duration"
						size="xs"
						name="duration"
						{...form.getInputProps('duration')}
					/>
					<NumberInput
						label="Delay"
						size="xs"
						name="delay"
						{...form.getInputProps('delay')}
					/>
					<Select
						label="Direction"
						size="xs"
						name="direction"
						data={DIRECTIONS as unknown as string[]}
						{...form.getInputProps('direction')}
					/>
					<div className="grid grid-cols-2">
						<Switch
							label="Loop"
							size="xs"
							name="loop"
							{...form.getInputProps('loop', { type: 'checkbox' })}
						/>
						<Switch
							label="Stagger"
							size="xs"
							name="stagger"
							{...form.getInputProps('stagger', { type: 'checkbox' })}
							onChange={(event) => {
								form.getInputProps('stagger').onChange(event)
								onStaggerChange(event.target.checked)
							}}
						/>
					</div>
				</div>

				<Divider label="Easing" mb="xs" mt="xl" />
				<Select
					label="Kind"
					size="xs"
					name="easing"
					mb="xs"
					data={EASINGS as unknown as string[]}
					{...form.getInputProps('easing')}
					onChange={onEasingChange}
				/>
				{form.values.easing === 'spring' && (
					<div className="grid grid-cols-2 gap-2">
						<NumberInput
							size="xs"
							label="Mass"
							name="mass"
							{...form.getInputProps('easingParams.0')}
						/>
						<NumberInput
							size="xs"
							label="Stiffness"
							name="stiffness"
							{...form.getInputProps('easingParams.1')}
						/>
						<NumberInput
							size="xs"
							label="Damping"
							name="damping"
							{...form.getInputProps('easingParams.2')}
						/>
						<NumberInput
							size="xs"
							label="Velocity"
							name="velocity"
							{...form.getInputProps('easingParams.3')}
						/>
					</div>
				)}
				{form.values.easing === 'cubicBezier' && (
					<div className="grid grid-cols-2 gap-2">
						<NumberInput
							size="xs"
							label="x1"
							name="x1"
							{...form.getInputProps('easingParams.0')}
						/>
						<NumberInput
							size="xs"
							label="y1"
							name="y1"
							{...form.getInputProps('easingParams.1')}
						/>
						<NumberInput
							size="xs"
							label="x2"
							name="x2"
							{...form.getInputProps('easingParams.2')}
						/>
						<NumberInput
							size="xs"
							label="y2"
							name="y2"
							{...form.getInputProps('easingParams.3')}
						/>
					</div>
				)}
				{form.values.easing === 'steps' && (
					<NumberInput
						size="xs"
						label="Count"
						name="stepCount"
						{...form.getInputProps('easingParams.0')}
					/>
				)}
			</form>
		</div>
	)
}

const useAnimationForm = (initialValues?: Animation) => {
	const form = useForm<Animation>({
		initialValues: initialValues
			? initialValues
			: {
					id: uuid(),
					name: '',
					properties: [
						{
							id: uuid(),
							name: '',
							keyframes: [{ id: uuid(), value: '' }],
						},
					],
					duration: 1000,
					delay: 0,
					easing: 'spring',
					direction: 'normal',
					easingParams: [1, 80, 10, 0],
					loop: false,
					stagger: false,
			  },
		validate: zodResolver(animationSchema),
	})

	const setValues = form.setValues
	useEffect(() => {
		if (initialValues) setValues(initialValues)
	}, [initialValues, setValues])

	return form
}

const playAnimation = (options: Animation, target: HTMLElement) => {
	const properties = _.fromPairs(
		options.properties.map((p) => [p.name, p.keyframes.map((k) => _.omit(k, 'id'))])
	)
	const children = [...target.children]
	children.forEach((child) => child.removeAttribute('style'))
	const animation = anime({
		targets: target.children,
		autoplay: false,
		duration: options.duration,
		delay: options.stagger ? anime.stagger(options.delay) : options.delay,
		easing:
			options.easing === 'linear'
				? 'linear'
				: `${options.easing}(${options.easingParams.join(',')})`,
		direction: options.direction,
		loop: options.direction === 'alternate' ? options.loop || 1 : options.loop,
		...properties,
	})
	animation.restart()
	animation.play()
	return animation
}
