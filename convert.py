import os
import img2pdf

# Directory containing image files
directory = 'book'

# List all files in the directory ending with ".jpg"
image_files = [os.path.join(directory, i) for i in os.listdir(directory) if i.endswith(".jpg")]

# Convert image files to PDF
with open("output.pdf", "wb") as f:  # Open the output file in binary write mode
    f.write(img2pdf.convert(image_files))

# ocrmypdf input.pdf output.pdf     for OCR
