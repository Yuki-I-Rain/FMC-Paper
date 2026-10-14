export function base64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(binary);
}

export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function withSvg(markup, action) {
  const mount = document.createElement('div');
  mount.className = 'export-mount';
  mount.setAttribute('aria-hidden', 'true');
  // markup is produced by createSheet, which escapes user-entered text.
  mount.innerHTML = markup;
  document.body.appendChild(mount);
  try {
    await new Promise(resolve => requestAnimationFrame(resolve));
    return await action(mount.firstElementChild);
  } finally { mount.remove(); }
}
