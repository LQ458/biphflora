import React from "react";

const CreationView = (prop) => {
  const post = prop.vKey;
  const handleView = prop.handleView;

  return (
    <>
      <h1>{post.plant}</h1>
      <img src={post.pic} alt={`${post.plant} photograph`} />
      <img src={post.art} alt={`${post.plant} artwork`} />
      <p className="infoBoxForCreationView">{post.bottomInfo}</p>
      <button
        style={{ textDecoration: "underline" }}
        onClick={() => {
          handleView("");
        }}
      >
        back
      </button>
    </>
  );
};

export default CreationView;
