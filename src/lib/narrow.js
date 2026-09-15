/**
 * The phone layout breakpoint, in one place.
 *
 * Below this the page is one column and the car cannot sit beside anything,
 * so the dock, the render budget and the lap timing all switch behaviour here.
 * It was a string repeated in three files; a typo in one would have split the
 * phone layout down the middle.
 */
export const NARROW_QUERY = '(max-width: 900px)';

export const isNarrow = () => typeof window !== 'undefined'
  && window.matchMedia(NARROW_QUERY).matches;
