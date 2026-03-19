import os
import codecs

def inject(encoding):
    try:
        with codecs.open('index.html', 'r', encoding=encoding) as f:
            content = f.read()
        
        if '</body>' in content and 'extra-features.js' not in content:
            content = content.replace('</body>', '<script src="js/extra-features.js?v=extras"></script>\n</body>')
            with codecs.open('index.html', 'w', encoding=encoding) as f:
                f.write(content)
            print(f"Success with {encoding}")
            return True
        elif 'extra-features.js' in content:
            print(f"Already injected with {encoding}")
            return True
    except Exception as e:
        pass
    return False

if not inject('utf-8'):
    if not inject('utf-16'):
        if not inject('utf-16-le'):
            inject('windows-1252')
