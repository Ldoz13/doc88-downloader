
# 📘 Doc88 Downloader

A simple tool to download Doc88 pages, convert them into PDF, and make them searchable using OCR.

---

## 🚀 Quick Start

1. **Download pages** using `downloadPages()` (example below).  
2. **Rename the output folder** to `book`.  
3. **Convert images to PDF** with `convert.py`.  
4. **(Optional)** Run OCR to make the PDF searchable.  

---

## 🔽 Download Options

The `downloadPages()` function accepts an **options object**:


downloadPages({
  fromPage: 2,
  toPage: 10,
  format: 'jpg',
  quality: 0.8,
  imageNamePrefix: 'temp_',
  archive: 'zip'
})

### Available Options

1. **`fromPage`** → First page to download
   * Type: `number`
   * Default: `1`

2. **`toPage`** → Last page to download
   * Type: `number`
   * Default: *last page of the document*

3. **`format`** → Output image format
   * Type: `'jpg'` | `'png'`
   * Default: `'jpg'`

4. **`quality`** → Image quality *(only for JPG)*
   * Type: `0 – 1`
   * Default: `0.9`

5. **`imageNamePrefix`** → Prefix for downloaded files
   * Type: `string`
   * Default: `'page'`
   * Example: `page001.jpg`, `page002.jpg`, …

6. **`archive`** → Archive type for downloads
   * Type: `'zip'` | `'none'`
   * Default: `'zip'`
   * ⚠️ If you set `'none'`, each page downloads separately.
     In Chrome, you may see a popup:
     *"This site is attempting to download multiple files"*.
     You must allow it.

---

## 📦 Python Setup

Install the required packages:

```bash
pip install img2pdf ocrmypdf
```

---

## 📑 Conversion Workflow

1. **Rename your folder** to `book`
   (This is the directory containing the downloaded images)

2. **Convert images → PDF**
   ```bash
   python convert.py
   ```

3. **(Optional) Apply OCR**
   To make your PDF searchable:
   ```bash
   ocrmypdf input.pdf output.pdf
   ```

📖 More details: [OCRmyPDF Installation Guide](https://ocrmypdf.readthedocs.io/en/latest/installation.html#installing-on-windows)

---
✅ That's it! You'll end up with a **searchable PDF** created from your downloaded Doc88 pages.
