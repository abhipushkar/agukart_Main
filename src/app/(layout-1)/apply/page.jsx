import ApplyAsSeller from 'pages-sections/seller-apply/ApplyAsSeller'

export async function generateMetadata() {
  return {
    title: 'Apply as a Creator | Agukart',
    description:
      'Join Agukart as a creator and showcase unique, handcrafted, vintage, and timeless products to customers worldwide.',
    keywords: [
      'Agukart creator',
      'sell on Agukart',
      'become an Agukart seller',
      'apply as a creator',
      'handmade marketplace',
      'sell handmade products',
      'creator marketplace',
    ],
    openGraph: {
      title: 'Apply as a Creator | Agukart',
      description:
        'Join Agukart, a curated marketplace for unique, handcrafted and timeless products.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Apply as a Creator | Agukart',
      description:
        'Join Agukart, a curated marketplace for unique, handcrafted and timeless products.',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

const Page = () => {
  return <ApplyAsSeller />
}

export default Page