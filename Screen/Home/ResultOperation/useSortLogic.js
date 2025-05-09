import { useCallback } from "react";

export const useSortLogic = (searchResults, setSearchResults, setSelectedSortOption) => {
  const sortResults = useCallback((results, sortOption) => {
    if (!sortOption) return results;
    const sorted = [...results];
    if (sortOption === "lowPrice") sorted.sort((a, b) => a.price - b.price);
    else if (sortOption === "highPrice") sorted.sort((a, b) => b.price - a.price);
    else if (sortOption === "highRating") sorted.sort((a, b) => b.rate - a.rate);
    else if (sortOption === "nearDistance") sorted.sort((a, b) => a.distance - b.distance);
    return sorted;
  }, []);

  const applySort = useCallback(
    (sortOption) => {
      const sorted = sortResults(searchResults, sortOption);
      setSearchResults(sorted);
      setSelectedSortOption(sortOption);
    },
    [searchResults, sortResults, setSearchResults, setSelectedSortOption]
  );

  return { applySort, sortResults }; // ✅ أضفنا sortResults هنا
};
