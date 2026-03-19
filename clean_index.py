import os
import codecs
import time

def restore():
    # Read pristine original
    with codecs.open('index.html.txt', 'r', encoding='utf-8') as f:
        html = f.read()

    # Append our extra features script once
    if '</body>' in html:
        ts = int(time.time())
        html = html.replace('</body>', f'  <script src="js/extra-features.js?v={ts}"></script>\n</body>')

    # Overwrite the broken index.html
    with codecs.open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Restored index.html cleanly.")

if __name__ == '__main__':
    restore()
