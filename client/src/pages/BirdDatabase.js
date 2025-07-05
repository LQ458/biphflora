import React, { useState, useEffect } from "react";
import InfoDatabase from "../components/InfoDatabase.js";
import HomeDatabase from "../components/HomeDatabase.js";
import GalleryDatabase from "../components/GalleryDatabase.js";
import BirdInfoDatabase from "../components/BirdInfoDatabase.js";
import BirdHomeDatabase from "../components/BirdHomeDatabase.js";
import BirdGalleryDatabase from "../components/BirdGalleryDatabase.js";
import "../styles/database.css";
import Navbar from "../components/Navbar.js";

const BirdDatabase = (prop) => {
  const [DbType, setDbType] = useState(prop.DbType);
  const [search, setSearch] = useState([]);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(true);

  const handleEditPage = prop.handleEditPage;

  useEffect(() => {
    document.title = "Database 鸟类数据库";
  }, []);

  const handleGet = (input) => {
    setSearch(input);
  };

  const gallerySearch = (input) => {
    setKey(null);
    setSearch(input);
  };

  const handleGallery = (input) => {
    setKey(input);
  };

  const handleBack = (input) => {
    setKey(null);
    setSearch(input);
  };

  const handleDbTypeChange = (input) => {
    setDbType(input);
  }
  
    if (key) {
      return (
        <section onLoad={() => setLoading(false)} className="db">
          <Navbar />
          <div className="infoDatabase">
            <BirdGalleryDatabase
              customKey={key}
              handleBack={handleBack}
              gallerySearch={gallerySearch}
            />
          </div>
        </section>
      );
    } else if (prop.search) {
      return (
        <section className="db">
          <Navbar />
          <div className="infoDatabase">
            <BirdInfoDatabase
              search={prop.search}
              handleGallery={handleGallery}
              handleEditPage={handleEditPage}
            />
          </div>
        </section>
      );
    } else if (search.length > 0) {
      return (
        <section className="db">
          <Navbar />
          <div className="infoDatabase">
            <BirdInfoDatabase
              handleGallery={handleGallery}
              search={search}
              handleEditPage={handleEditPage}
            />
          </div>
        </section>
      );
    } else 
    {
      return (
        <section className="db dbAdd db2spec">
          <Navbar />
          {loading && (
            <section className="loadingCreation">
              <div className="dots-container">
                <div className="dots"></div>
                <div className="dots"></div>
                <div className="dots"></div>
                <div className="dots"></div>
                <div className="dots"></div>
              </div>
            </section>
          )}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <div className="birdHomeDatabase">
              <BirdHomeDatabase handleGet={handleGet} setLoading={setLoading} />
            </div>
            <div className="bottomWhite"
                style={{
                  height: "0.3rem",
                  width: "100%",
                  backgroundColor: "#ffffff",
                  position: "relative",
                  bottom: 0,
                }}
              >
                
            </div>
            <div className="bottomGreen"
              style={{
                height: "2.9rem",
                width: "100%",
                backgroundColor: "#516d4e",
                position: "relative",
                bottom: 0,
              }}
            >
              <div className="dmsg">
                 湘ICP备2023027594号
              </div>
              
            </div>
          </div>
        </section>
      );
    }
  
};

export default BirdDatabase;
