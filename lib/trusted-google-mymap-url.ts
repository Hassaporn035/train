/** อนุญาตเฉพาะลิงก์ https ไปโดเมน Google (กัน javascript: / เว็บแปลกปลอม) */
export function isTrustedGoogleMyMapUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase();
    return (
      h === 'google.com' ||
      h === 'www.google.com' ||
      h === 'mymaps.google.com' ||
      h === 'maps.google.com' ||
      h === 'maps.app.goo.gl' ||
      h.endsWith('.google.com')
    );
  } catch {
    return false;
  }
}
