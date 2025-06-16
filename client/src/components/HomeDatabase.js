import axios from "axios";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/homeDatabase.css";
import SearchBar from "./SearchBar.js";
import SearchPlant from "./SearchPlant.js";
const DatabaseTwo = ({ handleGet, setLoading }) => {
  const [query, setQuery] = useState("");
  const [namesArray, setNamesArray] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [numOfPlants, setNumOfPlants] = useState("");
  const [pics, setPics] = useState([]);
  const [load, setLoad] = useState([true, true, true]);
  const [loadedSrc, setLoadedSrc] = useState(["", "", ""]);
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
          `${process.env.REACT_APP_Source_URL}/getDb2Pic`,
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
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/searchNames`,
        );
        const fetchedNamesArray = response.data.returnNames;
        setNamesArray(fetchedNamesArray);
        setNumOfPlants(response.data.numOfPlants);
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
    var newArray = [true, true, true];
    var srcs = [];
    setLoad(newArray);
    pics.forEach((pic, index) => {
      const img = new Image();
      img.src = `${process.env.REACT_APP_Source_URL}/public${pic.path}`;
      img.onload = () => {
        newArray[index] = false;
        srcs[index] = `${process.env.REACT_APP_Source_URL}/public/compressed${pic.path}`;
        setLoadedSrc([...srcs]);
        setLoad([...newArray]);
      };
      img.onerror = async () => {
        try {
          const response = await axios.get("/db2Alt");
          const altImg = new Image();
          altImg.src = `${process.env.REACT_APP_Source_URL}/public/compressed${response.data.pic.path}`;
          altImg.onload = () => {
            newArray[index] = false;
            srcs[index] =
              `${process.env.REACT_APP_Source_URL}/public/compressed${response.data.pic.path}`;
            setLoadedSrc([...srcs]);
            setLoad([...newArray]);
          };
          altImg.onerror = () => {
            console.error("Failed to load alt image");
          };
        } catch (error) {
          console.log(error);
        }
      };
    });
    setLoading(false);
  }, [pics, setLoading]); // Image Load Function

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
          <div className="dbBlock" />
          <h1 className="db2ttl">
            Database of Plant Species in School 校内植物检索数据库
          </h1>
          <SearchBar
            handleGet={handleGet}
            searchResults={searchResults}
            query={query}
            handleSearch={handleSearch}
            barWidth="65%"
          />
        </div>

        <div className="numOfPlantsBox">
          <div className="numOfPlantsBoxInner">
            <div className="msg"># of Plant Species recorded in Database</div>
            <div className="number">
              <p className="numberP">~{numOfPlants}</p>
            </div>
          </div>
          <Link to="/glossary" className="link">
            Show the Full Species List......
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
                  {load[index] ? (
                    <div className="db2picAlt" />
                  ) : (
                    <img
                      style={{ cursor: "pointer" }}
                      src={loadedSrc[index]}
                      alt="plant"
                      className="picImg"
                      onClick={() =>
                        redirect(
                          loadedSrc[index].split("/").pop().split("-")[0],
                        )
                      }
                      // 从url中分离plant name
                    />
                  )}
                </div>
              );
            })
          : Array.from({ length: 3 }, (_, index) => index).map((index) => {
              return (
                <div key={index} className="pic">
                  {load[index] ? (
                    <div className="db2picAlt" />
                  ) : (
                    <img
                      style={{ cursor: "pointer" }}
                      src={loadedSrc[index]}
                      alt="plant"
                      className="picImg"
                      onClick={() =>
                        redirect(
                          loadedSrc[index].split("/").pop().split("-")[0],
                        )
                      }
                      // 从url中分离plant name
                    />
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default DatabaseTwo;
