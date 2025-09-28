import React, { useState } from "react";
import PostOfferModal from '../../components/PostOfferModal';
import PostRequestModal from '../../components/PostRequestModal';

const dummyUser = {
  name: "Paakhi Maheshwari",
  university: "IIT Bombay",
  bio: "CS student specializing in ML & Data Science.",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  skills: ["Machine Learning", "Python", "Presentation", "Design"],
  badges: ["Top Helper", "Fast Responder"],
  rating: 4.8,
  completed: 12,
};

const dummyPastRequests = [
  { id: 1, title: "Need PPT design for seminar", status: "Completed" },
  { id: 2, title: "Help with Data Structures", status: "Completed" },
];

const initialOffers = [
  {
    id: 1,
    title: "Photoshop Tutoring",
    category: "Design",
    availability: "Weekends",
    location: "IIT Bombay",
    type: "Free",
    description: "Learn Photoshop basics and advanced techniques.",
  },
];

const initialRequests = [
  {
    id: 1,
    title: "Need PPT design for seminar",
    category: "Presentation",
    deadline: "This Week",
    location: "IIT Bombay",
    type: "Free",
    description: "Help needed for seminar presentation slides.",
  },
];

const categories = ["Coding", "Design", "Tutoring", "Speaking", "Presentation"];
const availabilities = ["Weekends", "Weekdays", "Flexible"];
const deadlines = ["Today", "This Week", "Flexible"];

const isOwner = false; // Change to false to simulate viewing another user's profile
const Profile = () => {
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [offers, setOffers] = useState(initialOffers);
  const [requests, setRequests] = useState(initialRequests);
  const [connectMenuOpen, setConnectMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    title: "",
    category: "",
    availability: "",
    date: "",
    location: "",
    type: "Free",
    description: "",
  });

  // Request form state
  const [requestForm, setRequestForm] = useState({
    title: "",
    category: "",
    deadline: "",
    location: "",
    type: "Free",
    description: "",
  });

  // Handlers
  const handleOfferChange = (e) => {
    const { name, value, type } = e.target;
    setOfferForm((f) => ({
      ...f,
      [name]: type === "radio" ? value : value,
    }));
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    setOffers((prev) => [
      ...prev,
      { ...offerForm, id: Date.now() },
    ]);
    setOfferModalOpen(false);
    setOfferForm({
      title: "",
      category: "",
      availability: "",
      date: "",
      location: "",
      type: "Free",
      description: "",
    });
  };

  const handleRequestChange = (e) => {
    const { name, value, type } = e.target;
    setRequestForm((f) => ({
      ...f,
      [name]: type === "radio" ? value : value,
    }));
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setRequests((prev) => [
      ...prev,
      { ...requestForm, id: Date.now() },
    ]);
    setRequestModalOpen(false);
    setRequestForm({
      title: "",
      category: "",
      deadline: "",
      location: "",
      type: "Free",
      description: "",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex flex-col py-0">
      {/* Top Info Bar */}
      <div className="w-full bg-white shadow-lg px-6 md:px-12 py-8 flex flex-col md:flex-row gap-8 items-center mt-8 relative">
        <div className="w-28 h-28 rounded-full border-4 border-[var(--color-accent)] overflow-hidden">
          <img src={dummyUser.avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-1">{dummyUser.name}</h2>
          <p className="text-gray-600 font-semibold mb-2">{dummyUser.university}</p>
          <p className="text-gray-700 mb-2">{dummyUser.bio}</p>
          <div className="flex gap-2 flex-wrap mb-2 justify-center md:justify-start">
            {dummyUser.skills.map(skill => (
              <span key={skill} className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-semibold shadow">{skill}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {isOwner ? (
            <div className="relative">
              <button
                className="bg-[var(--color-accent)] text-[var(--color-surface)] font-bold px-4 py-2 rounded-full shadow hover:opacity-90 transition flex items-center gap-2"
                onClick={() => setActionMenuOpen((open) => !open)}
                aria-label="Profile Actions"
                title="Profile Actions"
              >
                {/* Gear icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 3c.38-1.01 1.87-1.01 2.25 0l.22.59a1.13 1.13 0 001.45.68l.6-.22c.97-.36 1.91.58 1.55 1.55l-.22.6a1.13 1.13 0 00.68 1.45l.59.22c1.01.38 1.01 1.87 0 2.25l-.59.22a1.13 1.13 0 00-.68 1.45l.22.6c.36.97-.58 1.91-1.55 1.55l-.6-.22a1.13 1.13 0 00-1.45.68l-.22.59c-.38 1.01-1.87 1.01-2.25 0l-.22-.59a1.13 1.13 0 00-1.45-.68l-.6.22c-.97.36-1.91-.58-1.55-1.55l.22-.6a1.13 1.13 0 00-.68-1.45l-.59-.22c-1.01-.38-1.01-1.87 0-2.25l.59-.22a1.13 1.13 0 00.68-1.45l-.22-.6c-.36-.97.58-1.91 1.55-1.55l.6.22a1.13 1.13 0 001.45-.68l.22-.59z" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="text-base font-medium text-gray-600 select-none">Profile Actions</span>
              </button>
              {actionMenuOpen && (
                <div className="absolute top-12 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg py-2 w-48 flex flex-col text-left animate-fade-in">
                  <button className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left" onClick={() => {/* handle edit profile */ setActionMenuOpen(false);}}>Edit Profile</button>
                  <button className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left" onClick={() => {/* handle logout */ setActionMenuOpen(false);}}>Log out</button>
                  <button className="px-4 py-2 hover:bg-red-100 text-red-600 text-sm text-left" onClick={() => {/* handle delete account */ setActionMenuOpen(false);}}>Delete Account</button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                className="bg-[var(--color-accent)] text-[var(--color-surface)] font-bold px-6 py-2 rounded-lg shadow hover:opacity-90 transition flex items-center gap-2"
                onClick={() => setConnectMenuOpen((open) => !open)}
              >
                Connect
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {connectMenuOpen && (
                <div className="absolute top-12 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg py-2 w-56 flex flex-col text-left animate-fade-in">
                  <a href="mailto:paakhi.maheshwari@iitb.ac.in" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm2 0a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
                    Email
                  </a>
                  <a href="https://linkedin.com/in/paakhi-maheshwari" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.601 2.001 3.601 4.601v5.595z"/></svg>
                    LinkedIn
                  </a>
                  <a href="https://github.com/paakhi-maheshwari" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    GitHub
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats & Badges Bar */}
      <div className="w-full bg-gray-50 shadow px-6 md:px-12 py-6 flex gap-8 md:gap-12 items-center flex-wrap">
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 text-2xl">★</span>
          <span className="font-bold text-lg">{dummyUser.rating}</span>
          <span className="text-xs text-gray-500">Rating</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-teal-500 text-2xl">✅</span>
          <span className="font-bold text-lg">{dummyUser.completed}</span>
          <span className="text-xs text-gray-500">Completed</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-indigo-500 text-2xl">🏅</span>
          <div className="flex gap-1 flex-wrap">
            {dummyUser.badges.map(badge => (
              <span key={badge} className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-semibold shadow">{badge}</span>
            ))}
          </div>
          <span className="text-xs text-gray-500">Badges</span>
        </div>
        {typeof isOwner !== 'undefined' && isOwner && (
          <div className="flex gap-4 ml-auto">
            <button className="bg-[var(--color-accent)] text-[var(--color-surface)] font-bold px-6 py-2 rounded-lg shadow hover:opacity-90 transition" onClick={() => setOfferModalOpen(true)}>Post Offer</button>
            <button className="border border-[var(--color-accent)] text-[var(--color-accent)] font-bold px-6 py-2 rounded-lg shadow hover:bg-[var(--color-accent)] hover:text-[var(--color-surface)] transition" onClick={() => setRequestModalOpen(true)}>Post Request</button>
          </div>
        )}
      </div>

      {/* Main Feed Section */}
      <div className="flex flex-col md:flex-row gap-8 px-6 md:px-12 py-8 w-full">
        {/* Completed Offers from other students */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">Completed Offers (Other Students)</h3>
          <div className="flex flex-col gap-3 mb-8">
            {/* Replace with real completed offers from other students */}
            {[{id: 101, title: "Python Tutoring", student: "Amit Singh", status: "Completed"}].map(offer => (
              <div key={offer.id} className="bg-green-50 rounded-lg px-6 py-4 flex justify-between items-center shadow">
                <span className="text-gray-700 text-base">{offer.title} <span className="text-xs text-gray-500">by {offer.student}</span></span>
                <span className="text-green-600 text-sm font-bold">{offer.status}</span>
              </div>
            ))}
          </div>
        </div>
        {/* User's Own Post Offers */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">Your Offers</h3>
          <div className="flex flex-col gap-3 mb-8">
            {offers.map(offer => (
              <div key={offer.id} className="bg-white rounded-lg px-6 py-4 shadow border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg text-[var(--color-primary)]">{offer.title}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{offer.category}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-500 mb-2">
                  <span>{offer.availability}</span>
                  <span>{offer.location}</span>
                  <span>{offer.type}</span>
                </div>
                <div className="text-gray-700 text-sm mb-2">{offer.description}</div>
              </div>
            ))}
          </div>
        </div>
        {/* User's Post Requests */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">Your Requests</h3>
          <div className="flex flex-col gap-3 mb-8">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-lg px-6 py-4 shadow border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg text-[var(--color-primary)]">{request.title}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{request.category}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-500 mb-2">
                  <span>{request.deadline}</span>
                  <span>{request.location}</span>
                  <span>{request.type}</span>
                </div>
                <div className="text-gray-700 text-sm mb-2">{request.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {typeof isOwner !== 'undefined' && isOwner && (
        <>
          <PostOfferModal
            open={offerModalOpen}
            onClose={() => setOfferModalOpen(false)}
            onSubmit={handleOfferSubmit}
            form={offerForm}
            onChange={handleOfferChange}
            categories={categories}
            availabilities={availabilities}
          />
          <PostRequestModal
            open={requestModalOpen}
            onClose={() => setRequestModalOpen(false)}
            onSubmit={handleRequestSubmit}
            form={requestForm}
            onChange={handleRequestChange}
            categories={categories}
            deadlines={deadlines}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
