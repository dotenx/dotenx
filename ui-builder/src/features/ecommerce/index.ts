import { Components } from '../components'
import { AboutRight } from '../components/about-right'
import { ComparisonTableSimple } from '../components/comparison-table-simple'
import { CustomersGrid } from '../components/customers-grid'
import { CustomersLogoGrid } from '../components/customers-logo-grid'
import { DividerSimpleTitle } from '../components/divider-simple-title'
import { FaqBasic } from '../components/faq-basic'
import { FaqBasicStyled } from '../components/faq-basic-styled'
import { FeatureCenterCards } from '../components/feature-center-cards'
import { FeatureCenterGrid } from '../components/feature-center-grid'
import { FeatureDetailsLeft } from '../components/feature-details-left'
import { FeatureDetailsRight } from '../components/feature-details-right'
import { FeatureGridImages } from '../components/feature-grid-images'
import { FooterGrid } from '../components/footer-grid'
import { GalleryBasic } from '../components/gallery-basic'
import { GalleryBasicRounded } from '../components/gallery-basic-rounded'
import { GalleryWithCaptions } from '../components/gallery-with-caption'
import { GalleryWithTitle } from '../components/gallery-with-title'
import { HeroCtaLeft } from '../components/hero-cta-left'
import { HeroCtaRight } from '../components/hero-cta-right'
import { HeroFullWidth } from '../components/hero-full-width'
import { HeroParallax } from '../components/hero-parallax'
import { Navbar } from '../components/navbar'
import { PricingSimple } from '../components/pricing-simple'
import { PricingSimple2 } from '../components/pricing-simple-2'
import { SignInBasic } from '../components/sign-in-basic'
import { SignUpBasic } from '../components/sign-up-basic'
import { TeamCenterGrid } from '../components/team-center-grid'
import { TeamRoundCenter } from '../components/team-round-center'
import { TeamRoundLeft } from '../components/team-round-left'
import { TestimonialSimple } from '../components/testimonial-simple'
import { BoughtProducts } from './components/bought-products'
import { Cart } from './components/cart'
import { FeaturedProduct } from './components/featured-product'
import { Header } from './components/header'
import { ProductItem } from './components/product-item'
import { ProductList } from './components/product-list'
import { SignIn } from './components/sign-in'
import { SignUp } from './components/sign-up'
import { theme1Controllers } from './theme1/controller'
import { theme2Controllers } from './theme2/controller'
import { theme3Controllers } from './theme3/controller'

export const ECOMMERCE_COMPONENTS: Components = [
	{
		title: 'About',
		items: [AboutRight],
	},
	{ title: 'Customers', items: [CustomersLogoGrid, CustomersGrid, theme1Controllers.Logos] },
	{ title: 'Comparison Table', items: [ComparisonTableSimple] },
	{ title: 'FAQ', items: [FaqBasic, FaqBasicStyled] },
	{ title: 'Divider', items: [DividerSimpleTitle] },
	{
		title: 'Features',
		items: [
			FeatureCenterGrid,
			FeatureCenterCards,
			FeatureGridImages,
			FeatureDetailsLeft,
			FeatureDetailsRight,
			ProductItem,
			Cart,
			theme1Controllers.FeaturesText,
			theme1Controllers.Features,
			theme1Controllers.Info,
			theme2Controllers.FeatureText,
			theme2Controllers.Features,
			theme3Controllers.FeaturedProduct,
		],
	},
	{
		title: 'Collections',
		items: [
			theme3Controllers.Collections,
			theme3Controllers.ProductList,
			ProductList,
			BoughtProducts,
		],
	},
	{ title: 'Footers', items: [FooterGrid] },
	{
		title: 'Gallery',
		items: [
			GalleryBasic,
			GalleryBasicRounded,
			GalleryWithTitle,
			GalleryWithCaptions,
			FeaturedProduct,
		],
	},
	{
		title: 'Hero',
		items: [
			HeroFullWidth,
			HeroCtaLeft,
			HeroCtaRight,
			HeroParallax,
			theme1Controllers.Hero,
			theme2Controllers.Hero,
			theme3Controllers.Hero,
		],
	},
	{
		title: 'Navbar',
		items: [
			Header,
			Navbar,
			theme1Controllers.Navbar,
			theme2Controllers.Navbar,
			theme3Controllers.Navbar,
		],
	},
	{ title: 'Pricing', items: [PricingSimple, PricingSimple2] },
	{ title: 'Sign In/Up', items: [SignIn, SignUp, SignInBasic, SignUpBasic] },
	{ title: 'Team', items: [TeamCenterGrid, TeamRoundCenter, TeamRoundLeft] },
	{ title: 'Testimonial', items: [TestimonialSimple, theme2Controllers.Testimonial] },
	{ title: 'Call to action', items: [theme1Controllers.Cta, theme2Controllers.Cta] },
]
