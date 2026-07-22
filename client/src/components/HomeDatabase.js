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
          urls.getDb2Pic,
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
        const catalogNames = await getCatalogNames("plant");
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
          {/* <div className="dbBlock" /> */}
          <div className="dbheader">
            <h1 className="db2ttl">
              Database of Plant Species in School 校内植物检索数据库
            </h1>
            <Link to="/databaseBird" className="changeDbLink">
              Switch to Bird Database 切换至鸟类检索数据库
            </Link>

          </div>
          
          <SearchBar
            handleGet={handleGet}
            searchResults={searchResults}
            query={query}
            handleSearch={handleSearch}
            barWidth="65%"
            placeHolder={"Enter the name of the plant 输入植物名..."}
          />
        </div>

        <div className="numOfPlantsBox">
          <div className="numOfPlantsBoxInner">
            <div className="plantMsg">
              # of Plant Species Recorded in Database 
              <br/>
              目前可检索种数
            </div>
            <div className="ppnumber">
              <p className="pnumber">{numOfPlants}</p>
            </div>
          </div>
          <Link to="/glossary" className="plink">
            Show Full Species List<br></br>展示完整物种名单
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
