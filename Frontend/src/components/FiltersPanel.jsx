import React, { useState, useEffect } from "react";

// Single filter component
const Filter = ({ filter, setFilter, primaryColor = "blue-600" }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleRadioChange = (option) => {
    setFilter({ ...filter, selected: option });
    setIsOpen(false); // Close after selection
  };

  const clearSelection = () => {
    setFilter({ ...filter, selected: "" });
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-48 relative">
      {/* Filter Header/Button */}
      <div
        onClick={toggleOpen}
        className="cursor-pointer rounded-xl px-4 py-3 flex justify-between items-center transition-all duration-200 hover:shadow-lg border border-[var(--color-border)]"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-primary)',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        }}
      >
        <span className="font-medium tracking-wide text-sm">
          {filter.selected || `${filter.name}`}
        </span>
        <div className="flex items-center gap-2">
          {filter.selected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="text-xs text-red-400 hover:text-red-600 underline"
            >
              ✕
            </button>
          )}
          <span className="text-[var(--color-accent)] text-xs">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Radio Button Options (shown when open) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 space-y-2 max-h-48 overflow-y-auto border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-surface)] shadow-lg">
          {filter.options.map((opt, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
              <input
                type="radio"
                name={filter.name.toLowerCase().replace(/\s+/g, '-')}
                value={opt}
                checked={filter.selected === opt}
                onChange={() => handleRadioChange(opt)}
                className="text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
              />
              <span className="text-[var(--color-primary)] font-medium text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Main FiltersPanel
const FiltersPanel = ({ setFilters }) => {
  const [filters, setFiltersState] = useState([
    { name: "Type", options: ["Offer", "Request"], selected: "" },
    { name: "Category", options: [], selected: "" },
    { name: "University", options: [], selected: "" },
    { name: "Availability", options: ["Weekdays", "Weekends", "Flexible"], selected: "" },
    { name: "Free/Paid", options: ["Free", "Paid"], selected: "" },
  ]);

  // Fetch categories and universities from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesRes, universitiesRes] = await Promise.all([
          fetch('http://localhost:5000/api/categories'),
          fetch('http://localhost:5000/api/universities')
        ]);
        
        const categoriesData = await categoriesRes.json();
        const universitiesData = await universitiesRes.json();
        
        setFiltersState(prevFilters => {
          const updatedFilters = [...prevFilters];
          
          // Update Category options
          const categoryIndex = updatedFilters.findIndex(f => f.name === "Category");
          if (categoryIndex !== -1 && categoriesData.categories) {
            updatedFilters[categoryIndex].options = categoriesData.categories.map(cat => cat.name);
          }
          
          // Update University options
          const universityIndex = updatedFilters.findIndex(f => f.name === "University");
          if (universityIndex !== -1 && universitiesData.universities) {
            updatedFilters[universityIndex].options = universitiesData.universities.map(uni => uni.name);
          }
          
          return updatedFilters;
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Update main filters state
  useEffect(() => {
    const appliedFilters = {};
    filters.forEach((f) => {
      if (f.selected) {
        // Map filter names to the correct key names used in filtering
        const filterKey = f.name.toLowerCase() === 'free/paid' ? 'free' : 
                         f.name.toLowerCase() === 'availability' ? 'availability' :
                         f.name.toLowerCase() === 'university' ? 'university' :
                         f.name.toLowerCase();
        appliedFilters[filterKey] = f.selected;
      }
    });
    setFilters(appliedFilters);
  }, [filters]);

  const updateFilter = (index, newFilter) => {
    const updated = [...filters];
    updated[index] = newFilter;
    setFiltersState(updated);
  };

  return (
    <div
      className="w-full flex flex-wrap gap-4 p-4 rounded-2xl shadow-lg border border-[var(--color-border)]"
      style={{
        background: 'linear-gradient(135deg, #29406b 80%, #3b5998 100%)',
      }}
    >
      <h2 className="text-2xl font-bold w-full mb-4 tracking-wide" style={{ color: 'var(--color-surface)' }}>Filters</h2>

      {/* Existing filters */}
      {filters.map((filter, idx) => (
        <Filter
          key={idx}
          filter={filter}
          setFilter={(f) => updateFilter(idx, f)}
        />
      ))}
    </div>
  );
};

export default FiltersPanel;
