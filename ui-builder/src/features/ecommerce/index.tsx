import {
	TbArticle,
	TbBorderHorizontal,
	TbClick,
	TbLayoutBottombar,
	TbLayoutNavbar,
	TbList,
	TbListDetails,
	TbLogin,
	TbMessageChatbot,
	TbPhoto,
	TbQuestionCircle,
	TbReportMoney,
	TbSection,
	TbShoppingBag,
	TbTableAlias,
	TbUser,
	TbUsers,
} from 'react-icons/tb'
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
import { HeroCtaLeft } from '../components/hero-cta-left'
import { HeroCtaRight } from '../components/hero-cta-right'
import { HeroFullWidth } from '../components/hero-full-width'
import { Navbar } from '../components/navbar'
import { PricingSimple } from '../components/pricing-simple'
import { PricingSimple2 } from '../components/pricing-simple-2'
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
import { theme1Components } from './theme1/components'
import { theme2Components } from './theme2/components'
import { theme3Components } from './theme3/components'
import { theme4Components } from './theme4/components'

export const ECOMMERCE_COMPONENTS: Components = [
	{
		title: 'Product',
		icon: <TbShoppingBag />,
		items: [
			ProductList,
			ProductItem,
			FeaturedProduct,
			Cart,
			BoughtProducts,
			theme3Components.ProductList,
			theme4Components.BoughtItems,
			theme4Components.BoughtItemDetails,
			theme3Components.FeaturedProduct,
		],
	},
	{
		title: 'Sign In/Up',
		icon: <TbLogin />,
		items: [SignIn, SignUp],
	},
	{
		title: 'About',
		icon: <TbArticle />,
		items: [AboutRight],
	},
	{
		title: 'Customers',
		icon: <TbUser />,
		items: [CustomersLogoGrid, CustomersGrid, theme1Components.Logos],
	},
	{
		title: 'Comparison Table',
		icon: <TbTableAlias />,
		items: [ComparisonTableSimple],
	},
	{
		title: 'FAQ',
		icon: <TbQuestionCircle />,
		items: [FaqBasic, FaqBasicStyled],
	},
	{
		title: 'Divider',
		icon: <TbBorderHorizontal />,
		items: [DividerSimpleTitle],
	},
	{
		title: 'Features',
		icon: <TbList />,
		items: [
			FeatureCenterGrid,
			FeatureCenterCards,
			FeatureGridImages,
			FeatureDetailsLeft,
			FeatureDetailsRight,
			theme1Components.FeaturesText,
			theme1Components.Features,
			theme1Components.Info,
			theme2Components.FeatureText,
			theme2Components.Features,
		],
	},
	{
		title: 'Collections',
		icon: <TbListDetails />,
		items: [theme3Components.Collections],
	},
	{
		title: 'Footers',
		icon: <TbLayoutBottombar />,
		items: [FooterGrid],
	},
	{
		title: 'Gallery',
		icon: <TbPhoto />,
		items: [GalleryBasic, GalleryBasicRounded, GalleryWithCaptions],
	},
	{
		title: 'Hero',
		icon: <TbSection />,
		items: [
			HeroFullWidth,
			HeroCtaLeft,
			HeroCtaRight,
			theme1Components.Hero,
			theme2Components.Hero,
			theme3Components.Hero,
		],
	},
	{
		title: 'Navbar',
		icon: <TbLayoutNavbar />,
		items: [
			Header,
			Navbar,
			theme1Components.Navbar,
			theme2Components.Navbar,
			theme3Components.Navbar,
		],
	},
	{
		title: 'Pricing',
		icon: <TbReportMoney />,
		items: [PricingSimple, PricingSimple2],
	},
	{
		title: 'Team',
		icon: <TbUsers />,
		items: [TeamCenterGrid, TeamRoundCenter, TeamRoundLeft],
	},
	{
		title: 'Testimonial',
		icon: <TbMessageChatbot />,
		items: [TestimonialSimple, theme2Components.Testimonial],
	},
	{
		title: 'Call to action',
		icon: <TbClick />,
		items: [theme1Components.Cta, theme2Components.Cta],
	},
]
