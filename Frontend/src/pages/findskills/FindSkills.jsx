import React, { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import FiltersPanel from "../../components/FiltersPanel";
import ListingsFeed from "../../components/ListingsFeed";


// Dummy posts (fallback data)
const skillsData = [
  {
    id: 1,
    type: "Request",
    title: "Need help with Data Structures",
    poster: "Alice",
    posterId: "dummy-user-1", // Dummy ID
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
    posterId: "dummy-user-2", // Dummy ID
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
    posterId: "dummy-user-3", // Dummy ID
    university: "KUET",
    deadline: "This Week",
    category: "Design",
    free: true,
  },
];

const FindSkills = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSkill, setSearchSkill] = useState("");
  const [searchUniversity, setSearchUniversity] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    university: "",
    availability: "",
    free: "",
  });

  // Fetch offers and requests from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log("Fetching posts from API...");
        
        const [offersRes, requestsRes] = await Promise.all([
          fetch("http://localhost:5000/api/offers"),
          fetch("http://localhost:5000/api/requests")
        ]);
        
        const offersData = await offersRes.json();
        const requestsData = await requestsRes.json();
        
        console.log("Offers data:", offersData);
        console.log("Requests data:", requestsData);
        
        // Transform API data to match expected format
        const transformedOffers = (offersData.offers || []).map(offer => ({
          id: offer._id,
          type: "Offer",
          title: offer.title,
          poster: offer.user?.name || "Anonymous",
          posterId: offer.user?._id, // Add user ID for profile navigation
          posterImage: offer.user?.profilePicture || offer.user?.avatar || null, // Include profile image
          university: offer.user?.university || offer.location,
          availability: offer.availability,
          category: offer.category,
          free: offer.isPaid !== undefined ? !offer.isPaid : offer.type === "Free", // Handle both old and new schema
          details: offer.description,
        }));

        const transformedRequests = (requestsData.requests || []).map(request => ({
          id: request._id,
          type: "Request", 
          title: request.title,
          poster: request.user?.name || "Anonymous",
          posterId: request.user?._id, // Add user ID for profile navigation
          posterImage: request.user?.profilePicture || request.user?.avatar || null, // Include profile image
          university: request.user?.university || request.location,
          availability: request.availability, // Use availability instead of deadline
          category: request.category,
          free: request.isPaid !== undefined ? !request.isPaid : request.type === "Free", // Handle both old and new schema
          details: request.description,
        }));

        console.log("Transformed offers:", transformedOffers);
        console.log("Transformed requests:", transformedRequests);

        const allPosts = [...transformedOffers, ...transformedRequests];
        console.log("All posts combined:", allPosts);
        
        setPosts(allPosts);
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
    // Search filter
    const matchesSkillSearch = !searchSkill || 
      post.title.toLowerCase().includes(searchSkill.toLowerCase()) ||
      post.details?.toLowerCase().includes(searchSkill.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchSkill.toLowerCase());

    const matchesUniversitySearch = !searchUniversity ||
      post.university?.toLowerCase().includes(searchUniversity.toLowerCase());

    // Filters
    const matchesFilters = (
      (!filters.type || post.type === filters.type) &&
      (!filters.category || post.category === filters.category) &&
      (!filters.university || post.university === filters.university) &&
      (!filters.availability || post.availability === filters.availability) &&
      (!filters.free || (filters.free === "Free" ? post.free : !post.free))
    );

    return matchesSkillSearch && matchesUniversitySearch && matchesFilters;
  });

  if (loading) {
    return (
      <div className="p-6 pl-4 flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold text-[var(--color-primary)]">Loading posts...</div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-[var(--color-background)] to-[var(--color-accent)]/10 p-6 pl-4 md:p-8 md:pl-6">
      {/* Top Search Bar with extra margin for separation from navbar */}
      <div className="mt-8">
        <SearchBar 
          searchSkill={searchSkill}
          setSearchSkill={setSearchSkill}
          searchUniversity={searchUniversity}
          setSearchUniversity={setSearchUniversity}
        />
      </div>

      {/* Filters horizontally */}
      <div className="mt-6">
        <FiltersPanel setFilters={setFilters} />
      </div>

      {/* Listings below */}
      <div className="mt-6">
        <ListingsFeed posts={filteredPosts} />
      </div>
    </div>
  );
};

export default FindSkills;
