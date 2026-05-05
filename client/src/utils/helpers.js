export const getInitials = (name) => {
    return name ? name.split(' ').slice(0, 2).map(w => w[0]).join('') : '?';
};

export const escapeHtml = (str) => {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

export const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;

    let safePath = path.startsWith('/') ? path : `/${path}`;

    if (safePath.startsWith('/uploads/')) {
        safePath = safePath.replace('/uploads/', '/images/');
    }

    const baseUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';
    return `${baseUrl}${safePath}`;
};

export const parseMarkdown = (text) => {
    if (!text) return { __html: '' };

    let html = escapeHtml(text);

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--cyan); text-decoration: underline; text-underline-offset: 2px;">$1</a>');

    return { __html: html };
};