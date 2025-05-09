// hooks/useFilterLogic.js
import { useState } from 'react';

export const useFilterLogic = (
  originalData,
  selectedSortOption,
  setSearchResults,
  setFilterModalVisible,
  sortResults
) => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [mobileServiceOnly, setMobileServiceOnly] = useState(false);

  const applyFilters = () => {
    if (!selectedRating && !selectedDistance && !mobileServiceOnly) {
      setSearchResults(originalData);
      setFilterModalVisible(false);
      return;
    }

    let filtered = [...originalData];
    if (selectedRating) filtered = filtered.filter(item => item.rate >= selectedRating);
    if (selectedDistance) filtered = filtered.filter(item => item.distance <= selectedDistance);
    if (mobileServiceOnly) filtered = filtered.filter(item => item.mobile_service === true);

    filtered = sortResults(filtered, selectedSortOption);
    setSearchResults(filtered);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setSelectedRating(null);
    setSelectedDistance(null);
    setMobileServiceOnly(false);
    setSearchResults(originalData);
  };

  return {
    selectedRating,
    setSelectedRating,
    selectedDistance,
    setSelectedDistance,
    mobileServiceOnly,
    setMobileServiceOnly,
    applyFilters,
    resetFilters,
  };
};
    