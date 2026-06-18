import JsonLd from '@/components/seo/JsonLd'
import { getGuideSeo } from '@/lib/seo/contentPages'
import { buildArticleJsonLd, buildArticleMetadata, buildBreadcrumbJsonLd } from '@/lib/seo/contentSeo'

const seo = getGuideSeo('abusivita-edilizie-in-italia')

export const metadata = buildArticleMetadata(seo)

export default function BuildingIrregularitiesGuideLayout({ children }) {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides' },
          { name: seo.title, path: seo.path }
        ])}
      />
      <JsonLd data={buildArticleJsonLd(seo)} />
      {children}
    </>
  )
}
