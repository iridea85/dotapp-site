"""Private candidate only. Run AFTER immutable release & iPhone-bridge hash verification.
Do NOT execute on production until approved and service-worker regressions pass.
"""
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

site = Path(sys.argv[1] if len(sys.argv)>1 else 'site')
scripts = Path(__file__).resolve().parent
assert site.is_dir() and (site/'index.html').exists(), 'Site root missing'
index=site/'index.html'
content=index.read_text(encoding='utf-8')
assert 'admin_bridge.js' in content and 'flutter-first-frame' in content
inject = ('  <script src="dotapp-anon-metrics.js" defer></script>\n'
          '  <script src="dotapp-anon-admin.js" defer></script>\n')
assert 'dotapp-anon-metrics.js' not in content, 'already installed'
assert '</body>' in content
index.write_text(content.replace('</body>', inject+'</body>'), encoding='utf-8')
for name in ('dotapp-anon-metrics.js','dotapp-anon-admin.js'):
    shutil.copyfile(scripts/name,site/name)
worker=site/'flutter_service_worker.js'
assert worker.exists(), 'Service worker missing'
sw=worker.read_text(encoding='utf-8')
match=re.search(r'const RESOURCES = (\\{[^\\n]+\\});',sw)
assert match,'Unsupported service worker resource format'
resources=json.loads(match[1])
md5=lambda f:hashlib.md5((site/f).read_bytes()).hexdigest()
resources.update({'/':md5('index.html'),'index.html':md5('index.html'),
                  'dotapp-anon-metrics.js':md5('dotapp-anon-metrics.js'),
                  'dotapp-anon-admin.js':md5('dotapp-anon-admin.js')})
sw=sw[:match.start(1)]+json.dumps(resources,separators=(',',':'),ensure_ascii=True)+sw[match.end(1):]
worker.write_text(sw,encoding='utf-8')
assert json.loads(re.search(r'const RESOURCES = (\\{[^\\n]+\\});',worker.read_text())[1])==resources
print('Candidate patched after verification; immutable source archives untouched')
