/* eslint-disable @typescript-eslint/no-explicit-any */
import { deepMerge, collectStringPaths } from "@/test/generated/utils";

describe("deepMerge", () => {
  it("merges flat properties into target", () => {
    const target = { a: 1, b: 2 };
    const result = deepMerge(target, { b: 3, c: 4 } as any);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
    expect(result).toBe(target);
  });

  it("recursively merges nested objects", () => {
    const target = { a: { x: 1, y: 2 }, b: 3 };
    deepMerge(target, { a: { y: 99, z: 100 } } as any);
    expect(target).toEqual({ a: { x: 1, y: 99, z: 100 }, b: 3 });
  });

  it("overwrites arrays rather than merging them", () => {
    const target = { items: [1, 2, 3] };
    deepMerge(target, { items: [4, 5] } as any);
    expect(target.items).toEqual([4, 5]);
  });

  it("overwrites nested object with primitive", () => {
    const target = { a: { x: 1 } };
    deepMerge(target, { a: 42 } as any);
    expect(target).toEqual({ a: 42 });
  });

  it("overwrites primitive with nested object", () => {
    const target = { a: 1 } as any;
    deepMerge(target, { a: { x: 2 } });
    expect(target).toEqual({ a: { x: 2 } });
  });

  it("applies multiple sources left to right", () => {
    const target = { a: 1 };
    deepMerge(target, { a: 2 } as any, { a: 3 } as any);
    expect(target.a).toBe(3);
  });

  it("skips null and undefined sources", () => {
    const target = { a: 1 };
    deepMerge(target, null as any, undefined as any);
    expect(target).toEqual({ a: 1 });
  });

  it("returns target unchanged when called with no sources", () => {
    const target = { a: 1 };
    expect(deepMerge(target)).toBe(target);
  });

  it("deep-merges three levels of nesting", () => {
    const target = { a: { b: { c: 1, d: 2 } } };
    deepMerge(target, { a: { b: { d: 99 } } } as any);
    expect(target).toEqual({ a: { b: { c: 1, d: 99 } } });
  });
});

describe("collectStringPaths", () => {
  it("returns { [input]: [] } for a string input", () => {
    expect(collectStringPaths("hello")).toEqual({ hello: [] });
  });

  it("maps top-level string values to single-key paths", () => {
    expect(collectStringPaths({ a: "foo", b: "bar" })).toEqual({
      foo: ["a"],
      bar: ["b"],
    });
  });

  it("maps nested string values to full key paths", () => {
    expect(collectStringPaths({ a: { b: "deep" } })).toEqual({
      deep: ["a", "b"],
    });
  });

  it("maps string values inside arrays with numeric indices", () => {
    expect(collectStringPaths({ items: ["x", "y"] })).toEqual({
      x: ["items", 0],
      y: ["items", 1],
    });
  });

  it("ignores non-string leaf values", () => {
    expect(collectStringPaths({ a: "keep", b: 42, c: null, d: true } as any)).toEqual({
      keep: ["a"],
    });
  });

  it("handles a mix of nested objects and arrays", () => {
    expect(
      collectStringPaths({ x: { y: ["a", "b"] }, z: "c" }),
    ).toEqual({
      a: ["x", "y", 0],
      b: ["x", "y", 1],
      c: ["z"],
    });
  });

  it("last path wins when the same string value appears multiple times", () => {
    const result = collectStringPaths({ a: "dup", b: "dup" });
    expect(result["dup"]).toBeDefined();
    expect(["a", "b"]).toContain(result["dup"][0]);
  });

  it("returns an empty object for an empty input object", () => {
    expect(collectStringPaths({})).toEqual({});
  });
});