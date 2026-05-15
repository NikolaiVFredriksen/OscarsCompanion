import { describe, it, expect } from "vitest";
import nominations from "../data/nominations.json";

const filterNominees = (nominees, filter, seen, watchlist) => {
  if (filter === "seen")
    return nominees.filter((n) =>
      seen.some((k) => k.startsWith(`${n.tmdb_id}-`)),
    );
  if (filter === "watchlist")
    return nominees.filter((n) =>
      watchlist.some((k) => k.startsWith(`${n.tmdb_id}-`)),
    );
  return nominees;
};

describe("Filter logic", () => {
  const nominees = nominations[0].nominees;

  it("seen filter only returns seen movies", () => {
    const seen = [`${nominees[0].tmdb_id}-`];
    const result = filterNominees(nominees, "seen", seen, []);
    expect(
      result.every((n) => seen.some((k) => k.startsWith(`${n.tmdb_id}-`))),
    ).toBe(true);
  });

  it("watchlist filter only returns watchlisted movies", () => {
    const watchlist = [`${nominees[0].tmdb_id}-`];
    const result = filterNominees(nominees, "watchlist", [], watchlist);
    expect(
      result.every((n) => watchlist.some((k) => k.startsWith(`${n.tmdb_id}-`))),
    ).toBe(true);
  });

  it("calculates seen count correctly for a category", () => {
    const seen = [`${nominees[0].tmdb_id}-`, `${nominees[1].tmdb_id}-`];
    const seenCount = nominees.filter((n) =>
      seen.some((k) => k.startsWith(`${n.tmdb_id}-`)),
    ).length;
    expect(seenCount).toBe(2);
  });
});
