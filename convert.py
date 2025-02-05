import os
import img2pdf

# Directory containing image files
directory = 'book'

# List all files in the directory ending with ".jpg"
image_files = [os.path.join(directory, i) for i in os.listdir(directory) if i.endswith(".jpg")]

# Sort files naturally if filenames contain numbers
image_files.sort(key=lambda x: int(os.path.basename(x).split('.')[0]))  

# Convert image files to PDF
with open("output.pdf", "wb") as f:  # Open the output file in binary write mode
    f.write(img2pdf.convert(image_files))