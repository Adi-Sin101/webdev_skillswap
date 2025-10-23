import React from "react";
import ListingCard from "./ListingCard";

const ListingsFeed = ({ posts }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-1">
      {posts.length > 0 ? (
        posts.map((post) => <ListingCard key={post.id} post={post} />)
      ) : (
        <p className="text-gray-500 text-center">No skills found</p>
      )}
    </div>
  );
};

export default ListingsFeed;
