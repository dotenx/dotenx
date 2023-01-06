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
import { useInputState } from '@mantine/hooks'
import anime from 'animejs'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import _ from 'lodash'
import { useEffect, useRef } from 'react'
import { TbPlayerPlay, TbPlus, TbSettings } from 'react-icons/tb'
import { z } from 'zod'
import { uuid } from '../../utils'
import { CollapseLine } from '../ui/collapse-line'

const PRESETS: Animation[] = [
	{
		id: 'fade-in',
		name: 'Fade In',
		properties: [
			{
				id: uuid(),
				name: 'opacity',
				keyframes: [
					{
						id: uuid(),
						value: '0',
						duration: 0,
						delay: 0,
					},
					{
						id: uuid(),
						value: '1',
						duration: 1000,
						delay: 0,
					},
				],
			},
		],
		duration: 1000,
		delay: 0,
		easing: 'linear',
		easingParams: [],
		direction: 'normal',
		loop: false,
		stagger: false,
	},
	{
		id: 'fade-out',
		name: 'Fade Out',
		properties: [
			{
				id: uuid(),
				name: 'opacity',
				keyframes: [
					{
						id: uuid(),
						value: '1',
						duration: 0,
						delay: 0,
					},
					{
						id: uuid(),
						value: '0',
						duration: 1000,
						delay: 0,
					},
				],
			},
		],
		duration: 1000,
		delay: 0,
		easing: 'linear',
		easingParams: [],
		direction: 'normal',
		loop: false,
		stagger: false,
	},
	{
		id: 'slide-out',
		name: 'Slide Out',
		properties: [
			{
				id: uuid(),
				name: 'translateX',
				keyframes: [
					{
						id: uuid(),
						value: '0%',
						duration: 0,
						delay: 0,
					},
					{
						id: uuid(),
						value: '100%',
						duration: 1000,
						delay: 0,
					},
				],
			},
		],
		duration: 1000,
		delay: 0,
		easing: 'linear',
		easingParams: [],
		direction: 'normal',
		loop: false,
		stagger: false,
	},
	{
		id: 'zoom-in',
		name: 'Zoom In',
		properties: [
			{
				id: uuid(),
				name: 'scale',
				keyframes: [
					{
						id: uuid(),
						value: '0',
						duration: 0,
						delay: 0,
					},
					{
						id: uuid(),
						value: '1',
						duration: 1000,
						delay: 0,
					},
				],
			},
		],
		duration: 1000,
		delay: 0,
		easing: 'linear',
		easingParams: [],
		direction: 'normal',
		loop: false,
		stagger: false,
	},
	{
		id: 'zoom-out',
		name: 'Zoom Out',
		properties: [
			{
				id: uuid(),
				name: 'scale',
				keyframes: [
					{
						id: uuid(),
						value: '1',
						duration: 0,
						delay: 0,
					},
					{
						id: uuid(),
						value: '0',
						duration: 1000,
						delay: 0,
					},
				],
			},
		],
		duration: 1000,
		delay: 0,
		easing: 'linear',
		easingParams: [],
		direction: 'normal',
		loop: false,
		stagger: false,
	},
	{
		id: 'rotate-out',
		name: 'Rotate Out',
		properties: [
			{
				id: uuid(),
				name: 'rotate',
				keyframes: [
					{
						id: uuid(),
						value: '0deg',
						duration: 0,
						delay: 0,
					},
					{
						id: uuid(),
						value: '180deg',
						duration: 1000,
						delay: 0,
					},
				],
			},
		],
		duration: 1000,
		delay: 0,
		easing: 'linear',
		easingParams: [],
		direction: 'normal',
		loop: false,
		stagger: false,
	},
]

const PROPERTIES = [
	'translateX',
	'translateY',
	'scale',
	'scaleX',
	'scaleY',
	'rotate',
	'rotateX',
	'rotateY',
	'skew',
	'skewX',
	'skewY',
	'opacity',
	'backgroundColor',
	'borderColor',
	'borderWidth',
	'borderRadius',
	'color',
	'height',
	'width',
	'padding',
	'margin',
	'fontSize',
	'letterSpacing',
	'lineHeight',
	'textShadow',
	'boxShadow',
]
const DIRECTIONS = ['normal', 'reverse', 'alternate'] as const
const EASINGS = ['linear', 'spring', 'cubicBezier', 'steps'] as const
type Easing = typeof EASINGS[number]
const EASING_PARAMS = {
	linear: [],
	spring: [1, 80, 10, 0],
	cubicBezier: [0.5, 0.05, 0.1, 0.3],
	steps: [5],
}

const schema = z.object({
	id: z.string(),
	name: z.string().min(1).max(50),
	properties: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			keyframes: z.array(
				z.object({
					id: z.string(),
					value: z.string(),
					duration: z.number().optional(),
					delay: z.number().optional(),
				})
			),
		})
	),
	duration: z.number(),
	delay: z.number(),
	easing: z.enum(EASINGS),
	easingParams: z.array(z.number()),
	direction: z.enum(DIRECTIONS),
	loop: z.boolean(),
	stagger: z.boolean(),
})

export type Animation = z.infer<typeof schema>

export const animationsAtom = atom<Animation[]>([])

export function AnimationsEditor() {
	const animations = useAtomValue(animationsAtom)
	const [selectedAnimationId, setSelectedAnimationId] = useInputState<string | null>(null)
	const [isAdding, setIsAdding] = useInputState(false)

	return (
		<div className="space-y-4">
			{!isAdding && (
				<>
					<div className="space-y-4">
						<p className="font-medium">Animations</p>
						{animations.map((animation) => (
							<Button
								key={animation.id}
								variant="light"
								size="xs"
								fullWidth
								onClick={() => {
									setSelectedAnimationId(animation.id)
									setIsAdding(true)
								}}
							>
								{animation.name}
							</Button>
						))}
					</div>
					<Button
						size="xs"
						fullWidth
						leftIcon={<TbPlus />}
						onClick={() => setIsAdding(true)}
					>
						Animation
					</Button>
				</>
			)}
			{isAdding && (
				<AnimationEditor
					initialValues={animations.find(
						(animation) => animation.id === selectedAnimationId
					)}
					onFinish={() => {
						setIsAdding(false)
						setSelectedAnimationId(null)
					}}
					onCancel={() => {
						setIsAdding(false)
						setSelectedAnimationId(null)
					}}
				/>
			)}
		</div>
	)
}

function AnimationEditor({
	initialValues,
	onFinish,
	onCancel,
}: {
	initialValues?: Animation
	onFinish: () => void
	onCancel: () => void
}) {
	const ref = useRef<HTMLDivElement>(null)
	const animation = useRef<anime.AnimeInstance | null>(null)
	const setAnimations = useSetAtom(animationsAtom)
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
		validate: zodResolver(schema),
	})
	const setValues = form.setValues

	useEffect(() => {
		if (initialValues) setValues(initialValues)
	}, [initialValues, setValues])

	const playAnimation = () => {
		const values = form.values
		const properties = _.fromPairs(
			values.properties.map((p) => [p.name, p.keyframes.map((k) => _.omit(k, 'id'))])
		)
		animation.current?.pause()
		animation.current?.restart()
		animation.current?.pause()
		const children = [...(ref.current?.children ?? [])]
		children.forEach((child) => child.removeAttribute('style'))
		animation.current = anime({
			targets: ref.current?.children,
			autoplay: false,
			duration: values.duration,
			delay: values.stagger ? anime.stagger(values.delay) : values.delay,
			easing:
				values.easing === 'linear'
					? 'linear'
					: `${values.easing}(${values.easingParams.join(',')})`,
			direction: values.direction,
			loop: values.direction === 'alternate' ? values.loop || 1 : values.loop,
			...properties,
		})
		animation.current?.restart()
		animation.current?.play()
	}

	const onSubmit = form.onSubmit((values) => {
		const mode = initialValues ? 'edit' : 'add'
		if (mode === 'add') {
			setAnimations((animations) => [...animations, values])
		} else {
			setAnimations((animations) => animations.map((a) => (a.id === values.id ? values : a)))
		}
		onFinish()
	})

	return (
		<div className="pb-10">
			<CloseButton size="xs" onClick={onCancel} ml="auto" />
			<Select
				data={PRESETS.map((preset) => ({ label: preset.name, value: preset.id }))}
				label="Preset"
				onChange={(value) => {
					const preset = PRESETS.find((p) => p.id === value)
					if (preset) form.setValues(preset)
				}}
				size="xs"
			/>
			<div ref={ref} className="my-6 space-y-2 border rounded py-28">
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
						onClick={playAnimation}
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
					<ActionIcon
						size="xs"
						onClick={() =>
							form.insertListItem('properties', {
								id: uuid(),
								name: '',
								keyframes: [{ id: uuid(), value: '' }],
							})
						}
					>
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
								if (event.target.checked) {
									animation.current?.pause()
									animation.current?.restart()
									animation.current?.pause()
									const children = [...(ref.current?.children ?? [])]
									children.forEach((child) => child.removeAttribute('style'))
								}
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
					onChange={(value: Easing) => {
						form.getInputProps('easing').onChange(value)
						const params = EASING_PARAMS[value]
						form.setFieldValue('easingParams', params)
					}}
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
