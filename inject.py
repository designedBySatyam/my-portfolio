import os

def run():
    with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    
    # Replace </body> with the script tag first
    if '</body>' in html and 'extra-features.js' not in html:
        html = html.replace('</body>', '<script src="js/extra-features.js?v=extras"></script>\n</body>')
        
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == "__main__":
    run()
