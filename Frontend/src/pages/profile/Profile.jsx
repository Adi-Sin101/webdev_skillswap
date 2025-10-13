import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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

const Profile = () => {
  const { id } = useParams();
  
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [connectMenuOpen, setConnectMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  
  // Get logged-in user ID (will be set after fetching user data)
  const loggedInUserId = user?._id;
  const isOwner = !id || id === loggedInUserId;

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



  const handleRequestChange = (e) => {
    const { name, value, type } = e.target;
    setRequestForm((f) => ({
      ...f,
      [name]: type === "radio" ? value : value,
    }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestForm, userId: loggedInUserId })
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(prev => [data.request, ...prev]);
        setRequestModalOpen(false);
        setRequestForm({
          title: "",
          category: "",
          deadline: "",
          location: "",
          type: "Free",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  // Fetch user data and their offers/requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = id || loggedInUserId;
        
        // If no users exist, use dummy data
        const usersResponse = await fetch("http://localhost:5000/api/users");
        const usersData = await usersResponse.json();
        
        if (usersData.count === 0) {
          // Create a test user if none exist
          console.log("No users found, creating test user...");
          const createUserResponse = await fetch("http://localhost:5000/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "Test User",
              email: "test@skillswap.com",
              university: "IIT Bombay",
              bio: "Test user for SkillSwap",
              skills: ["JavaScript", "React", "MongoDB"]
            })
          });
          const newUserData = await createUserResponse.json();
          console.log("Created user:", newUserData);
          setUser(newUserData.user);
          setOffers([]);
          setRequests([]);
        } else {
          // Fetch real user data (for now, use first user or create one)
          setUser(usersData.users[0] || dummyUser);
          
          // Fetch offers and requests
          const [offersRes, requestsRes] = await Promise.all([
            fetch("http://localhost:5000/api/offers"),
            fetch("http://localhost:5000/api/requests")
          ]);
          
          const offersData = await offersRes.json();
          const requestsData = await requestsRes.json();
          
          setOffers(offersData.offers || []);
          setRequests(requestsData.requests || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to dummy data
        setUser(dummyUser);
        setOffers(initialOffers);
        setRequests(initialRequests);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, loggedInUserId]);

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting offer with form data:", offerForm);
    console.log("Using userId:", loggedInUserId);
    
    try {
      const response = await fetch("http://localhost:5000/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...offerForm, userId: loggedInUserId })
      });
      const data = await response.json();
      console.log("API response:", data);
      
      if (response.ok) {
        console.log("Offer created successfully!");
        setOffers(prev => [data.offer, ...prev]);
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
        alert("Offer created successfully!");
      } else {
        console.error("API error:", data);
        alert(`Error: ${data.error || "Failed to create offer"}`);
      }
    } catch (error) {
      console.error("Error creating offer:", error);
      alert("Network error. Check if backend is running on localhost:5000");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center">
        <div className="text-xl font-bold text-[var(--color-primary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex flex-col py-0">
      {/* Top Info Bar */}
      {/* If viewing another user's profile, show a banner */}
      {!isOwner && (
        <div className="w-full bg-yellow-100 text-yellow-800 text-center py-2 font-semibold">You are viewing another user's profile</div>
      )}
      <div className="w-full bg-white shadow-lg px-6 md:px-12 py-8 flex flex-col md:flex-row gap-8 items-center mt-8 relative">
        <div className="w-28 h-28 rounded-full border-4 border-[var(--color-accent)] overflow-hidden">
          <img src={user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg"} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-1">{user?.name || "Loading..."}</h2>
          <p className="text-gray-600 font-semibold mb-2">{user?.university || ""}</p>
          <p className="text-gray-700 mb-2">{user?.bio || ""}</p>
          <div className="flex gap-2 flex-wrap mb-2 justify-center md:justify-start">
            {(user?.skills || []).map(skill => (
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
          <span className="font-bold text-lg">{user?.rating || 4.5}</span>
          <span className="text-xs text-gray-500">Rating</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-teal-500 text-2xl">✅</span>
          <span className="font-bold text-lg">{offers.length}</span>
          <span className="text-xs text-gray-500">Offers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-indigo-500 text-2xl">🏅</span>
          <div className="flex gap-1 flex-wrap">
            {(user?.badges || ["New User"]).map(badge => (
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
        {/* Completed Activities */}
        <div className="flex-1">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">
                  Completed Activities
                </h3>
                <p className="text-green-100 text-sm">Your successful skill exchanges</p>
              </div>
              <Link 
                to="/completed-activities" 
                className="text-green-100 text-sm font-medium hover:text-white flex items-center gap-1 bg-green-600 px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
              >
                View All 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg p-4 mb-4">
            <div className="flex flex-col gap-3">
            {/* Sample completed activities */}
            {[
              {id: 101, title: "Python Tutoring", student: "Amit Singh", status: "Completed", type: "helped", date: "2 days ago"},
              {id: 102, title: "React Help", student: "Priya Sharma", status: "Completed", type: "received", date: "1 week ago"}
            ].map(activity => (
              <div key={activity.id} className="rounded-lg px-6 py-4 shadow border-l-4 bg-green-50 border-green-400">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-gray-800">{activity.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        activity.type === 'helped' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.type === 'helped' ? 'You helped' : 'You learned'}
                      </span>
                      <span className="text-xs text-gray-500">with {activity.student}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                      Completed
                    </span>
                    <div className="text-xs text-gray-400 mt-1">{activity.date}</div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
        {/* User's Own Post Offers */}
        <div className="flex-1">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-3 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">
                  Your Skill Offers
                </h3>
                <p className="text-blue-100 text-sm">Skills you're offering to share</p>
              </div>
              <Link 
                to="/my-offers" 
                className="text-blue-100 text-sm font-medium hover:text-white flex items-center gap-1 bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg p-4 mb-4">
            <div className="flex flex-col gap-3">
            {offers.slice(0, 3).map(offer => {
              // Add random status for demo
              const status = Math.random() > 0.5 ? 'completed' : 'pending';
              const responses = Math.floor(Math.random() * 5);
              
              return (
                <div key={offer.id} className="bg-white rounded-lg px-6 py-4 shadow border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg text-[var(--color-primary)]">{offer.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{offer.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500 mb-2">
                    <span>{offer.availability}</span>
                    <span>{offer.location}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      offer.type === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {offer.type}
                    </span>
                  </div>
                  <div className="text-gray-700 text-sm mb-3 line-clamp-2">{offer.description}</div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{responses} responses</span>
                    <span className="text-xs text-gray-400">
                      {new Date(offer.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {offers.length === 0 && (
              <div className="bg-gray-50 rounded-lg px-6 py-8 text-center">
                <p className="text-gray-500">No offers posted yet</p>
              </div>
            )}
            </div>
          </div>
        </div>
        {/* User's Post Requests */}
        <div className="flex-1">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-3 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">
                  Your Skill Requests
                </h3>
                <p className="text-indigo-100 text-sm">Skills you're looking to learn</p>
              </div>
              <Link 
                to="/my-requests" 
                className="text-indigo-100 text-sm font-medium hover:text-white flex items-center gap-1 bg-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View All 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-b-lg shadow-lg p-4 mb-4">
            <div className="flex flex-col gap-3">
            {requests.slice(0, 3).map(request => {
              // Add random status for demo
              const status = Math.random() > 0.5 ? 'completed' : 'pending';
              const offers = Math.floor(Math.random() * 3);
              
              return (
                <div key={request.id} className="bg-white rounded-lg px-6 py-4 shadow border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg text-[var(--color-primary)]">{request.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {status === 'completed' ? 'Completed' : 'Seeking Help'}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{request.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      request.deadline === 'Today' 
                        ? 'bg-red-100 text-red-800' 
                        : request.deadline === 'This Week' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {request.deadline}
                    </span>
                    <span>{request.location}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      request.type === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {request.type}
                    </span>
                  </div>
                  <div className="text-gray-700 text-sm mb-3 line-clamp-2">{request.description}</div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{offers} offers received</span>
                    <span className="text-xs text-gray-400">
                      {new Date(request.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {requests.length === 0 && (
              <div className="bg-gray-50 rounded-lg px-6 py-8 text-center">
                <p className="text-gray-500">No requests posted yet</p>
              </div>
            )}
            </div>
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
