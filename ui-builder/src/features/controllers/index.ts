import { CardList } from './card-list'
import { CreateForm } from './create-form'
import { GalleryBasic } from './gallery-basic'
import { Hero } from './hero'
import { List } from './list'
import { SignInBasic } from './sign-in-basic'
import { SignUpBasic } from './sign-up-basic'

export const controllers = [
	{ title: 'Sign In/Up', items: [SignInBasic, SignUpBasic] },
	{ title: 'Gallery', items: [GalleryBasic] },
	{ title: 'Misc', items: [Hero, CreateForm, List, CardList] },
] as const
