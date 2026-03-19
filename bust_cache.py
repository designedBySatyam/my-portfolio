import codecs
import time

def bust_cache():
    try:
        with codecs.open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        timestamp = str(int(time.time()))
        
        # Replace the old cache buster with a new timestamp
        if '?v=extras' in content:
            content = content.replace('?v=extras', f'?v={timestamp}')
        elif 'extra-features.js"' in content:
            content = content.replace('extra-features.js"', f'extra-features.js?v={timestamp}"')
        else:
            # Maybe the regex replace caught something else
            import re
            content = re.sub(r'extra-features\.js\?v=[^"]+', f'extra-features.js?v={timestamp}', content)

        with codecs.open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Cache busted.")
    except Exception as e:
        print("Failed:", e)

if __name__ == '__main__':
    bust_cache()
