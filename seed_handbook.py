import re
from pypdf import PdfReader

reader = PdfReader("public/handbook.pdf")
sql_statements = []

# Wipe the old data before inserting the new clean data
sql_statements.append("TRUNCATE TABLE chatcit_knowledge RESTART IDENTITY;\n\n")

print(f"Processing {len(reader.pages)} pages...")

for page_num, page in enumerate(reader.pages, start=1):
    text = page.extract_text()
    if not text:
        continue
    
    cleaned_response = text.replace("'", "''").replace("\n", " ").strip()
    
    # SMARTER KEYWORD EXTRACTION
    # Grab all lines that actually have text
    lines = [line.strip() for line in text.split('\n') if len(line.strip()) > 3]
    
    if lines:
        # Take the very first line of the page (usually the Heading/Title)
        # Remove weird characters, limit to 35 chars, and Title Case it
        title = re.sub(r'[^A-Za-z0-9 ]+', '', lines[0])[:35].strip().title()
    else:
        title = f"Handbook Page {page_num}"
        
    sql = f"INSERT INTO chatcit_knowledge (keyword, response, picture_url, usage_count) VALUES ('{title}', '{cleaned_response}', '/handbook.pdf#page={page_num}', 0);\n"
    sql_statements.append(sql)

with open("seed_handbook.sql", "w", encoding="utf-8") as f:
    f.writelines(sql_statements)

print("Success! 'seed_handbook.sql' has been created. Run it in pgAdmin to refresh your database.")