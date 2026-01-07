/**
 * useFuzzySearch - Fuzzy search hook using ufuzzy
 *
 * Provides typo-tolerant, fast fuzzy search for arrays of items.
 * Uses @leeoniya/ufuzzy which is optimized for real-time search.
 */

import uFuzzy from "@leeoniya/ufuzzy";
import { useMemo, useRef } from "react";

interface UseFuzzySearchOptions<T> {
  /** Array of items to search */
  items: T[];
  /** Function to extract searchable text from item */
  getSearchableText: (item: T) => string;
  /** Minimum query length to start searching */
  minQueryLength?: number;
}

interface UseFuzzySearchResult<T> {
  /** Search function - returns filtered items */
  search: (query: string) => T[];
  /** Get items with match highlighting info */
  searchWithInfo: (query: string) => Array<{
    item: T;
    /** Indices of matched items in original array */
    index: number;
  }>;

  /** Get items along with match ranges for highlighting */
  searchWithMatches: (query: string) => Array<{
    item: T;
    index: number;
    /** Matched ranges in the haystack string (0-based, end-exclusive) */
    ranges: Array<[number, number]>;
  }>;
}

// Use default uFuzzy configuration.
// Our previous custom options were overly strict and caused common queries (e.g. "pat")
// to return zero matches.
const uf = new uFuzzy();

const normalizeRanges = (raw: unknown): Array<[number, number]> => {
  if (!raw) return [];
  if (!Array.isArray(raw)) return [];

  // Shape A: [start, end]
  if (raw.length === 2 && typeof raw[0] === "number" && typeof raw[1] === "number") {
    return [[raw[0], raw[1]]];
  }

  // Shape B: [[start, end], [start, end], ...]
  const out: Array<[number, number]> = [];
  for (const entry of raw) {
    if (
      Array.isArray(entry) &&
      entry.length === 2 &&
      typeof entry[0] === "number" &&
      typeof entry[1] === "number"
    ) {
      out.push([entry[0], entry[1]]);
    }
  }
  return out;
};

export function useFuzzySearch<T>({
  items,
  getSearchableText,
  minQueryLength = 1,
}: UseFuzzySearchOptions<T>): UseFuzzySearchResult<T> {
  const haystack = useMemo(() => items.map(getSearchableText), [items, getSearchableText]);

  const cacheRef = useRef<{
    query: string;
    indices: number[] | null;
    ranges: Array<Array<[number, number]>> | null;
  }>({
    query: "",
    indices: null,
    ranges: null,
  });

  const search = useMemo(() => {
    // Reset cache whenever the underlying haystack changes.
    cacheRef.current = { query: "", indices: null, ranges: null };

    return (query: string): T[] => {
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < minQueryLength) {
        return items;
      }

      if (
        cacheRef.current.query === trimmedQuery &&
        cacheRef.current.indices !== null &&
        cacheRef.current.ranges !== null
      ) {
        return cacheRef.current.indices.map((i) => items[i]);
      }

      // NOTE: uFuzzy's types are not strict enough for TS to infer the tuple well.
      // We cast to the expected runtime shape.
      const [idxs, info, order] = uf.search(haystack, trimmedQuery, 1) as unknown as [
        number[] | null,
        {
          idx: number[];
          ranges?: unknown;
        },
        number[] | null,
      ];

      if (!idxs || idxs.length === 0 || !info || info.idx.length === 0) {
        cacheRef.current = { query: trimmedQuery, indices: [], ranges: [] };
        return [];
      }

      const orderedIndices = order ? order.map((i) => info.idx[i]) : info.idx;
      const orderedRanges = order
        ? order.map((i) => normalizeRanges((info as any).ranges?.[i]))
        : info.idx.map((_unused: number, i: number) => normalizeRanges((info as any).ranges?.[i]));

      cacheRef.current = { query: trimmedQuery, indices: orderedIndices, ranges: orderedRanges };
      return orderedIndices.map((i: number) => items[i]);
    };
  }, [items, haystack, minQueryLength]);

  const searchWithInfo = useMemo(() => {
    return (query: string) => {
      const results = search(query);
      const indices = cacheRef.current.indices ?? [];
      return results.map((item, i) => ({
        item,
        index: indices[i] ?? -1,
      }));
    };
  }, [search]);

  const searchWithMatches = useMemo(() => {
    return (query: string) => {
      const results = search(query);
      const indices = cacheRef.current.indices ?? [];
      const ranges = cacheRef.current.ranges ?? [];
      return results.map((item, i) => ({
        item,
        index: indices[i] ?? -1,
        ranges: ranges[i] ?? [],
      }));
    };
  }, [search]);

  return { search, searchWithInfo, searchWithMatches };
}
