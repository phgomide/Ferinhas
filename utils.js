export function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('');
}
