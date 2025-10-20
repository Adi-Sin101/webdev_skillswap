import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DiscoverProfiles = () => {
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users from the API
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/users");
        const data = await response.json();
        
        if (response.ok) {
          setProfiles(data.users || []);
        } else {
          console.error("Failed to fetch profiles:", data.error);
          setProfiles([]);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.university.toLowerCase().includes(search.toLowerCase()) ||
      (p.skills && p.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-12 px-6 md:px-12 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-12 px-6 md:px-12">
      <h1 className="text-3xl font-bold text-white mb-8">Discover Student Profiles</h1>
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
          <div key={profile._id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <img 
              src={profile.avatar || "https://randomuser.me/api/portraits/men/1.jpg"} 
              alt={profile.name} 
              className="w-24 h-24 rounded-full mb-4 border-4 border-[var(--color-accent)] object-cover" 
            />
            <h2 className="text-xl font-bold text-[var(--color-primary)] mb-1">{profile.name}</h2>
            <p className="text-gray-600 mb-2">{profile.university || "Student"}</p>
            <div className="flex gap-2 flex-wrap justify-center mb-4">
              {(profile.skills || []).map(skill => (
                <span key={skill} className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-semibold shadow">{skill}</span>
              ))}
            </div>
            <Link 
              to={`/profile/${profile._id}`} 
              className="bg-[var(--color-accent)] text-[var(--color-surface)] font-bold px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
            >
              View Profile
            </Link>
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
