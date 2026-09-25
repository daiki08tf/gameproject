export function heading(title) {
  return [`=== ${title} ===`, ''];
}

export function section(title) {
  return ['', `--- ${title} ---`];
}

export function fail(msg) {
  console.error(msg);
  process.exit(1);
}
