import { AboutLeft } from './about-left'
import { AboutRight } from './about-right'
import { CardList } from './card-list'
import { ComparisonTableSimple } from './comparison-table-simple'
import { CreateForm } from './create-form'
import { CustomersGrid } from './customers-grid'
import { CustomersLogoGrid } from './customers-logo-grid'
import { FaqBasic } from './faq-basic'
import { FaqBasicStyled } from './faq-basic-styled'
import { FeatureCenterGrid } from './feature-center-grid'
import { FeatureCenterCards } from './feature-center-cards'
import { FeatureDetailsLeft } from './feature-details-left'
import { FeatureDetailsRight } from './feature-details-right'
import { FooterGrid } from './footer-grid'
import { GalleryBasic } from './gallery-basic'
import { GalleryBasicRounded } from './gallery-basic-rounded'
import { Hero } from './hero'
import { DividerSimpleTitle } from './divider-simple-title'
import { HeroCtaLeft } from './hero-cta-left'
import { HeroCtaRight } from './hero-cta-right'
import { HeroFullWidth } from './hero-full-width'
import { HeroParallax } from './hero-parallax'
import { List } from './list'
import { PricingSimple2 } from './pricing-simple-2'
import { PricingSimple } from './pricing-simple'
import { SignInBasic } from './sign-in-basic'
import { SignUpBasic } from './sign-up-basic'
import { TeamCenterGrid } from './team-center-grid'
import { TeamRoundCenter } from './team-round-center'
import { TeamRoundLeft } from './team-round-left'
import { ChartBar } from './chart-bar'
import { Details } from './dynamics/details'

export const controllers = [
	{ title: 'About', items: [AboutLeft, AboutRight] },
	{ title: 'Charts', items: [ChartBar] },
	{ title: 'Customers', items: [CustomersLogoGrid, CustomersGrid] },
	{ title: 'Comparison Table', items: [ComparisonTableSimple] },
	{ title: 'FAQ', items: [FaqBasic, FaqBasicStyled] },
	{ title: 'Divider', items: [DividerSimpleTitle] },
	{
		title: 'Features',
		items: [FeatureCenterGrid, FeatureCenterCards, FeatureDetailsLeft, FeatureDetailsRight],
	},
	{ title: 'Footers', items: [FooterGrid] },
	{ title: 'Gallery', items: [GalleryBasic, GalleryBasicRounded] },
	{ title: 'Hero', items: [HeroFullWidth, HeroCtaLeft, HeroCtaRight, HeroParallax] },
	{ title: 'Misc', items: [Hero, CreateForm, List, CardList] },
	{ title: 'Pricing', items: [PricingSimple, PricingSimple2] },
	{ title: 'Sign In/Up', items: [SignInBasic, SignUpBasic] },
	{ title: 'Team', items: [TeamCenterGrid, TeamRoundCenter, TeamRoundLeft] },
	{ title: 'Dynamic', items: [CreateForm, List, CardList, Details] },
] as const
