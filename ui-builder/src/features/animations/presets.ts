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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
	{
		id: 'scale-up-center',
		name: 'Scale Up Center',
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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
						delay: 0,
					},
				],
			},
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
		id: 'scale-up-bl',
		name: 'Scale Up Bottom Left',
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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
		id: 'scale-up-ver-center',
		name: 'Scale Up Vertical Center',
		properties: [
			{
				id: uuid(),
				name: 'scaleY',
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
		id: 'scale-up-top',
		name: 'Scale Up Top',
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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
		id: 'scale-up-left',
		name: 'Scale Up Left',
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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
		id: 'scale-up-ver-top',
		name: 'Scale Up Vertical Top',
		properties: [
			{
				id: uuid(),
				name: 'scaleY',
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
		id: 'scale-up-tr',
		name: 'Scale Up Top Right',
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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
		id: 'scale-up-tl',
		name: 'Scale Up Top Left',
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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
		id: 'scale-up-tl',
		name: 'Scale Up Top Left',
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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
		id: 'scale-up-ver-bottom',
		name: 'Scale Up Vertical Bottom',
		properties: [
			{
				id: uuid(),
				name: 'scaleY',
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
		id: 'scale-up-right',
		name: 'Scale Up Right',
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
			{
				id: uuid(),
				name: 'transformOrigin',
				keyframes: [
					{
						id: uuid(),
						value: '50% 50%',
						duration: 0,
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
		id: 'scale-up-hor-center',
		name: 'Scale Up Horizontal Center',
		properties: [
			{
				id: uuid(),
				name: 'scaleX',
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
		id: 'scale-up-hor-left',
		name: 'Scale Up Horizontal Left',
		properties: [
			{
				id: uuid(),
				name: 'scaleX',
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
		id: 'scale-up-bottom',
		name: 'Scale Up Bottom',
		properties: [
			{
				id: uuid(),
				name: 'scaleY',
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
		id: 'scale-up-hor-right',
		name: 'Scale Up Horizontal Right',
		properties: [
			{
				id: uuid(),
				name: 'scaleX',
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
]
