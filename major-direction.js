const MAJOR_DIRECTION_MARKERS = ['根因', '排除', '世界'];

export function isMajorDirection(text) {
  const value = String(text ?? '');
  return MAJOR_DIRECTION_MARKERS.some((marker) => value.includes(marker));
}
