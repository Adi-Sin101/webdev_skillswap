import React, { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import FiltersPanel from "../../components/FiltersPanel";
import ListingsFeed from "../../components/ListingsFeed";


// Dummy posts
const skillsData = [
  {
    id: 1,
    type: "Request",
    title: "Need help with Data Structures",
    poster: "Alice",
    university: "MIT",
    deadline: "25 Sep 2025",
    category: "Coding",
    free: true,
  },
  {
    id: 2,
    type: "Offer",
    title: "Offering Photoshop tutoring",
    poster: "John",
    university: "Stanford",
    availability: "Weekends",
    category: "Design",
    free: false,
  },
  {
    id: 3,
    type: "Request",
    title: "Need help with PPT Design",
    poster: "Rahim",
    university: "KUET",
    deadline: "This Week",
    category: "Design",
    free: true,
  },
];

const FindSkills = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    location: "",
    urgency: "",
    free: "",
  });

  // Fetch offers and requests from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const [offersRes, requestsRes] = await Promise.all([
          fetch("http://localhost:5000/api/offers"),
          fetch("http://localhost:5000/api/requests")
        ]);
        
        const offersData = await offersRes.json();
        const requestsData = await requestsRes.json();
        
        // Transform API data to match expected format
        const transformedOffers = (offersData.offers || []).map(offer => ({
          id: offer._id,
          type: "Offer",
          title: offer.title,
          poster: offer.user?.name || "Anonymous",
          university: offer.user?.university || offer.location,
          availability: offer.availability,
          category: offer.category,
          free: offer.type === "Free",
          details: offer.description,
        }));

        const transformedRequests = (requestsData.requests || []).map(request => ({
          id: request._id,
          type: "Request", 
          title: request.title,
          poster: request.user?.name || "Anonymous",
          university: request.user?.university || request.location,
          deadline: request.deadline,
          category: request.category,
          free: request.type === "Free",
          details: request.description,
        }));

        setPosts([...transformedOffers, ...transformedRequests]);
      } catch (error) {
        console.error("Error fetching posts:", error);
        // Fallback to dummy data
        setPosts(skillsData);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    return (
      (!filters.type || post.type === filters.type) &&
      (!filters.category || post.category === filters.category) &&
      (!filters.location || post.university === filters.location) &&
      (!filters.urgency || post.deadline === filters.urgency) &&
      (!filters.free || (filters.free === "Free" ? post.free : !post.free))
    );
  });

  if (loading) {
    return (
      <div className="p-6 pl-4 flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold text-[var(--color-primary)]">Loading posts...</div>
      </div>
    );
  }

  return (
  <div className="p-6 pl-4">
      {/* Top Search Bar with extra margin for separation from navbar */}
      <div className="mt-8">
        <SearchBar />
      </div>

      {/* 2-column grid layout without sidebar */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Filters */}
        <div className="md:col-span-1">
          <FiltersPanel setFilters={setFilters} />
        </div>

        {/* Center: Listings */}
        <div className="md:col-span-2">
          <ListingsFeed posts={filteredPosts} />
        </div>
      </div>
    </div>
  );
};

export default FindSkills;
