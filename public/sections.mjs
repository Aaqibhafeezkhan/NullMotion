// Section and beat timing for the drafts row. Pure functions, no DOM, so they can be
// tested in Node.
export const HAND_BUILT = { id: '5924a2f28506', cuts: [0, 3, 5.75, 9.5, 13, 16.5] };

// `duration` is the reference length; `drafts`, `bounds` and `cuts` are the loaded
// draft specs, section bounds and scene cuts; `names` names the hand-built scraps.
export function planSections(reference, { duration, drafts = { aliases: {}, drafts: {} }, bounds = {}, cuts = {}, names = [] }) {
  if (reference.id === HAND_BUILT.id) {
    return HAND_BUILT.cuts.map((start, index) => ({ start, end: HAND_BUILT.cuts[index + 1] ?? duration, name: names[index], scrap: index }));
  }
  const key = drafts.aliases[reference.id] || reference.id, spec = drafts.drafts[key];
  let spans = bounds[reference.id] || bounds[key];
  if (!spans?.length) {
    const count = Math.max(3, Math.min(8, Math.round(duration / 4.5)));
    spans = Array.from({ length: count }, (_, i) => ({ start: duration * i / count, end: duration * (i + 1) / count }));
  }
  const sceneCuts = cuts[reference.id] || cuts[key] || [];
  return spans.map(({ start, end }, index) => {
    const section = spec?.sections[index], beats = section?.beats || [['text', `Part ${index + 1}`]];
    end = index === spans.length - 1 ? duration : end;
    return { start, end, name: section?.name || `Part ${index + 1}`, beats, starts: beatStarts(beats.length, start, end, sceneCuts),
      palette: spec?.palette || { bg: '#111113', fg: '#f1f1f1', accent: '#ff5a1f' } };
  });
}

// A two-beat draft switches where the film itself cuts: the scene change between 30% and
// 80% of the section (where its two reference frames were sampled) nearest the middle.
export function beatStarts(count, start, end, sceneCuts) {
  const length = end - start;
  if (count !== 2) return Array.from({ length: count }, (_, i) => length * i / count);
  const inside = sceneCuts.map(cut => cut - start).filter(t => t > length * .3 && t < length * .8);
  inside.sort((a, b) => Math.abs(a - length * .55) - Math.abs(b - length * .55));
  return [0, inside[0] ?? length * .55];
}
