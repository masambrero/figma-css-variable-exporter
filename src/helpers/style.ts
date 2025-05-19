function addIndent(str: string, indent = 2) {
  return `${' '.repeat(indent)}${str}`;
}

// Normalize name: slash/space → hyphen, keep underscore
export function normalizeName(name: string) {
  return name
    .trim()
    .replace(/[/\s]+/g, '-')
    .toLowerCase();
}

export function createRootContent(data: string) {
  return `:root {${data
    .split('\n')
    .map((line) => addIndent(line))
    .join('\n')}\n}`;
}
