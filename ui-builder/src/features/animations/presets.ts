import { uuid } from '../../utils'
import { Animation } from './schema'

export const PRESETS: Animation[] = [
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
