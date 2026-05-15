import { describe, it, expect } from "vitest";

const toggleSeen = (seen, tmdbId) => {
  const hasAny = seen.some((k) => k.startsWith(`${tmdbId}-`));
  if (hasAny) {
    return seen.filter((k) => !k.startsWith(`${tmdbId}-`));
  } else {
    return [...seen, `${tmdbId}-`];
  }
};

describe("toggleSeen", () => {
  it("adds a movie to seen", () => {
    const seen = [];
    const result = toggleSeen(seen, 123);
    expect(result).toContain("123-");
  });

  it("removes a movie from seen if already there", () => {
    const seen = ["123-"];
    const result = toggleSeen(seen, 123);
    expect(result).not.toContain("123-");
  });

  it("does not affect other movies when removing", () => {
    const seen = ["123-", "456-"];
    const result = toggleSeen(seen, 123);
    expect(result).toContain("456-");
    expect(result).not.toContain("123-");
  });
});
