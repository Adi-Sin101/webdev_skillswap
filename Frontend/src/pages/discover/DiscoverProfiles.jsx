import React, { useState } from "react";

// Dummy data for demonstration
const profiles = [
  {
    id: 1,
    name: "Amit Singh",
    university: "IIT Delhi",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    skills: ["Python", "Tutoring"],
  },
  {
    id: 2,
    name: "Sara Khan",
    university: "IIT Bombay",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    skills: ["Design", "Presentation"],
  },
  {
    id: 3,
    name: "John Doe",
    university: "IIT Madras",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    skills: ["Coding", "Speaking"],
  },
];

const DiscoverProfiles = () => {
  const [search, setSearch] = useState("");
  const filteredProfiles = profiles.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.university.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--color-primary)] py-12 px-6 md:px-12">
      <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8">Discover Student Profiles</h1>
      <div className="mb-8 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, university, or skill..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] shadow"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredProfiles.map(profile => (
          <div key={profile.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full mb-4 border-4 border-[var(--color-accent)] object-cover" />
            <h2 className="text-xl font-bold text-[var(--color-primary)] mb-1">{profile.name}</h2>
            <p className="text-gray-600 mb-2">{profile.university}</p>
            <div className="flex gap-2 flex-wrap justify-center mb-4">
              {profile.skills.map(skill => (
                <span key={skill} className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-semibold shadow">{skill}</span>
              ))}
            </div>
            <a href={`/profile/${profile.id}`} className="bg-[var(--color-accent)] text-[var(--color-surface)] font-bold px-6 py-2 rounded-lg shadow hover:opacity-90 transition">View Profile</a>
          </div>
        ))}
        {filteredProfiles.length === 0 && (
          <div className="col-span-3 text-center text-gray-500">No profiles found.</div>
        )}
      </div>
    </div>
  );
};

export default DiscoverProfiles;
