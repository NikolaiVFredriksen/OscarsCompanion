import { describe, it, expect } from "vitest";

const toggleWatchlist = (watchlist, tmdbId) => {
  const hasAny = watchlist.some((k) => k.startsWith(`${tmdbId}-`));
  if (hasAny) {
    return watchlist.filter((k) => !k.startsWith(`${tmdbId}-`));
  } else {
    return [...watchlist, `${tmdbId}-`];
  }
};

describe("toggleWatchlist", () => {
  it("adds a movie to watchlist", () => {
    const seen = [];
    const result = toggleWatchlist(seen, 123);
    expect(result).toContain("123-");
  });

  it("removes a movie from watchlist if already there", () => {
    const seen = ["123-"];
    const result = toggleWatchlist(seen, 123);
    expect(result).not.toContain("123-");
  });

  it("does not affect other movies when removing", () => {
    const seen = ["123-", "456-"];
    const result = toggleWatchlist(seen, 123);
    expect(result).toContain("456-");
    expect(result).not.toContain("123-");
  });
});
