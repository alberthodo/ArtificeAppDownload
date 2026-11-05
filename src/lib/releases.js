// The latest release, from this repository's GitHub releases (installers and
// the update feed stay there; the website only links to them).
export const REPO = 'alberthodo/ArtificeAppDownload';
export const RELEASES_URL = `https://github.com/${REPO}/releases`;

export const KINDS = {
  'mac-arm': { re: /aarch64\.dmg$/i, label: 'macOS', long: 'macOS · Apple Silicon', note: 'M1 and later' },
  'mac-intel': { re: /x64\.dmg$/i, label: 'macOS (Intel)', long: 'macOS · Intel', note: 'Intel Macs' },
  'win-x64': { re: /x64-setup\.exe$/i, label: 'Windows', long: 'Windows · x64', note: 'Most Windows PCs' },
  'win-arm': { re: /arm64-setup\.exe$/i, label: 'Windows (ARM)', long: 'Windows · ARM64', note: 'Snapdragon and other ARM PCs' },
};

let cached = null;
export function latestRelease() {
  if (!cached) {
    cached = fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('no release'))))
      .then(rel => {
        const files = {};
        for (const [k, { re }] of Object.entries(KINDS)) {
          const a = (rel.assets || []).find(x => re.test(x.name));
          if (a) files[k] = { url: a.browser_download_url, mb: Math.round(a.size / 1e6) };
        }
        return { version: String(rel.tag_name || '').replace(/^v/, ''), date: rel.published_at, files };
      })
      .catch(e => { cached = null; throw e; });
  }
  return cached;
}

/// Which installer fits this computer (Safari can't tell Apple Silicon from Intel; most Macs are Apple Silicon).
export async function myKind() {
  const ua = navigator.userAgent;
  let arch = '';
  try { if (navigator.userAgentData) arch = (await navigator.userAgentData.getHighEntropyValues(['architecture'])).architecture || ''; } catch (_) {}
  if (/Windows/i.test(ua)) return /arm/i.test(arch) || /ARM64/i.test(ua) ? 'win-arm' : 'win-x64';
  if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) return arch === 'x86' ? 'mac-intel' : 'mac-arm';
  return null;
}
