import { CardList } from './card-list'
import { CreateForm } from './create-form'
import { Hero } from './hero'
import { List } from './list'
import { SignInBasic } from './sign-in-basic'
import { SignUpBasic } from './sign-up-basic'

export const controllers = [
	{ title: 'Sign In/Up', items: [SignInBasic, SignUpBasic] },
	{ title: 'Misc', items: [Hero, CreateForm, List, CardList] },
] as const
