(() => {
  const button = document.getElementById('simulate');
  const dialog = document.getElementById('consultDialog');
  if (!button || !dialog || typeof dialog.showModal !== 'function') return;
  button.hidden = false;
  button.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('close', () => button.focus());
})();
