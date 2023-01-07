import { z } from 'zod'
import { DIRECTIONS, EASINGS } from './options'

const keyframe = z.object({
	id: z.string(),
	value: z.string(),
	duration: z.number().optional(),
	delay: z.number().optional(),
})

const propertyOptions = z.object({
	id: z.string(),
	name: z.string(),
	keyframes: z.array(keyframe),
})

export const animationSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(50),
	properties: z.array(propertyOptions),
	duration: z.number(),
	delay: z.number(),
	easing: z.enum(EASINGS),
	easingParams: z.array(z.number()),
	direction: z.enum(DIRECTIONS),
	loop: z.boolean(),
	stagger: z.boolean(),
})

export type Animation = z.infer<typeof animationSchema>
export type PropertyOptions = z.infer<typeof propertyOptions>
export type Keyframe = z.infer<typeof keyframe>
