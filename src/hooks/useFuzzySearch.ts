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
}

// Create ufuzzy instance with good defaults for problem names
const uf = new uFuzzy({
  // IntraMode: allows chars between matches (typo tolerance)
  intraMode: 1,
  // IntraSub/Ins/Trans/Del: typo tolerance settings
  intraSub: 1, // substitutions
  intraIns: 1, // insertions
  intraTrn: 1, // transpositions
  intraDel: 1, // deletions
  // InterLft/Rgt: word boundary settings
  interLft: 2, // allow matches anywhere
  interRgt: 2,
});

export function useFuzzySearch<T>({
  items,
  getSearchableText,
  minQueryLength = 1,
}: UseFuzzySearchOptions<T>): UseFuzzySearchResult<T> {
  // Memoize the haystack (searchable strings)
  const haystack = useMemo(() => {
    return items.map(getSearchableText);
  }, [items, getSearchableText]);

  // Cache for last search
  const cacheRef = useRef<{ query: string; indices: number[] | null }>({
    query: "",
    indices: null,
  });

  const search = useMemo(() => {
    return (query: string): T[] => {
      const trimmedQuery = query.trim();

      // Return all items if query is too short
      if (trimmedQuery.length < minQueryLength) {
        return items;
      }

      // Check cache
      if (cacheRef.current.query === trimmedQuery && cacheRef.current.indices !== null) {
        return cacheRef.current.indices.map((i) => items[i]);
      }

      // Perform fuzzy search
      const [idxs, _info, order] = uf.search(haystack, trimmedQuery);

      // No matches
      if (!idxs || idxs.length === 0) {
        cacheRef.current = { query: trimmedQuery, indices: [] };
        return [];
      }

      // Get ordered indices
      const orderedIndices = order ? order.map((i) => idxs[i]) : idxs;

      // Update cache
      cacheRef.current = { query: trimmedQuery, indices: orderedIndices };

      return orderedIndices.map((i) => items[i]);
    };
  }, [items, haystack, minQueryLength]);

  const searchWithInfo = useMemo(() => {
    return (query: string) => {
      const results = search(query);
      const indices = cacheRef.current.indices || [];
      return results.map((item, i) => ({
        item,
        index: indices[i],
      }));
    };
  }, [search]);

  return { search, searchWithInfo };
}
