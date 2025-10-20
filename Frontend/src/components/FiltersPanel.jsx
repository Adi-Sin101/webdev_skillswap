import React, { useState, useEffect } from "react";

// Single filter component
const Filter = ({ filter, setFilter, primaryColor = "blue-600" }) => {
  const [open, setOpen] = useState(false);
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (newOption && !filter.options.includes(newOption)) {
      setFilter({ ...filter, options: [newOption, ...filter.options], selected: newOption });
      setNewOption("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addOption();
      e.preventDefault();
    }
  };

  return (
  <div className="relative w-full mb-6">
      <div
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-primary)',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        }}
        className="rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center focus:outline-none transition-all duration-200 hover:shadow-lg"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium tracking-wide">{filter.selected || filter.name}</span>
        <span className="ml-2 text-[var(--color-accent)] text-xs">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="absolute z-20 w-full rounded-xl mt-2 shadow-xl max-h-60 overflow-auto border border-[var(--color-border)] bg-[var(--color-surface)]">
          {/* Add new option input */}
          <div className="flex p-3 gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Add new ${filter.name.toLowerCase()}`}
              style={{
                background: 'var(--color-background)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
              }}
              className="flex-1 px-3 py-2 rounded-lg focus:outline-none"
            />
            <button
              onClick={addOption}
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-surface)',
              }}
              className="px-4 rounded-lg font-bold hover:opacity-80 transition"
            >
              +
            </button>
          </div>

          {/* Existing options */}
          {filter.options.map((opt, idx) => (
            <div
              key={idx}
              style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
              className="px-4 py-2 hover:bg-[var(--color-accent)]/10 rounded-lg transition-all duration-150"
              onClick={() => {
                setFilter({ ...filter, selected: opt });
                setOpen(false);
              }}
            >
              {opt}
            </div>
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
    { name: "Category", options: ["Coding", "Design", "Tutoring"], selected: "" },
    { name: "Location", options: ["MIT", "Stanford", "KUET"], selected: "" },
    { name: "Availability", options: ["Morning", "Afternoon", "Evening", "Weekends", "Flexible"], selected: "" },
    { name: "Free/Paid", options: ["Free", "Paid"], selected: "" },
  ]);

  const [newFilterName, setNewFilterName] = useState("");

  // Update main filters state
  useEffect(() => {
    const appliedFilters = {};
    filters.forEach((f) => {
      if (f.selected) {
        // Map filter names to the correct key names used in filtering
        const filterKey = f.name.toLowerCase() === 'free/paid' ? 'free' : 
                         f.name.toLowerCase() === 'availability' ? 'availability' : 
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

  const addNewFilterType = () => {
    if (newFilterName && !filters.some((f) => f.name.toLowerCase() === newFilterName.toLowerCase())) {
      setFiltersState([
        ...filters,
        { name: newFilterName, options: [], selected: "" },
      ]);
      setNewFilterName("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewFilterType();
      e.preventDefault();
    }
  };

  return (
    <div
      className="shadow-2xl rounded-2xl p-8 w-80 border border-[var(--color-border)]"
      style={{
        color: 'var(--color-surface)',
        background: 'linear-gradient(135deg, #29406b 80%, #3b5998 100%)',
      }}
    >
      <h2 className="text-2xl font-bold mb-8 tracking-wide" style={{ color: 'var(--color-surface)' }}>Filters</h2>

      {/* Existing filters */}
      {filters.map((filter, idx) => (
        <Filter
          key={idx}
          filter={filter}
          setFilter={(f) => updateFilter(idx, f)}
        />
      ))}

      {/* Add new filter type */}
      <div className="mt-6">
        <input
          type="text"
          value={newFilterName}
          onChange={(e) => setNewFilterName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add new filter (e.g., Gender)"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-border)',
          }}
          className="w-full px-4 py-3 rounded-lg mb-3 focus:outline-none"
        />
          <button
            onClick={addNewFilterType}
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-surface)',
            }}
            className="w-full px-4 py-3 rounded-lg font-bold hover:opacity-80 transition"
          >
            Add Filter
          </button>
      </div>
    </div>
  );
};

export default FiltersPanel;
