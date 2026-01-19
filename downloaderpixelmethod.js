/***********************
 * UTILITIES
 ***********************/
function getPageCanvas(pageNo) {
  return document.getElementById(`page_${pageNo}`)
}

function revealAllPagePlaceholders() {
  let btn
  while ((btn = document.getElementById('continueButton'))) {
    btn.click()
  }
  console.log('Revealed all page placeholders')
}

/***********************
 * WAIT FOR REAL PIXELS
 ***********************/
function waitUntilCanvasHasPixels(pageNo, canvas, resolve) {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return setTimeout(() => waitUntilCanvasHasPixels(pageNo, canvas, resolve), 150)
  }

  try {
    const p = ctx.getImageData(0, 0, 1, 1).data
    if (p[3] === 0) {
      setTimeout(() => waitUntilCanvasHasPixels(pageNo, canvas, resolve), 150)
    } else {
      console.log(`Page ${pageNo} painted`)
      resolve()
    }
  } catch {
    setTimeout(() => waitUntilCanvasHasPixels(pageNo, canvas, resolve), 200)
  }
}

async function preloadPage(pageNo, canvas) {
  canvas.scrollIntoView({ block: 'center' })
  return new Promise(resolve =>
    waitUntilCanvasHasPixels(pageNo, canvas, resolve)
  )
}

/***********************
 * IMAGE HANDLING
 ***********************/
function imageFormatFor({ format = 'jpg', quality = 0.95 }) {
  if (format === 'png') return { mimeType: 'image/png', extension: '.png' }
  return { mimeType: 'image/jpeg', extension: '.jpg', quality }
}

function imageFilenameFor(pageNo, { imageNamePrefix = 'page' }, { extension }) {
  return `${imageNamePrefix}${String(pageNo).padStart(3, '0')}${extension}`
}

function captureAsImageBlob(canvas, { mimeType, quality }) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject('toBlob failed')),
      mimeType,
      quality
    )
  })
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

/***********************
 * ZIP SUPPORT
 ***********************/
async function loadJSZip() {
  if (window.JSZip) return
  await new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    s.onload = res
    s.onerror = rej
    document.head.appendChild(s)
  })
}

/***********************
 * MAIN FUNCTION
 ***********************/
async function downloadPages(options = {}) {
  revealAllPagePlaceholders()

  const imageFormat = imageFormatFor(options)
  await loadJSZip()
  const zip = new JSZip()

  let pageNo = options.fromPage ?? 1
  let emptyHits = 0
  const MAX_EMPTY = 5   // stop after 5 missing pages

  console.log('Starting page scan…')

  while (emptyHits < MAX_EMPTY) {
    const canvas = getPageCanvas(pageNo)

    if (!canvas) {
      emptyHits++
      pageNo++
      continue
    }

    emptyHits = 0
    await preloadPage(pageNo, canvas)

    try {
      const blob = await captureAsImageBlob(canvas, imageFormat)
      const filename = imageFilenameFor(pageNo, options, imageFormat)
      zip.file(filename, blob)
      console.log(`Captured page ${pageNo}`)
    } catch (e) {
      console.warn(`Skipped page ${pageNo}`)
    }

    pageNo++
  }

  const title =
    document.querySelector('h1')?.innerText ||
    document.title ||
    'pages'

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, `${title}.zip`)

  console.log('All pages downloaded ✅')
}
