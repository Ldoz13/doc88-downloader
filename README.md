# doc88 Downloader

#### Options

`downloadPages` function takes an optional options object:

```javascript
downloadPages({fromPage: 2, toPage: 10, quality: 0.8, imageNamePrefix: 'temp_'})
```

Possible options are:

1. `fromPage` – first page in range to be downloaded; number; default is `1`
2. `toPage` – last page in range to be downloaded; number; default is total number of pages in the document
3. `format` – downloaded image format; string; either `'jpg'` or `'png'`; default is `'jpg'`
4. `quality` – quality of images; applicable when `format` is `'jpg'`; number between `0` and `1`; default is `0.9`
5. `imageNamePrefix` – prefix for names of downloaded images; string; default is `'page'` (resulting in downloaded file names e.g.: `page001.jpg`, `page002.jpg`, etc. assuming `format` is `'jpg'`)
6. `archive` – type of archive to put the captured images in; string; either `'zip'` or `'none'`; default is `'zip'`; `'none'` will result in each image downloaded as a separate file

> [!NOTE]  
> In case of Chrome, if you set `archive` to `none`, the first time you download pages you may see a popup stating that "This site is attempting to download multiple files". You have to allow it, as with this option each page will be downloaded as a separate file.
Usage: `ocrmypdf input.pdf output.pdf` for OCR conversion pdf to pdf.

Packages to install using pip,

 - img2pdf
 - ocrmypdf


For ocrmypdf refer: https://ocrmypdf.readthedocs.io/en/latest/installation.html#installing-on-windows

 
