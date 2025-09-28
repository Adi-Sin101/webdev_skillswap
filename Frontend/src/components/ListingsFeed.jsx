import React from "react";
import ListingCard from "./ListingCard";

const ListingsFeed = ({ posts }) => {
  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post) => <ListingCard key={post.id} post={post} />)
      ) : (
        <p className="text-gray-500 text-center">No skills found</p>
      )}
    </div>
  );
};

export default ListingsFeed;
