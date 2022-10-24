import { AboutLeft } from './about-left'
import { AboutRight } from './about-right'
import { CardList } from './card-list'
import { CreateForm } from './create-form'
import { CustomersGrid } from './customers-grid'
import { FaqBasic } from './faq-basic'
import { FeatureCenterGrid } from './feature-center-grid'
import { FooterGrid } from './footer-grid'
import { GalleryBasic } from './gallery-basic'
import { Hero } from './hero'
import { HeroCtaLeft } from './hero-cta-left'
import { HeroCtaRight } from './hero-cta-right'
import { HeroFullWidth } from './hero-full-width'
import { List } from './list'
import { PricingSimple } from './pricing-simple'
import { SignInBasic } from './sign-in-basic'
import { SignUpBasic } from './sign-up-basic'
import { TeamCenterGrid } from './team-center-grid'

export const controllers = [
	{ title: 'About', items: [AboutLeft, AboutRight] },
	{ title: 'Customers', items: [CustomersGrid] },
	{ title: 'FAQ', items: [FaqBasic] },
	{ title: 'Features', items: [FeatureCenterGrid] },
	{ title: 'Footers', items: [FooterGrid] },
	{ title: 'Gallery', items: [GalleryBasic] },
	{ title: 'Hero', items: [HeroFullWidth, HeroCtaLeft, HeroCtaRight] },
	{ title: 'Misc', items: [Hero, CreateForm, List, CardList] },
	{ title: 'Pricing', items: [PricingSimple] },
	{ title: 'Sign In/Up', items: [SignInBasic, SignUpBasic] },
	{ title: 'Team', items: [TeamCenterGrid] },
] as const
