import React, { useState } from "react";

const Sidebar = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [selectedSkill, setSelectedSkill] = useState(null);
  const popularSkills = ["Python", "PPT", "ML", "React", "Design", "Speaking"];
  const activeUniversities = ["MIT", "Stanford", "KUET"];

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="w-full space-y-6 bg-white rounded-xl shadow-xl p-4 border border-gray-200">
      {/* Popular Skills */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          🔥 Popular Skills This Week
        </h3>
        <ul className="space-y-2">
          {popularSkills.map((skill, idx) => (
            <li
              key={idx}
              className={`px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 cursor-pointer transition font-semibold ${selectedSkill === skill ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedSkill(skill)}
            >
              {skill}
            </li>
          ))}
        </ul>
        {selectedSkill && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-blue-900 font-medium shadow">
            Showing posts for <span className="font-bold">{selectedSkill}</span>
            <button className="ml-4 text-xs text-blue-600 underline" onClick={() => setSelectedSkill(null)}>Clear</button>
          </div>
        )}
      </div>

      {/* Active Universities */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          🎓 Active Universities
        </h3>
        <ul className="space-y-2">
          {activeUniversities.map((uni, idx) => (
            <li
              key={idx}
              className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 cursor-pointer transition"
            >
              {uni}
            </li>
          ))}
        </ul>
      </div>

      {/* Subscribe */}
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          📬 Subscribe for Updates
        </h3>
        {!subscribed ? (
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={handleSubscribe}
              className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition"
            >
              Subscribe
            </button>
          </div>
        ) : (
          <p className="text-green-600 font-semibold">Subscribed successfully! ✅</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
