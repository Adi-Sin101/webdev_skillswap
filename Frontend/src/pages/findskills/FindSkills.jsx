import React, { useState } from "react";
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
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    location: "",
    urgency: "",
    free: "",
  });

  const filteredPosts = skillsData.filter((post) => {
    return (
      (!filters.type || post.type === filters.type) &&
      (!filters.category || post.category === filters.category) &&
      (!filters.location || post.university === filters.location) &&
      (!filters.urgency || post.deadline === filters.urgency) &&
      (!filters.free || (filters.free === "Free" ? post.free : !post.free))
    );
  });

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
