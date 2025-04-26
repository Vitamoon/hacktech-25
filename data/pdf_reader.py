import pypdf
from pypdf import PdfReader
pdf_path = './data/198Data.pdf'
reader = PdfReader(pdf_path)
text = ''
for page in reader.pages:
    text += page.extract_text() + '\n'
print(text)