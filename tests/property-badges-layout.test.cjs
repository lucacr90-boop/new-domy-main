const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function imageGalleryCallSource(detailSource) {
  const match = detailSource.match(/<ImageGallery[\s\S]*?\/>/)
  assert.ok(match, 'Property detail page should render ImageGallery')
  return match[0]
}

test('property cards keep promotional badges in a single non-overlapping stack', () => {
  const listingSource = read('app/properties/page.js')
  const sliderSource = read('components/PropertySlider.jsx')
  const ribbonSource = read('components/NewPropertyRibbon.jsx')

  assert.match(ribbonSource, /inline = false/, 'NewPropertyRibbon must support inline layout for badge stacks')
  assert.match(ribbonSource, /inline \? 'relative' : 'absolute right-4 bottom-7 z-20'/)

  assert.match(listingSource, /data-testid="property-card-badge-stack"/)
  assert.match(listingSource, /flex max-w-\[calc\(100%-7rem\)\] flex-col items-end gap-2/)
  assert.match(listingSource, /<NewPropertyRibbon language=\{language\} compact inline \/>/)
  assert.doesNotMatch(listingSource, /right-\[8\.5rem\]|right-\[9\.75rem\]/)

  assert.match(sliderSource, /data-testid="property-slider-badge-stack"/)
  assert.match(sliderSource, /flex max-w-\[calc\(100%-6rem\)\] flex-col items-end gap-1\.5/)
  assert.match(sliderSource, /<NewPropertyRibbon language=\{language\} compact inline className="scale-90 origin-top-right" \/>/)
  assert.doesNotMatch(sliderSource, /right-\[7\.75rem\]/)
})

test('property detail gallery does not receive or render listing badges', () => {
  const detailSource = read('app/properties/[slug]/PropertyDetailClient.jsx')
  const galleryCall = imageGalleryCallSource(detailSource)
  const galleryFunction = detailSource.slice(
    detailSource.indexOf('function ImageGallery'),
    detailSource.indexOf('function InquiryForm')
  )

  assert.doesNotMatch(galleryCall, /isNew=|noAgency=|exclusive=|status=\{property\.status\}/)
  assert.doesNotMatch(galleryFunction, /<NewPropertyRibbon|<NoAgencyBadge|<ExclusiveBadge|statusLabel/)
})
