import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import EditPageTextForm from "../components/EditPageTextForm.js";
import "../styles/editPage.css";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import Navbar from "../components/Navbar.js";
import styles from "../styles/galleryDatabase.module.css";

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
  const [selectedPics, setSelectedPics] = useState(new Set());

  // Which month (e.g. "Mar 2025") is currently selected for filtering:
  const [selectedMonth, setSelectedMonth] = useState("");
  // Page index for the filtered images:
  const [pageIndex, setPageIndex] = useState(0);
  const [picsByMonth, setPicsByMonth] = useState({});
  useEffect(() => {
    if (!pics) return;
  
    const map = {};
    pics.forEach(pic => {
      // Assuming pic.time is e.g. "Tue Mar 10 2025 14:30:00 GMT…"
      const parts = pic.time.split(" ");
      const mon = parts[1], year = parts[3];
      const key = `${mon} ${year}`;
  
      if (!map[key]) map[key] = [];
      map[key].push(pic);
    });
  
    // Sort each month’s array however you like, e.g. by full date:
    Object.values(map).forEach(arr =>
      arr.sort((a, b) => new Date(a.time) - new Date(b.time))
    );
  
    setPicsByMonth(map);
    // Reset filters whenever pics change:
    setSelectedMonth(Object.keys(map)[0]);
    setPageIndex(0);
  }, [pics]);

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
          !props.editKey[3].admin
        ) {
          alert("Invalid access. Redirecting to home page.");
          navigate("/");
          return;
        }
        setAuth(true);
        console.log(props.editKey[0]);
      } else if (status === "unauthenticated") {
        navigate("/");
      }
    };
    authUser();
  }, [navigate, status, props]);

  const clearSubpage = () => {
    setSubpage(false);
  };

  const handleEdit = (type) => {
    if (type === "text") {
      setSubpage(true);
    }
    // setSubpage(true);
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
          <div className={`${"textBtm"}`}>
            <div className="topBtm">
              <h3>Other Common Names: {props.editKey[0].otherNames}</h3>
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
                    <li className="Chn">
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
                <EditPageTextForm
                  isVisible={subpage}
                  clearSubpage={clearSubpage}
                  post={props.editKey[0]}
                />
            </div>
          </div>
        </div>
        <br />
        <br />
        <div className="monthFilter">
          <h1 className="photoTitle">Gallery Edit</h1>
          {Object.keys(picsByMonth)
            .sort((a, b) => new Date(a) - new Date(b))
            .map(mon => (
              <button
                key={mon}
                className={`${styles.seasonBtn} ${mon === selectedMonth ? styles.focussed : ""}`}
                onClick={() => {
                  setSelectedMonth(mon);
                  setPageIndex(0);
                }}
              >
                {mon}
              </button>
          ))}
        </div>
        {selectedMonth ? (() => {
          const all = picsByMonth[selectedMonth] || [];
          const pageSize = 12;
          const start = pageIndex * pageSize;
          const paged = all

          return (
            <>
              <div className="picGrid">
                {paged.map(item => (
                  <div key={item._id} className="pic-item">
                    <img
                      src={`${process.env.REACT_APP_Source_URL}/public${item.path}`}
                      alt="plant pic"
                    />
                    <div className="select-overlay">
                      <input
                        type="checkbox"
                        checked={selectedPics.has(item._id)}
                        onChange={() => {
                          const next = new Set(selectedPics);
                          if (next.has(item._id)) next.delete(item._id);
                          else next.add(item._id);
                          setSelectedPics(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <br/>
              <button
                className="bulk-delete-btn"
                disabled={selectedPics.size === 0}
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${selectedPics.size} image(s)?`
                    )
                  ) {
                    selectedPics.forEach(id => deletePic(id));
                    setSelectedPics(new Set()); 
                  }
                }}
              >
                Delete Selected ({selectedPics.size})
              </button>
            </>
          );
        })() : (
          <p>Please select a month to see images.</p>
        )}
        {/* {pics?.length !== 0 && (
          <div className="picEditBox">
            <h1 className="photoTitle">Gallery Edit</h1>
            <h2>
              {"Season: " + props?.editKey[1][0]?.season + " "}
              {"Time: " + props?.editKey[1][0]?.time}
            </h2>
            {pics &&
              pics.map((item, index) => (
                <div className="pic-item" key={item._id}>
                  <img
                    src={`${process.env.REACT_APP_Source_URL}/public${item.path}`}
                    key={index}
                    alt="pic"
                  />
                  <div className="select-overlay">
                    <input
                      type="checkbox"
                      checked={selectedPics.has(item._id)}
                      onChange={() => {
                        const next = new Set(selectedPics);
                        if (next.has(item._id)) next.delete(item._id);
                        else next.add(item._id);
                        setSelectedPics(next);
                      }}
                    />
                  </div>
                </div>
              ))}
            <br />
            <button
              className="bulk-delete-btn"
              disabled={selectedPics.size === 0}
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${selectedPics.size} image(s)?`
                  )
                ) {
                  selectedPics.forEach(id => deletePic(id));
                  setSelectedPics(new Set()); 
                }
              }}
            >
              Delete Selected ({selectedPics.size})
            </button>
          </div>
        )} */}
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
