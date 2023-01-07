import _ from 'lodash'
import { Animation, Keyframe } from '../features/animations/schema'

export function serializeAnimation(animation: Animation) {
	const properties = _.fromPairs(animation.properties.map((p) => [p.name, p.keyframes]))
	const easing =
		animation.easing === 'linear'
			? 'linear'
			: `${animation.easing}(${animation.easingParams.join(',')})`

	const options = {
		duration: animation.duration,
		delay: animation.delay,
		direction: animation.direction,
		stagger: animation.stagger,
		loop: animation.loop,
		easing,
		...properties,
	}

	type BaseOptions = typeof options

	return {
		id: animation.id,
		name: animation.name,
		options: options as BaseOptions & Record<string, Keyframe[]>,
	}
}

export type SerializedAnimation = ReturnType<typeof serializeAnimation>
