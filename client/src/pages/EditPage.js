import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import EditPageTextForm from "../components/EditPageTextForm.js";
import "../styles/editPage.css";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import Navbar from "../components/Navbar.js";

const EditPage = (props) => {
  const [latinName, setLatinName] = useState("");
  const [commonName, setCommonName] = useState("");
  const [chineseName, setChineseName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [links, setLinks] = useState();
  const [chineseLinks, setChineseLinks] = useState();
  const [editor, setEditor] = useState();
  const [artist, setArtist] = useState();
  const [auth, setAuth] = useState(false);

  const [subpage, setSubpage] = useState(false);
  const { user } = useContext(UserContext);
  const status = user.get("status");

  const navigate = useNavigate();
  const [pics, setPics] = useState([]);

  useEffect(() => {
    if (props?.editKey?.[1]) {
      setPics(props.editKey[1]);
    }
  }, [props]);

  const deletePic = async (id) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/editPageDelete`,
        { id },
      );
      console.log(response.data);
      setPics((prevPosts) => prevPosts.filter((post) => post._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const authUser = () => {
      if (status === "authenticated") {
        if (
          !props?.editKey ||
          !props.editKey[0] ||
          !props.editKey[1] ||
          !props.editKey[2] ||
          !props.editKey[3]
        ) {
          alert("Invalid access. Redirecting to home page.");
          navigate("/");
          return;
        }
        setAuth(true);
      } else if (status === "unauthenticated") {
        navigate("/");
      }
    };
    authUser();
  }, [navigate, status, props]);

  const clearSubpage = () => {
    setSubpage(null);
  };

  const handleEdit = (type) => {
    if (type === "text") {
      setSubpage(true);
    }
  };

  const handleAdminAuth = () => {
    navigate("/upload?section=auth");
  };

  const deletePlant = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_Source_URL}/editPageDeletePlant`,
        {
          data: {
            id: props.editKey[0]._id,
          },
        },
      );
      console.log(response.data);
      alert("Plant deleted");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return auth ? (
    <section className="editPage">
      <Navbar />
      {props.editKey[3].admin && (
        <button
          onClick={() => {
            handleAdminAuth();
          }}
          className="toAdminAuth"
        >
          View Updates
        </button>
      )}
      <br />
      <br />
      <div className="previewEdit">
        <div className="textInfoEditBox">
          <div className="textTop">
            <h1>Text Edit</h1>

            <h1>
              Name: {props.editKey[0].latinName} {props.editKey[0].commonName}{" "}
              {props.editKey[0].chineseName}
            </h1>
          </div>
          <div className={`${subpage && "textBtm"}`}>
            <div className="topBtm">
              <h3>Common Names: {props.editKey[0].otherNames}</h3>
              <h3>Location: {props.editKey[0].location}</h3>
              <h2>Encyclopedia 百科介绍</h2>
              <h2>(English)</h2>
              {Array.isArray(props.editKey[0].link) &&
                props.editKey[0].link.map((item, index) => (
                  <div key={index}>
                    <li className="Eng">
                      {" "}
                      {item.linkTitle}: {item.link}
                    </li>
                  </div>
                ))}
              <h2>(中文)</h2>
              {Array.isArray(props.editKey[0].chineseLink) &&
                props.editKey[0].chineseLink.map((item, index) => (
                  <div key={index}>
                    <li className="Eng">
                      {" "}
                      {item.linkTitle}: {item.link}
                    </li>
                  </div>
                ))}
              <h5>Editor: {props.editKey[0].editor} </h5>
              <button
                onClick={() => {
                  handleEdit("text");
                }}
                className="editTextBtn"
              >
                Edit
              </button>
              <button
                onClick={() => deletePlant(props.editKey[0]._id)}
                className="editTextBtn"
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </div>
            <div className="editSubpage">
              {subpage && (
                <EditPageTextForm
                  clearSubpage={clearSubpage}
                  post={props.editKey[0]}
                />
              )}
            </div>
          </div>
        </div>
        <br />
        <br />
        {pics?.length !== 0 && (
          <div className="picEditBox">
            <h1 className="photoTitle">Photography Edit</h1>
            <h2>
              {"Season: " + props?.editKey[1][0]?.season + " "}
              {"Time: " + props?.editKey[1][0]?.time}
            </h2>
            {pics &&
              pics.map((item, index) => (
                <>
                  <img
                    src={`${process.env.REACT_APP_Source_URL}/public${item.path}`}
                    key={index}
                    alt="pic"
                    style={{ maxWidth: "25%" }}
                  />
                  <button onClick={() => deletePic(item._id)}>x</button>
                </>
              ))}
            <br />
            <button
              onClick={() => {
                handleEdit("pic");
              }}
              className="editTextBtn"
            >
              Edit
            </button>
          </div>
        )}
        <br />
        <br />
        {props?.editKey[2]?.length !== 0 && (
          <div className="artEditBox">
            <h1 className="artEditTitle">Artwork Edit</h1>
            <h2>
              By {props.editKey[2].artist} Location: {props.editKey[2].location}
            </h2>
            {props.editKey[2] &&
              props.editKey[2].map((item, index) => (
                <>
                  <img
                    src={`${process.env.REACT_APP_Source_URL}/public${item.path}`}
                    key={index}
                    alt="pic"
                    style={{ maxWidth: "25%" }}
                  />
                </>
              ))}
            <br />
            <button
              onClick={() => {
                handleEdit("art");
              }}
              className="editTextBtn"
            >
              Edit
            </button>
          </div>
        )}
      </div>
      <br />
    </section>
  ) : (
    <section className="loadingBG">
      <div className="dots-container">
        <div className="dots"></div>
        <div className="dots"></div>
        <div className="dots"></div>
        <div className="dots"></div>
        <div className="dots"></div>
      </div>
    </section>
  );
};

export default EditPage;
