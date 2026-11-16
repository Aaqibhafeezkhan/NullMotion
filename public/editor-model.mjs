export const sequenceDuration = clips => clips.reduce((sum, clip) => sum + clip.out - clip.in, 0);
export function splitReference(reference, size = 4) {
  const duration = Number(reference.duration);
  if (!Number.isFinite(duration) || duration < 0.25 || !(size > 0)) return [];
  const count = Math.max(1, Math.floor(duration / size));
  return Array.from({ length: count }, (_, index) => ({
    ref: reference.id, in: +(index * duration / count).toFixed(3),
    out: index === count - 1 ? duration : +((index + 1) * duration / count).toFixed(3),
    label: ['Opening', 'Build', 'Detail', 'Transition', 'Reveal', 'Close'][Math.min(index, 5)],
    part: index + 1
  }));
}
export function locateClip(clips, time) {
  if (!clips.length) return null;
  let remaining = Math.max(0, Math.min(Number(time) || 0, sequenceDuration(clips)));
  for (let index = 0; index < clips.length; index++) {
    const length = clips[index].out - clips[index].in;
    if (remaining < length || index === clips.length - 1) return { index, local: clips[index].in + Math.min(remaining, length) };
    remaining -= length;
  }
}
export function moveClip(clips, from, to) {
  const result = [...clips];
  if (from < 0 || to < 0 || from >= clips.length || to >= clips.length) return result;
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
}
// Picks the demo clips: the hardcoded [referenceId, segmentIndex] picks that exist first,
// then the first segment of each other reference, then further segments, until `count` clips.
export function demoClipList(references, picks = [], count = 4) {
  const clips = [];
  const used = new Set();
  const take = (reference, index) => {
    const segment = (reference.segments || [])[index];
    const key = `${reference.id}:${index}`;
    if (!segment || used.has(key) || clips.length >= count) return;
    used.add(key); clips.push({ ...segment, ref: reference.id });
  };
  picks.forEach(([id, part]) => {
    const reference = references.find(item => item.id === id);
    if (reference) take(reference, Math.min(part, (reference.segments || []).length - 1));
  });
  references.forEach(reference => { if (!clips.some(clip => clip.ref === reference.id)) take(reference, 0); });
  const pickedIds = new Set(picks.map(([id]) => id));
  const groups = [references.filter(reference => !pickedIds.has(reference.id)), references.filter(reference => pickedIds.has(reference.id))];
  for (const group of groups) {
    const longest = Math.max(0, ...group.map(reference => (reference.segments || []).length));
    for (let round = 0; round < longest; round++) group.forEach(reference => take(reference, round));
  }
  return clips;
}
