import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import PostOfferModal from '../../components/PostOfferModal';
import PostRequestModal from '../../components/PostRequestModal';
import ProfilePictureUpload from '../../components/ProfilePictureUpload';
import { useAuth } from '../../contexts/AuthContext';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, logout } = useAuth(); // Get authenticated user and logout function
  
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [connectMenuOpen, setConnectMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState(null); // 'none', 'pending', 'accepted', 'ignored'
  const [connectionData, setConnectionData] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionsCount, setConnectionsCount] = useState(0);
  
  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    university: "",
    bio: "",
    skills: [],
    social: {
      linkedin: "",
      github: "",
      email: ""
    }
  });
  const [universities, setUniversities] = useState([]);
  const [searchUniversity, setSearchUniversity] = useState("");
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [isUniversityOpen, setIsUniversityOpen] = useState(false);
  
  // Function to start conversation with admin
  const handleMessageAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participants: [loggedInUserId, user._id]
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/messages/${data.conversation._id}`);
      } else {
        console.error('Failed to create conversation');
        // Fallback: navigate to messages page
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Fallback: navigate to messages page
      navigate('/messages');
    }
  };

  // Get logged-in user ID from auth context
  const loggedInUserId = authUser?._id;
  const isOwner = !id || id === loggedInUserId;

  // Fetch universities on component mount
  React.useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/universities');
        const data = await response.json();
        if (data.universities) {
          setUniversities(data.universities);
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };
    fetchUniversities();
  }, []);

  // Filter universities based on search
  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchUniversity.toLowerCase()) ||
    uni.location.toLowerCase().includes(searchUniversity.toLowerCase())
  );

  const selectUniversity = (university) => {
    setProfileForm(prev => ({
      ...prev,
      university: university.name
    }));
    setSearchUniversity(university.name);
    setShowUniversityDropdown(false);
  };

  // Debug logging
  useEffect(() => {
    console.log('🔍 Profile Debug Info:');
    console.log('Auth User:', authUser);
    console.log('Logged In User ID:', loggedInUserId);
    console.log('Profile User ID (from URL):', id);
    console.log('Is Owner:', isOwner);
  }, [authUser, loggedInUserId, id, isOwner]);

  // Offer form state
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    category: "",
    skillLevel: "Intermediate",
    prerequisites: "",
    whatYouWillLearn: [],
    sessionType: "One-time",
    sessionDuration: "",
    totalDuration: "",
    deliveryMethod: "Both",
    location: "",
    availability: "",
    preferredSchedule: "",
    maxStudents: 1,
    price: 0,
    isPaid: false,
    tags: []
  });

  // Request form state
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    category: "",
    skillLevel: "Beginner",
    prerequisites: "",
    whatYouWillLearn: [],
    sessionType: "One-time",
    sessionDuration: "",
    totalDuration: "",
    deliveryMethod: "Both",
    location: "",
    availability: "",
    preferredSchedule: "",
    price: 0,
    isPaid: false,
    tags: []
  });

  // Handlers
  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setOfferForm((f) => ({
        ...f,
        [name]: checked,
      }));
    } else if (typeof value === 'object') {
      // Handle complex objects
      setOfferForm((f) => ({
        ...f,
        [name]: value,
      }));
    } else {
      setOfferForm((f) => ({
        ...f,
        [name]: value,
      }));
    }
  };



  const handleRequestChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setRequestForm((f) => ({
        ...f,
        [name]: checked,
      }));
    } else if (typeof value === 'object') {
      // Handle complex objects like contactInfo
      setRequestForm((f) => ({
        ...f,
        [name]: value,
      }));
    } else {
      setRequestForm((f) => ({
        ...f,
        [name]: value,
      }));
    }
  };

  // Profile action handlers
  const handleEditProfile = () => {
    // Initialize form with current user data
    setProfileForm({
      name: user?.name || "",
      university: user?.university || "",
      bio: user?.bio || "",
      skills: user?.skills || [],
      social: {
        linkedin: user?.social?.linkedin || "",
        github: user?.social?.github || "",
        email: user?.social?.email || user?.email || ""
      }
    });
    setIsEditingProfile(true);
    setActionMenuOpen(false);
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setProfileForm(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value
        }
      }));
    } else if (name === 'skills') {
      // Handle skills as comma-separated values
      const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
      setProfileForm(prev => ({
        ...prev,
        skills: skillsArray
      }));
    } else {
      setProfileForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${loggedInUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
      } else {
        alert(`Error: ${data.error || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({
      name: "",
      university: "",
      bio: "",
      skills: [],
      social: {
        linkedin: "",
        github: "",
        email: ""
      }
    });
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    setActionMenuOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement delete account functionality
      alert('Delete account functionality will be implemented soon.');
      setActionMenuOpen(false);
    }
  };

  // Connection handlers
  const fetchConnectionStatus = async () => {
    if (!user?._id || !loggedInUserId || isOwner) {
      console.log('⏭️ Skipping connection status fetch:', { 
        hasUser: !!user?._id, 
        hasLoggedInUserId: !!loggedInUserId, 
        isOwner 
      });
      return;
    }
    
    console.log('🔍 Fetching connection status between:', loggedInUserId, 'and', user._id);
    
    try {
      const response = await fetch(`http://localhost:5000/api/connections/status/${loggedInUserId}/${user._id}`);
      const data = await response.json();
      
      console.log('Connection status response:', data);
      
      if (response.ok) {
        setConnectionStatus(data.status);
        setConnectionData(data.connection);
        console.log('✅ Connection status set to:', data.status);
      } else {
        console.error('❌ Failed to fetch connection status:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching connection status:', error);
    }
  };

  const fetchConnectionsCount = async () => {
    if (!user?._id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/connections/user/${user._id}?status=accepted`);
      const data = await response.json();
      
      if (response.ok) {
        setConnectionsCount(data.counts?.accepted || 0);
      }
    } catch (error) {
      console.error('Error fetching connections count:', error);
    }
  };

  const handleSendConnectionRequest = async () => {
    if (!user?._id || !loggedInUserId) {
      console.error('❌ Missing required IDs:', { userId: user?._id, loggedInUserId });
      alert('Error: User information is missing. Please refresh the page and try again.');
      return;
    }
    
    setConnectionLoading(true);
    
    const requestBody = {
      requesterId: loggedInUserId,
      recipientId: user._id,
      message: `Hi ${user.name}, I'd like to connect with you on SkillSwap!`
    };
    
    console.log('📨 Sending connection request:', requestBody);
    
    try {
      const response = await fetch('http://localhost:5000/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);
      
      if (response.ok) {
        setConnectionStatus('pending');
        setConnectionData(data.connection);
        alert('Connection request sent successfully!');
      } else {
        console.error('❌ Connection request failed:', data);
        alert(`Error: ${data.error || 'Failed to send connection request'}`);
      }
    } catch (error) {
      console.error('❌ Network error sending connection request:', error);
      alert('Network error. Please try again.');
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleAcceptConnection = async () => {
    if (!connectionData?._id) return;
    
    setConnectionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/connections/${connectionData._id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUserId })
      });

      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('accepted');
        setConnectionData(data.connection);
        alert('Connection request accepted!');
      } else {
        alert(`Error: ${data.error || 'Failed to accept connection'}`);
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      alert('Network error. Please try again.');
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleIgnoreConnection = async () => {
    if (!connectionData?._id) return;
    
    setConnectionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/connections/${connectionData._id}/ignore`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUserId })
      });

      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus('ignored');
        setConnectionData(data.connection);
        alert('Connection request ignored.');
      } else {
        alert(`Error: ${data.error || 'Failed to ignore connection'}`);
      }
    } catch (error) {
      console.error('Error ignoring connection:', error);
      alert('Network error. Please try again.');
    } finally {
      setConnectionLoading(false);
    }
  };

  const getConnectionButtonText = () => {
    if (connectionLoading) return 'Loading...';
    
    switch (connectionStatus) {
      case 'pending':
        // Check if current user is the requester or recipient
        if (connectionData?.requester._id === loggedInUserId) {
          return 'Request Sent';
        } else {
          return 'Respond to Request';
        }
      case 'accepted':
        return 'Connected';
      case 'ignored':
        return 'Request Ignored';
      default:
        return 'Connect';
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRequestId) {
        // Edit existing request
        const response = await fetch(`http://localhost:5000/api/requests/${editingRequestId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...requestForm, userId: loggedInUserId })
        });
        const data = await response.json();
        
        if (response.ok) {
          console.log("Request updated successfully!");
          setRequests(prev => prev.map(request => 
            (request.id || request._id) === editingRequestId ? data.request : request
          ));
          setRequestModalOpen(false);
          setEditingRequestId(null);
          setRequestForm({
            title: "",
            description: "",
            category: "",
            skillLevel: "Beginner",
            prerequisites: "",
            whatYouWillLearn: [],
            sessionType: "One-time",
            sessionDuration: "",
            totalDuration: "",
            deliveryMethod: "Both",
            location: "",
            availability: "",
            preferredSchedule: "",
            price: 0,
            isPaid: false,
            tags: []
          });
          alert("Request updated successfully!");
          // Redirect back to MyRequests page after successful edit
          navigate('/my-requests');
        } else {
          console.error("API error:", data);
          alert(`Error: ${data.error || "Failed to update request"}`);
        }
      } else {
        // Create new request
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
            description: "",
            category: "",
            skillLevel: "Beginner",
            prerequisites: "",
            whatYouWillLearn: [],
            sessionType: "One-time",
            sessionDuration: "",
            totalDuration: "",
            deliveryMethod: "Both",
            location: "",
            availability: "",
            preferredSchedule: "",
            price: 0,
            isPaid: false,
            tags: []
          });
          alert("Request created successfully!");
        } else {
          console.error("API error:", data);
          alert(`Error: ${data.error || "Failed to create request"}`);
        }
      }
    } catch (error) {
      console.error("Error with request:", error);
      alert("Network error. Check if backend is running on localhost:5000");
    }
  };

  // Fetch user data and their offers/requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Determine which user profile to show
        let profileUser;
        if (id) {
          // Viewing another user's profile
          const userResponse = await fetch(`http://localhost:5000/api/users/${id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            profileUser = userData.user;
          } else {
            console.error("Failed to fetch user profile");
            setUser(dummyUser);
            setLoading(false);
            return;
          }
        } else {
          // Viewing own profile - use authenticated user data
          profileUser = authUser;
        }
        
        if (!profileUser) {
          console.error("No user data available");
          setUser(dummyUser);
          setLoading(false);
          return;
        }
        
        setUser(profileUser);
        
        // Fetch user-specific offers and requests
        const targetUserId = profileUser._id;
        
        try {
          const [offersRes, requestsRes] = await Promise.all([
            fetch(`http://localhost:5000/api/offers/user/${targetUserId}`),
            fetch(`http://localhost:5000/api/requests/user/${targetUserId}`)
          ]);
          
          const offersData = offersRes.ok ? await offersRes.json() : { offers: [] };
          const requestsData = requestsRes.ok ? await requestsRes.json() : { requests: [] };
          
          const offers = offersData.offers || [];
          const requests = requestsData.requests || [];
          
          // Fetch response counts for offers and requests
          try {
            let offersWithCounts = offers;
            let requestsWithCounts = requests;
            
            if (offers.length > 0) {
              const offerIDs = offers.map(offer => offer._id || offer.id);
              const offerCountsRes = await fetch('http://localhost:5000/api/responses/offers/response-counts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerIDs })
              });
              
              if (offerCountsRes.ok) {
                const { responseCounts } = await offerCountsRes.json();
                offersWithCounts = offers.map(offer => ({
                  ...offer,
                  responseCount: responseCounts[offer._id || offer.id] || 0
                }));
              }
            }
            
            if (requests.length > 0) {
              const requestIDs = requests.map(request => request._id || request.id);
              const requestCountsRes = await fetch('http://localhost:5000/api/responses/requests/response-counts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestIDs })
              });
              
              if (requestCountsRes.ok) {
                const { responseCounts } = await requestCountsRes.json();
                requestsWithCounts = requests.map(request => ({
                  ...request,
                  responseCount: responseCounts[request._id || request.id] || 0
                }));
              }
            }
            
            setOffers(offersWithCounts);
            setRequests(requestsWithCounts);
          } catch (countError) {
            console.warn("Failed to fetch response counts:", countError);
            // Still set the offers and requests without counts
            setOffers(offers);
            setRequests(requests);
          }
        } catch (apiError) {
          console.warn("Failed to fetch user-specific data, using empty arrays:", apiError);
          setOffers([]);
          setRequests([]);
        }
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
        // Fallback to authenticated user or dummy data
        setUser(authUser || dummyUser);
        setOffers([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if we have auth data loaded
    if (!authLoading) {
      fetchData();
    }
  }, [id, authUser, authLoading]);

  // Fetch connection status when viewing another user's profile
  useEffect(() => {
    if (user && loggedInUserId && !isOwner && !authLoading) {
      fetchConnectionStatus();
    }
    // Fetch connections count for any user (including own profile)
    if (user && !authLoading) {
      fetchConnectionsCount();
    }
  }, [user, loggedInUserId, isOwner, authLoading]);

  // Handle edit states from navigation
  useEffect(() => {
    // Only process edit states if they exist and haven't been processed yet
    if (location.state?.editOffer && offers.length > 0 && !editingOfferId) {
      const offerToEdit = offers.find(o => (o.id || o._id) === location.state.editOffer);
      if (offerToEdit) {
        setOfferForm({
          title: offerToEdit.title || "",
          category: offerToEdit.category || "",
          availability: offerToEdit.availability || "",
          date: offerToEdit.date || "",
          location: offerToEdit.location || "",
          type: offerToEdit.type || "Free",
          description: offerToEdit.description || "",
        });
        setEditingOfferId(location.state.editOffer);
        setOfferModalOpen(true);
        // Clear the navigation state after processing
        setTimeout(() => {
          navigate(location.pathname, { replace: true, state: {} });
        }, 100);
      }
    }
    
    if (location.state?.editRequest && requests.length > 0 && !editingRequestId) {
      const requestToEdit = requests.find(r => (r.id || r._id) === location.state.editRequest);
      if (requestToEdit) {
        setRequestForm({
          title: requestToEdit.title || "",
          description: requestToEdit.description || "",
          category: requestToEdit.category || "",
          skillLevel: requestToEdit.skillLevel || "Beginner",
          prerequisites: requestToEdit.prerequisites || "",
          whatYouWillLearn: requestToEdit.whatYouWillLearn || [],
          sessionType: requestToEdit.sessionType || "One-time",
          sessionDuration: requestToEdit.sessionDuration || "",
          totalDuration: requestToEdit.totalDuration || "",
          deliveryMethod: requestToEdit.deliveryMethod || "Both",
          location: requestToEdit.location || "",
          availability: requestToEdit.availability || "",
          preferredSchedule: requestToEdit.preferredSchedule || "",
          price: requestToEdit.price || 0,
          isPaid: requestToEdit.isPaid || false,
          tags: requestToEdit.tags || []
        });
        setEditingRequestId(location.state.editRequest);
        setRequestModalOpen(true);
        // Clear the navigation state after processing
        setTimeout(() => {
          navigate(location.pathname, { replace: true, state: {} });
        }, 100);
      }
    }
  }, [location.state, offers, requests, editingOfferId, editingRequestId, navigate, location.pathname]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen && !event.target.closest('.action-menu-container')) {
        setActionMenuOpen(false);
      }
    };

    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [actionMenuOpen]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showLogoutModal) {
          setShowLogoutModal(false);
        } else if (isEditingProfile) {
          setIsEditingProfile(false);
        }
      }
    };

    if (showLogoutModal || isEditingProfile) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [showLogoutModal, isEditingProfile]);

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting offer with form data:", offerForm);
    console.log("Using userId:", loggedInUserId);
    
    try {
      if (editingOfferId) {
        // Edit existing offer
        const response = await fetch(`http://localhost:5000/api/offers/${editingOfferId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...offerForm, userId: loggedInUserId })
        });
        const data = await response.json();
        
        if (response.ok) {
          console.log("Offer updated successfully!");
          setOffers(prev => prev.map(offer => 
            (offer.id || offer._id) === editingOfferId ? data.offer : offer
          ));
          setOfferModalOpen(false);
          setEditingOfferId(null);
          setOfferForm({
            title: "",
            description: "",
            category: "",
            skillLevel: "Intermediate",
            prerequisites: "",
            whatYouWillLearn: [],
            sessionType: "One-time",
            sessionDuration: "",
            totalDuration: "",
            deliveryMethod: "Both",
            location: "",
            availability: "",
            preferredSchedule: "",
            maxStudents: 1,
            price: 0,
            isPaid: false,
            tags: []
          });
          alert("Offer updated successfully!");
          // Redirect back to MyOffers page after successful edit
          navigate('/my-offers');
        } else {
          console.error("API error:", data);
          alert(`Error: ${data.error || "Failed to update offer"}`);
        }
      } else {
        // Create new offer
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
            description: "",
            category: "",
            skillLevel: "Intermediate",
            prerequisites: "",
            whatYouWillLearn: [],
            sessionType: "One-time",
            sessionDuration: "",
            totalDuration: "",
            deliveryMethod: "Both",
            location: "",
            availability: "",
            preferredSchedule: "",
            maxStudents: 1,
            price: 0,
            isPaid: false,
            tags: []
          });
          alert("Offer created successfully!");
        } else {
          console.error("API error:", data);
          alert(`Error: ${data.error || "Failed to create offer"}`);
        }
      }
    } catch (error) {
      console.error("Error with offer:", error);
      alert("Network error. Check if backend is running on localhost:5000");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex flex-col pt-20 md:pt-24">
      <div className="w-full bg-white shadow-lg px-6 md:px-12 py-8 flex flex-col md:flex-row gap-8 items-center mt-4 relative">
        <ProfilePictureUpload 
          user={user} 
          onProfilePictureUpdate={(updatedUser) => setUser(updatedUser)}
        />
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
            <div className="relative action-menu-container">
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
                  <button 
                    className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2" 
                    onClick={handleEditProfile}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                  <Link 
                    to="/my-applications"
                    className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2 w-full"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4m16 0l-2-2m2 2l-2 2M4 13l2-2m-2 2l2 2" />
                    </svg>
                    View Applications
                  </Link>
                  {/* Accepted Swaps page removed; consolidated into MyApplications */}
                  <button 
                    className="px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm text-left flex items-center gap-2" 
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                  <button 
                    className="px-4 py-2 hover:bg-red-100 text-red-600 text-sm text-left flex items-center gap-2" 
                    onClick={handleDeleteAccount}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-end">
              {/* Connection Status and Actions */}
              {connectionStatus === 'pending' && connectionData?.requester._id !== loggedInUserId && (
                <div className="flex gap-2">
                  <button
                    onClick={handleAcceptConnection}
                    disabled={connectionLoading}
                    className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {connectionLoading ? 'Loading...' : 'Accept'}
                  </button>
                  <button
                    onClick={handleIgnoreConnection}
                    disabled={connectionLoading}
                    className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    {connectionLoading ? 'Loading...' : 'Ignore'}
                  </button>
                </div>
              )}
              
              {/* Main Connect Button */}
              <button
                onClick={(connectionStatus === 'none' || connectionStatus === null) ? handleSendConnectionRequest : undefined}
                disabled={connectionLoading || connectionStatus === 'pending' || connectionStatus === 'accepted' || connectionStatus === 'ignored'}
                className={`font-bold px-6 py-2 rounded-lg shadow transition flex items-center gap-2 ${
                  connectionStatus === 'accepted'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : connectionStatus === 'pending' && connectionData?.requester._id === loggedInUserId
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : connectionStatus === 'ignored'
                    ? 'bg-gray-100 text-gray-600 border border-gray-300'
                    : 'bg-[var(--color-accent)] text-[var(--color-surface)] hover:opacity-90'
                } ${connectionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* Connection Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getConnectionButtonText()}
              </button>
              
              {/* Message button for admin profile */}
              {user?.role === 'admin' && !isOwner && (
                <button
                  onClick={handleMessageAdmin}
                  className="bg-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                  Message Admin
                </button>
              )}

              {/* Connection pending message for requesters */}
              {connectionStatus === 'pending' && connectionData?.requester._id === loggedInUserId && (
                <p className="text-sm text-gray-500 text-center">
                  Request sent • Waiting for response
                </p>
              )}
              
              {/* Connected message */}
              {connectionStatus === 'accepted' && (
                <p className="text-sm text-green-600 text-center font-medium">
                  ✓ You're connected
                </p>
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
          <span className="text-blue-500 text-2xl">🤝</span>
          <span className="font-bold text-lg">{connectionsCount}</span>
          <span className="text-xs text-gray-500">Connections</span>
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
            {/* Dynamic completed activities from offers and requests */}
            {[
              ...offers.filter(offer => offer.status === 'completed').map(offer => ({
                ...offer,
                id: offer._id || offer.id,
                type: 'offered',
                sortDate: new Date(offer.updatedAt || offer.createdAt)
              })),
              ...requests.filter(request => request.status === 'completed').map(request => ({
                ...request,
                id: request._id || request.id,
                type: 'requested',
                sortDate: new Date(request.updatedAt || request.createdAt)
              }))
            ].sort((a, b) => b.sortDate - a.sortDate).slice(0, 3).map(activity => (
              <div key={activity.id} className="bg-white rounded-lg px-6 py-4 shadow border-l-4 border-green-400 hover:shadow-md transition-shadow">
                {/* Header with title and status */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-[var(--color-primary)] mb-1">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{activity.description}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    ✅ Completed
                  </span>
                </div>

                {/* Key details in organized rows */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">Category:</span>
                    <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs">{activity.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">Level:</span>
                    <span className="text-gray-600 text-xs">{activity.skillLevel || 'Intermediate'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">Available:</span>
                    <span className="text-gray-600 text-xs">{activity.availability || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">Price:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      activity.isPaid ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {activity.isPaid ? `$${activity.price || 'N/A'}` : 'Free'}
                    </span>
                  </div>
                </div>

                {/* Footer with stats and date */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {activity.type === 'offered' ? 'Skill offering' : 'Learning request'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.updatedAt || activity.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {/* Show message if no completed activities */}
            {[...offers.filter(offer => offer.status === 'completed'), ...requests.filter(request => request.status === 'completed')].length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No completed activities yet</p>
                <p className="text-gray-400 text-xs">Complete your offers and requests to see them here</p>
              </div>
            )}
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
            {offers
              .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
              .slice(0, 3)
              .map(offer => {
              // Use actual response count from database
              const responses = offer.responseCount || 0;

              return (
                <div key={offer.id} className="bg-white rounded-lg px-6 py-4 shadow border-l-4 border-blue-400 hover:shadow-md transition-shadow">
                  {/* Header with title and status */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-[var(--color-primary)] mb-1">{offer.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{offer.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      offer.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {offer.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                    </span>
                  </div>

                  {/* Key details in organized rows */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">Category:</span>
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">{offer.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">Level:</span>
                      <span className="text-gray-600 text-xs">{offer.skillLevel || 'Intermediate'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">Available:</span>
                      <span className="text-gray-600 text-xs">{offer.availability || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">Price:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        offer.isPaid ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {offer.isPaid ? `$${offer.price || 'N/A'}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Footer with stats and date */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
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
            {requests
              .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
              .slice(0, 3)
              .map(request => {
              // Use actual response count from database
              const offers = request.responseCount || 0;

              return (
                <div key={request.id} className="bg-white rounded-lg px-6 py-4 shadow border-l-4 border-blue-400 hover:shadow-md transition-shadow">
                  {/* Header with title and status */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-[var(--color-primary)] mb-1">{request.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      request.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {request.status === 'completed' ? '✅ Completed' : '🔍 Seeking Help'}
                    </span>
                  </div>

                  {/* Key details in organized rows */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">Category:</span>
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">{request.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">Level:</span>
                      <span className="text-gray-600 text-xs">{request.skillLevel || 'Beginner'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">Available:</span>
                      <span className="text-gray-600 text-xs">{request.availability || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">Price:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.isPaid ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {request.isPaid ? `$${request.price || 'N/A'}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Footer with stats and date */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
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

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[var(--color-primary)]">Edit Profile</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                {/* Collapsible University Selector */}
                <div className="w-full">
                  <div
                    onClick={() => setIsUniversityOpen(!isUniversityOpen)}
                    className="cursor-pointer rounded-xl px-4 py-3 flex justify-between items-center transition-all duration-200 hover:shadow-lg border border-gray-300"
                    style={{
                      background: 'var(--color-surface)',
                      color: 'var(--color-primary)',
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                    }}
                  >
                    <span className="font-medium tracking-wide">
                      {searchUniversity || profileForm.university || 'Select University'}
                    </span>
                    <div className="flex items-center gap-2">
                      {(searchUniversity || profileForm.university) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchUniversity('');
                            setProfileForm(prev => ({ ...prev, university: '' }));
                          }}
                          className="text-xs text-red-400 hover:text-red-600 underline"
                        >
                          ✕
                        </button>
                      )}
                      <span className="text-gray-400 text-xs">
                        {isUniversityOpen ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* University Options (shown when open) */}
                  {isUniversityOpen && (
                    <div className="mt-2 relative">
                      <input
                        type="text"
                        value={searchUniversity}
                        onChange={(e) => {
                          setSearchUniversity(e.target.value);
                          setShowUniversityDropdown(true);
                        }}
                        onFocus={() => setShowUniversityDropdown(true)}
                        placeholder="Search your university"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                      />

                      {/* Dropdown */}
                      {showUniversityDropdown && filteredUniversities.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredUniversities.slice(0, 30).map((uni) => (
                            <div
                              key={uni._id}
                              onClick={() => {
                                selectUniversity(uni);
                                setIsUniversityOpen(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{uni.name}</div>
                              <div className="text-sm text-gray-600">{uni.location}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileFormChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={profileForm.skills.join(', ')}
                  onChange={handleProfileFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="JavaScript, React, Python, etc."
                />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Social Links</h3>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    name="social.linkedin"
                    value={profileForm.social.linkedin}
                    onChange={handleProfileFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">GitHub</label>
                  <input
                    type="url"
                    name="social.github"
                    value={profileForm.social.github}
                    onChange={handleProfileFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="social.email"
                    value={profileForm.social.email}
                    onChange={handleProfileFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--color-accent)] text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50"
          onClick={cancelLogout}
        >
          <div 
            className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md mx-4 border border-white/20"
            style={{
              boxShadow: '0 8px 32px 0 rgba(60,80,120,0.25)',
              backdropFilter: 'blur(16px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                }}
              >
                <svg 
                  className="h-8 w-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
              </div>
              
              {/* Modal Content */}
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to log out of your account? You'll need to sign in again to access your profile and continue skill swapping.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-white/80 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  }}
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {typeof isOwner !== 'undefined' && isOwner && (
        <>
          <PostOfferModal
            open={offerModalOpen}
            onClose={() => {
              setOfferModalOpen(false);
              setEditingOfferId(null);
              // Clear form when closing
              setOfferForm({
                title: "",
                category: "",
                availability: "",
                date: "",
                location: "",
                type: "Free",
                description: "",
              });
            }}
            onSubmit={handleOfferSubmit}
            form={offerForm}
            onChange={handleOfferChange}
            categories={categories}
            availabilities={availabilities}
            isEditing={!!editingOfferId}
          />
          <PostRequestModal
            open={requestModalOpen}
            onClose={() => {
              setRequestModalOpen(false);
              setEditingRequestId(null);
              // Clear form when closing
              setRequestForm({
                title: "",
                description: "",
                category: "",
                skillLevel: "Beginner",
                prerequisites: "",
                whatYouWillLearn: [],
                sessionType: "One-time",
                sessionDuration: "",
                totalDuration: "",
                deliveryMethod: "Both",
                location: "",
                availability: "",
                preferredSchedule: "",
                price: 0,
                isPaid: false,
                tags: []
              });
            }}
            onSubmit={handleRequestSubmit}
            form={requestForm}
            onChange={handleRequestChange}
            categories={categories}
            availabilities={availabilities}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
