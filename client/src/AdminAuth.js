import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ReactComponent as PreviousIcon } from "./buttons/caret-back-outline.svg";
import { ReactComponent as NextIcon } from "./buttons/caret-forward-outline.svg";
import "./AdminAuth.css";

const AdminAuth = ({ admin }) => {
  const navigate = useNavigate();
  const [unAuthPosts, setUnAuthPosts] = useState([]);
  const [unAuthNewPosts, setUnAuthNewPosts] = useState([]);
  const [unAuthCreationEntry, setUnAuthCreationEntry] = useState([]);
  const [currentChange, setCurrentChange] = useState(0);
  const [newCurrentChange, setNewCurrentChange] = useState(0);
  const [artCurrentChange, setArtCurrentChange] = useState(0);

  const handleEditDecision = async (id, decision) => {
    try {
      const response = axios.put(
        `${process.env.REACT_APP_Source_URL}/handleEditDecision`,
        { id: id, decision: decision },
      );
      setUnAuthPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== id),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/adminAuth`,
        );
        if (!admin) {
          alert("You are not an admin, redirecting to home page...");
          navigate("/");
        }
        setUnAuthPosts(response.data.authPosts);
        setUnAuthNewPosts(response.data.newAuthPosts);
        setUnAuthCreationEntry(response.data.newCreationEntries);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleNewCreationDecision = async (decision, id) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/newCreationAuth`,
        {
          id: id,
          decision: decision,
        },
      );
    } catch (error) {
      console.log(error);
    }

    setUnAuthCreationEntry((prevPosts) =>
      prevPosts.filter((post) => post._id !== id),
    );
  };

  const handleNewPostDecision = async (decision, id) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/newPostAuth`,
        {
          id: id,
          decision: decision,
        },
      );
    } catch (error) {
      console.log(error);
    }

    setUnAuthNewPosts((prevPosts) =>
      prevPosts.filter((post) => post._id !== id),
    );
  };

  const handleLeft = (change, setChange) => {
    if (change > 0) {
      setChange(change - 1);
    }
  };

  const handleRight = (change, setChange, posts) => {
    if (change < posts.length - 1) {
      setChange(change + 1);
    }
  };

  return (
    <div className="authBody">
      <h1 className="titleAdmin">Admin Authentication</h1>
      <div className="unAuthChanges">
        <h1 className="titleSections">Unauthorized Changes</h1>
        {unAuthPosts[currentChange] &&
          (() => {
            let item = unAuthPosts[currentChange];
            return (
              <div className="authBox">
                <h1 className="plantNameTitle">
                  Name: <em>{item.latinName}</em> {item.commonName}{" "}
                  {item.chineseName} (Edit Request)
                </h1>
                <div className="authBtm">
                  <h3>Common Names: {item.commonName}</h3>
                  <h3>Location 位置: {item.location}</h3>
                  <h3>Additional Info: {item.additionalInfo}</h3>
                  <h2>Encyclopedia 百科介绍</h2>
                  <h2>(English)</h2>
                  {item.link.length === 0 && (
                    <h2>There's Nothing here, NOTHING</h2>
                  )}
                  {Array.isArray(item.link) &&
                    item.link.map((item, index) => (
                      <div key={index}>
                        <li className="Eng">
                          {" "}
                          {item.linkTitle}: {item.link}
                        </li>
                      </div>
                    ))}

                  <h2>(Chinese)</h2>
                  {item.chineseLink.length === 0 && <h3>No INPUT</h3>}
                  {Array.isArray(item.chineseLink) &&
                    item.chineseLink.map((item, index) => (
                      <div key={index}>
                        <li className="Chi">
                          {" "}
                          {item.linkTitle}: {item.link}
                        </li>
                      </div>
                    ))}
                </div>
                <br />
                <div className="buttons">
                  <button
                    onClick={() => {
                      console.log(handleEditDecision(item._id, false));
                    }}
                    id="button1"
                    className="decisionBtn"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      console.log(handleEditDecision(item._id, true));
                    }}
                    id="button2"
                    className="decisionBtn"
                  >
                    Approve
                  </button>
                </div>
                <div className="shiftIcons">
                  <button
                    onClick={() => handleLeft(currentChange, setCurrentChange)}
                  >
                    <PreviousIcon width={60} height={60} />
                  </button>
                  <button
                    onClick={() =>
                      handleRight(currentChange, setCurrentChange, unAuthPosts)
                    }
                  >
                    <NextIcon width={60} height={60} />
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
      <div className="unAuthPosts">
        <h1 className="titleSections">Unauthorized New Posts</h1>
        {unAuthNewPosts[newCurrentChange] &&
          (() => {
            let item = unAuthNewPosts[newCurrentChange];
            return (
              <div className="authBox">
                <h1 className="plantNameTitle">
                  Name: <em>{item.latinName}</em> {item.commonName}{" "}
                  {item.chineseName} (Edit Request)
                </h1>
                <div className="authBtm">
                  <h3>Common Names: {item.commonName}</h3>
                  <h3>Location 位置: {item.location}</h3>
                  <h3>Additional Info: {item.additionalInfo}</h3>
                  <h3>Encyclopedia 百科介绍</h3>
                  <h3>(English)</h3>
                  {item.link.length === 0 && <h3>There's Nothing here.</h3>}
                  {Array.isArray(item.link) &&
                    item.link.map((item, index) => (
                      <div key={index}>
                        <li className="Eng">
                          {" "}
                          {item.linkTitle}: {item.link}
                        </li>
                      </div>
                    ))}
                  <h3>(Chinese)</h3>
                  {item.chineseLink.length === 0 && (
                    <h3>There's Nothing here.</h3>
                  )}
                  {Array.isArray(item.chineseLink) &&
                    item.chineseLink.map((item, index) => (
                      <div key={index}>
                        <li className="Chi">
                          {" "}
                          {item.linkTitle}: {item.link}
                        </li>
                      </div>
                    ))}
                  <br />
                  <h3 style={{ fontWeight: 400, fontSize: "1.1rem" }}>
                    Editor: {item.editor} Date: {item.postingtime}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    handleNewPostDecision(false, item._id);
                  }}
                  className="decisionBtn"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    handleNewPostDecision(true, item._id);
                  }}
                  className="decisionBtn"
                >
                  Submit
                </button>
                <div className="shiftIcons">
                  <button
                    onClick={() =>
                      handleLeft(newCurrentChange, setNewCurrentChange)
                    }
                  >
                    <PreviousIcon width={60} height={60} />
                  </button>
                  <button
                    onClick={() =>
                      handleRight(
                        newCurrentChange,
                        setNewCurrentChange,
                        unAuthNewPosts,
                      )
                    }
                  >
                    <NextIcon width={60} height={60} />
                  </button>
                </div>
              </div>
            );
          })()}
      </div>
      <div className="unAuthCreation">
        <h1 className="titleSections">Unauthorized new creation Entry</h1>
        {unAuthCreationEntry[artCurrentChange] &&
          (() => {
            let item = unAuthCreationEntry[artCurrentChange];
            return (
              <div className="authBox creationAuth">
                <h1 className="plantNameTitle">Name: {item.name}</h1>
                <div className="creationAuthBox">
                  <div className="picBox">
                    <img src={item.pic} alt={item.pic} className="authPic" />
                    <h1 className="authCreationTtl">Pic</h1>
                  </div>
                  <div className="picBox">
                    <img src={item.art} alt={item.art} className="authArt" />
                    <h1 className="authCreationTtl">Art</h1>
                  </div>
                </div>
                <div className="decisionBtns">
                  <button
                    onClick={() => {
                      handleNewCreationDecision(false, item._id);
                    }}
                    className="decisionBtn"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => {
                      handleNewCreationDecision(true, item._id);
                    }}
                    className="decisionBtn"
                  >
                    Approve
                  </button>
                </div>
                <div className="shiftIcons">
                  <button
                    onClick={() =>
                      handleLeft(artCurrentChange, setArtCurrentChange)
                    }
                  >
                    <PreviousIcon width={60} height={60} />
                  </button>
                  <button
                    onClick={() =>
                      handleRight(
                        artCurrentChange,
                        setArtCurrentChange,
                        unAuthCreationEntry,
                      )
                    }
                  >
                    <NextIcon width={60} height={60} />
                  </button>
                </div>
                <br />
              </div>
            );
          })()}
      </div>
    </div>
  );
};

export default AdminAuth;
