import React from 'react'

const user = {
  name: "Paakhi Maheshwari",
  university: "IIT Bombay",
  bio: "CS student specializing in ML & Data Science.",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  skills: ["Machine Learning", "Python", "Presentation", "Design"],
  badges: ["Top Helper", "Fast Responder"],
  rating: 4.8,
  completed: 12,
  categories: ["Coding", "Design"],
};

const pastRequests = [
  { id: 1, title: "Need PPT design for seminar", status: "Completed" },
  { id: 2, title: "Help with Data Structures", status: "Completed" },
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex flex-col py-0">
      {/* Top Info Bar */}
  <div className="w-full bg-white shadow-lg px-12 py-8 flex gap-8 items-center mt-8">
        <div className="w-28 h-28 rounded-full border-4 border-[var(--color-accent)] overflow-hidden">
          <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-1">{user.name}</h2>
          <p className="text-gray-600 font-semibold mb-2">{user.university}</p>
          <p className="text-gray-700 mb-2">{user.bio}</p>
          <div className="flex gap-2 flex-wrap mb-2">
            {user.skills.map(skill => (
              <span key={skill} className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-semibold shadow">{skill}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button className="bg-[var(--color-accent)] text-[var(--color-surface)] font-bold px-6 py-2 rounded-lg shadow hover:opacity-90 transition">Edit Profile</button>
        </div>
      </div>

      {/* Stats & Badges Bar */}
      <div className="w-full bg-gray-50 shadow px-12 py-6 flex gap-12 items-center">
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 text-2xl">★</span>
          <span className="font-bold text-lg">{user.rating}</span>
          <span className="text-xs text-gray-500">Rating</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-teal-500 text-2xl">✅</span>
          <span className="font-bold text-lg">{user.completed}</span>
          <span className="text-xs text-gray-500">Completed</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-indigo-500 text-2xl">🏅</span>
          <div className="flex gap-1 flex-wrap">
            {user.badges.map(badge => (
              <span key={badge} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-semibold shadow">{badge}</span>
            ))}
          </div>
          <span className="text-xs text-gray-500">Badges</span>
        </div>
        <div className="flex gap-4 ml-auto">
          <button className="bg-[var(--color-accent)] text-[var(--color-surface)] font-bold px-6 py-2 rounded-lg shadow hover:opacity-90 transition">Post Offer</button>
          <button className="border border-[var(--color-accent)] text-[var(--color-accent)] font-bold px-6 py-2 rounded-lg shadow hover:bg-[var(--color-accent)] hover:text-[var(--color-surface)] transition">Post Request</button>
        </div>
      </div>

      {/* Main Feed Section */}
      <div className="flex flex-row gap-8 px-12 py-8 w-full">
        {/* Past Requests Feed */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">Past Requests</h3>
          <div className="flex flex-col gap-3">
            {pastRequests.map(req => (
              <div key={req.id} className="bg-gray-100 rounded-lg px-6 py-4 flex justify-between items-center shadow">
                <span className="text-gray-700 text-base">{req.title}</span>
                <span className="text-green-600 text-sm font-bold">{req.status}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Edit Profile Section */}
        <div className="w-96 bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 h-fit">
          <h3 className="text-lg font-bold text-[var(--color-primary)] mb-2">Edit Profile</h3>
          <form className="flex flex-col gap-3">
            <input type="text" defaultValue={user.bio} className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-gray-50 text-gray-900 focus:outline-none" placeholder="Edit bio" />
            <input type="file" className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-gray-50 text-gray-900 focus:outline-none" />
            <select multiple className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-gray-50 text-gray-900 focus:outline-none">
              {user.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button type="submit" className="w-full py-2 rounded-lg font-bold bg-[var(--color-accent)] text-[var(--color-surface)] shadow-lg hover:opacity-90 transition">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile
