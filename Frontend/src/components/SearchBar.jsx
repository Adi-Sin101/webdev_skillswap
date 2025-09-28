import React from "react";

const SearchBar = ({ searchSkill, setSearchSkill, searchLocation, setSearchLocation }) => {
  return (
    <div
      className="flex flex-col md:flex-row gap-4 mb-6 shadow-2xl rounded-2xl p-6 border border-[var(--color-border)]"
      style={{
        color: 'var(--color-surface)',
        background: 'linear-gradient(135deg, #29406b 80%, #3b5998 100%)',
      }}
    >
      <input
        type="text"
        placeholder="Search skills or requests"
        value={searchSkill}
        onChange={(e) => setSearchSkill(e.target.value)}
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-primary)',
          border: '1px solid var(--color-border)',
        }}
  className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-gray-500"
      />
      <input
        type="text"
        placeholder="University / Location"
        value={searchLocation}
        onChange={(e) => setSearchLocation(e.target.value)}
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-primary)',
          border: '1px solid var(--color-border)',
        }}
  className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-gray-500"
      />
      <button
        style={{
          background: 'var(--color-accent)',
          color: 'var(--color-surface)',
        }}
        className="px-6 py-3 rounded-lg font-bold hover:opacity-80 transition shadow-lg"
      >
        Search 🔍
      </button>
    </div>
  );
};

export default SearchBar;
