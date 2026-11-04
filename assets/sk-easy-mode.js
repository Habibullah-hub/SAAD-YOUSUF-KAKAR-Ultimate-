/* SK Cyber Hub Easy Mode — local preference only; no account or server data. */
(function () {
  'use strict';
  const button = document.getElementById('skEasyModeToggle');
  if (!button) return;
  const key = 'sk-easy-mode-v1';
  const apply = enabled => {
    document.body.classList.toggle('sk-easy-mode', enabled);
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = enabled ? 'Easy mode: On' : 'Easy mode';
    button.title = enabled
      ? 'Turn off larger text and touch-friendly controls'
      : 'Make text and controls easier to read';
  };
  let enabled = false;
  try { enabled = localStorage.getItem(key) === 'on'; } catch (_) {}
  apply(enabled);
  button.addEventListener('click', () => {
    enabled = !document.body.classList.contains('sk-easy-mode');
    apply(enabled);
    try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch (_) {}
  });
})();
