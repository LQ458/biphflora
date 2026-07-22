import axios from "../api/http";
import urls, { mediaUrl } from "../tools/url";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/homeDatabase.css";
import SearchBar from "./SearchBar.js";
import SearchPlant from "./SearchPlant.js";
import MediaImage from "./MediaImage.js";
import { getCatalogNames } from "../api/catalog";
const DatabaseTwo = ({ handleGet, setLoading }) => {
  const [query, setQuery] = useState("");
  const [namesArray, setNamesArray] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [numOfPlants, setNumOfPlants] = useState("");
  const [pics, setPics] = useState([]);
  const navigate = useNavigate();
  const redirect = (plant) => {
    //plant的类型是string
    // handleGet(plant);
    navigate(`/search/${plant.replace(" ", "_")}`);
  };
  useEffect(() => {
    const getDb2Pic = async () => {
      try {
        const response = await axios.get(
          urls.getDb2PicBird,
        );
        setPics(response.data.pics);
      } catch (error) {
        console.log(error);
      }
    };

    getDb2Pic();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catalogNames = await getCatalogNames("bird");
        setNamesArray(catalogNames);
        setNumOfPlants(catalogNames.length);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    const results = SearchPlant(namesArray, inputValue);
    const finalResults = results.slice(0, 3).map((result) => {
      return [
        result.item.latinName,
        result.item.commonName,
        result.item.chineseName,
      ];
    });
    setSearchResults(finalResults);
  };

  useEffect(() => {
    setLoading(false);
  }, [pics, setLoading]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "2rem",
      }}
      onLoad={() => setLoading(false)}
    >
      <div className="db2Container">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="dbheader">
            <h1 className="db2ttl">
              Database of Bird Species in School 校内鸟类检索数据库
            </h1>
            <Link to="/databasePlant" className="changeDbLink">
              Switch to Plant Database 切换至植物检索数据库
            </Link>
          
          </div>
          <SearchBar
            handleGet={handleGet}
            searchResults={searchResults}
            query={query}
            handleSearch={handleSearch}
            type="bird"
            barWidth="65%"
            placeHolder="Enter the name of the bird 输入鸟类名字..."
          />
        </div>

        <div className="numOfPlantsBox">
          <div className="numOfPlantsBoxInner">
            <div className="msg"># of Bird Species recorded in Database</div>
            <div className="number">
              <p className="numberP">{numOfPlants}</p>
            </div>
          </div>
          <Link to="/glossaryBird" className="link">
            Show the Full Species List
          </Link>
        </div>
        <p
          style={{
            fontSize: "1rem",
            textDecoration: "underline",
            marginLeft: "6rem",
            fontWeight: "bold",
            position: "relative",
          }}
        >
          Looking for What's New (click photos to see more)......
        </p>
      </div>
      <div className="db2pics">
        {pics.length === 3
          ? pics.map((pic, index) => {
              return (
                <div key={index} className="pic">
                  <MediaImage
                    style={{ cursor: "pointer" }}
                    src={mediaUrl(pic.path, { compressed: true })}
                    fallbackSrc={mediaUrl(pic.path)}
                    failedContent={<div className="db2picAlt" />}
                    loading="eager"
                    alt="plant"
                    className="picImg"
                    onClick={() =>
                      redirect(pic.path.split("/").pop().split("-")[0])
                    }
                    // 从url中分离plant name
                  />
                </div>
              );
            })
          : Array.from({ length: 3 }, (_, index) => index).map((index) => {
              return (
                <div key={index} className="pic">
                  <div className="db2picAlt" />
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default DatabaseTwo;
