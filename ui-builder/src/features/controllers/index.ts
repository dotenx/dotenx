import { Hero } from './hero'
import { SignInBasic } from './sign-in-basic'
import { SignUpBasic } from './sign-up-basic'

// import { Test } from './test2'

export const controllers = [
	{ title: 'Sign In/Up', items: [SignInBasic, SignUpBasic] },
	{ title: 'Base', items: [Hero] },
	{ title: 'Others', items: [Hero] },
] as const
