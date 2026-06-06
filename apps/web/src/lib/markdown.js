/**
 * Tiny, safe formatter for blog post bodies written in the admin editor.
 * Supports: blank line = new paragraph, "## "/"### " headings, "- " bullets,
 * **bold**, and [text](https://url) links. HTML is escaped first, so editors
 * can't inject markup — this stays safe even though the output is rendered as HTML.
 */
export function mdToHtml(src) {
  if (!src) return '';
  const escape = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (t) =>
    escape(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(
        /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );

  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  let html = '';
  let inList = false;
  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      closeList();
      continue;
    }
    if (line.startsWith('### ')) {
      closeList();
      html += '<h3>' + inline(line.slice(4)) + '</h3>';
    } else if (line.startsWith('## ')) {
      closeList();
      html += '<h2>' + inline(line.slice(3)) + '</h2>';
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += '<li>' + inline(line.slice(2)) + '</li>';
    } else {
      closeList();
      html += '<p>' + inline(line) + '</p>';
    }
  }
  closeList();
  return html;
}

export default mdToHtml;
