
(async function downloadPagesAsPDF() {
  const TIMEOUT_MS = 60000;
  const CHECK_INTERVAL = 150;

  let printWindow = null;
  let statusBox = null;

  function log(message) {
    console.log(`[PDF Downloader] ${message}`);
    if (statusBox && statusBox.isConnected) {
      statusBox.textContent = message;
    }
  }

  function getPageCanvas(pageNo) {
    return document.getElementById(`page_${pageNo}`);
  }

  function getPageCount() {
    const input = document.getElementById("pageNumInput");
    if (!input) throw new Error("Cannot find pageNumInput");

    const match = input.parentNode.innerText.match(/\/\s*(\d+)/);
    if (!match) throw new Error("Cannot determine total page count");

    return parseInt(match[1], 10);
  }

  function showStatus() {
    const box = document.createElement("div");

    Object.assign(box.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: "2147483647",
      background: "#171717",
      color: "#fff",
      padding: "16px 20px",
      borderRadius: "12px",
      font: "14px/1.5 Arial, sans-serif",
      boxShadow: "0 4px 20px #0005",
      width: "320px",
      maxWidth: "calc(100vw - 60px)"
    });

    const heading = document.createElement("div");
    heading.textContent = "Preparing PDF";
    heading.style.fontWeight = "bold";
    heading.style.marginBottom = "8px";

    statusBox = document.createElement("div");
    statusBox.textContent = "Initializing...";

    const track = document.createElement("div");
    Object.assign(track.style, {
      height: "6px",
      background: "#444",
      borderRadius: "10px",
      overflow: "hidden",
      marginTop: "12px"
    });

    const bar = document.createElement("div");
    Object.assign(bar.style, {
      height: "100%",
      width: "0%",
      background: "#55c78a",
      transition: "width 0.2s"
    });

    track.appendChild(bar);
    box.append(heading, statusBox, track);
    document.body.appendChild(box);

    return {
      update(message, percent) {
        statusBox.textContent = message;
        bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
      },
      finish(message) {
        statusBox.textContent = message;
        bar.style.width = "100%";
      },
      remove() {
        box.remove();
      }
    };
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function waitForPage(pageNo, canvas) {
    return new Promise((resolve, reject) => {
      const started = Date.now();

      function check() {
        if (!canvas.isConnected) {
          reject(new Error(`Page ${pageNo} canvas was removed`));
          return;
        }

        if (canvas.getAttribute("lz") === "1") {
          resolve();
          return;
        }

        if (Date.now() - started >= TIMEOUT_MS) {
          reject(new Error(`Timed out waiting for page ${pageNo}`));
          return;
        }

        setTimeout(check, CHECK_INTERVAL);
      }

      check();
    });
  }

  function waitForPaint() {
    return new Promise(resolve =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );
  }

  function canvasToPNG(canvas, pageNo) {
    try {
      return canvas.toDataURL("image/png");
    } catch (error) {
      throw new Error(
        `Could not capture page ${pageNo}. Canvas may be inaccessible: ${error.message}`
      );
    }
  }

  try {
    const ui = showStatus();
    log("Revealing all page placeholders...");

    // Reveal available placeholders.
    let button;
    let clicks = 0;

    while ((button = document.getElementById("continueButton"))) {
      button.click();
      clicks++;

      if (clicks > 1000) {
        throw new Error("Too many continue buttons; stopping for safety");
      }
    }

    const totalPages = getPageCount();
    log(`Found ${totalPages} pages. Preparing print window...`);

    // Open the window synchronously to reduce popup blocking.
    printWindow = window.open("", "_blank");

    if (!printWindow) {
      throw new Error(
        "Popup blocked. Allow popups for this website and run the script again."
      );
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preparing PDF</title>
        <style>
          @page { margin: 0; }
          html, body { margin: 0; padding: 0; }
          .pdf-page {
            margin: 0;
            padding: 0;
            width: 100%;
            break-after: page;
            page-break-after: always;
          }
          .pdf-page img {
            display: block;
            width: 100%;
            height: auto;
          }
          .pdf-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
        </style>
      </head>
      <body></body>
      </html>
    `);
    printWindow.document.close();

    // Capture each page sequentially after it finishes loading.
    for (let pageNo = 1; pageNo <= totalPages; pageNo++) {
      const canvas = getPageCanvas(pageNo);

      if (!canvas) {
        throw new Error(`Canvas not found for page ${pageNo}`);
      }

      const percentBefore = ((pageNo - 1) / totalPages) * 90;

      ui.update(
        `Loading page ${pageNo} of ${totalPages}...`,
        percentBefore
      );

      canvas.scrollIntoView({
        behavior: "instant",
        block: "center"
      });

      await waitForPage(pageNo, canvas);
      await waitForPaint();

      if (!canvas.width || !canvas.height) {
        throw new Error(`Page ${pageNo} has an empty canvas`);
      }

      const dataURL = canvasToPNG(canvas, pageNo);

      const wrapper = printWindow.document.createElement("div");
      wrapper.className = "pdf-page";

      const img = printWindow.document.createElement("img");
      img.alt = `Page ${pageNo}`;
      img.src = dataURL;

      wrapper.appendChild(img);
      printWindow.document.body.appendChild(wrapper);

      // Wait for image decoding before moving to the next page.
      if (img.decode) {
        await img.decode();
      } else {
        await new Promise((resolve, reject) => {
          if (img.complete && img.naturalWidth) return resolve();
          img.onload = resolve;
          img.onerror = reject;
        });
      }

      const percent = (pageNo / totalPages) * 90;

      ui.update(
        `Captured page ${pageNo} of ${totalPages}`,
        percent
      );

      console.log(
        `[PDF Downloader] Page ${pageNo}/${totalPages} captured`
      );
    }

    ui.update("Finalizing all pages...", 95);

    await Promise.all(
      [...printWindow.document.images].map(img =>
        img.decode ? img.decode() : Promise.resolve()
      )
    );

    // Use the source document title for the PDF filename.
    const title =
      document.querySelector("h1")?.title ||
      document.querySelector('meta[property="og:title"]')?.content ||
      document.title ||
      "pages";

    printWindow.document.title = title;

    await new Promise(resolve =>
      printWindow.requestAnimationFrame(() =>
        printWindow.requestAnimationFrame(resolve)
      )
    );

    ui.update("All pages ready. Opening print dialog...", 100);

    console.log(
      `[PDF Downloader] All ${totalPages} pages captured. Opening print dialog.`
    );

    printWindow.focus();
    await wait(300);
    printWindow.print();

    ui.finish(
      `Completed: ${totalPages} pages prepared. Choose "Save as PDF" in the print dialog.`
    );

    // Keep the final status visible briefly.
    setTimeout(() => ui.remove(), 10000);

  } catch (error) {
    console.error("[PDF Downloader] Failed:", error);

    if (statusBox) {
      statusBox.textContent = `Error: ${error.message}`;
      statusBox.style.color = "#ff8b8b";
    }

    alert(`PDF preparation failed:\n${error.message}`);
  }
})();
