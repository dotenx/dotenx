import { CardList } from './card-list'
import { CreateForm } from './create-form'
import { CustomersGrid } from './customers-grid'
import { FaqBasic } from './faq-basic'
import { FeatureCenterGrid } from './feature-center-grid'
import { GalleryBasic } from './gallery-basic'
import { Hero } from './hero'
import { List } from './list'
import { SignInBasic } from './sign-in-basic'
import { SignUpBasic } from './sign-up-basic'

export const controllers = [
	{ title: 'Customers', items: [CustomersGrid] },
	{ title: 'Features', items: [FeatureCenterGrid] },
	{ title: 'FAQ', items: [FaqBasic] },
	{ title: 'Gallery', items: [GalleryBasic] },
	{ title: 'Misc', items: [Hero, CreateForm, List, CardList] },
	{ title: 'Sign In/Up', items: [SignInBasic, SignUpBasic] },
] as const
