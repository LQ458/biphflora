import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import LetterButton from "./LetterButton";
import { Link } from "react-router-dom";
import "./glossary.css";
import Navbar from "./Navbar";

const Glossary = ({ handleGets }) => {
  const navigate = useNavigate();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [displays, setDisplays] = useState(letters.map(() => false));
  const [posts, setPosts] = useState([]);
  const [cnNames, setCnNames] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    document.title = "Glossary 植物表";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/userInfoGlossary`,
        );
        setUsername(response.data.username);
        setAdmin(response.data.admin);
        let newArray = [];
        let newCnNames = [];
        letters.forEach((letter, index) => {
          newArray[index] = response.data.glossary[letter.toLowerCase()];
          newCnNames[index] = response.data.cnNames[letter.toLowerCase()];
        });
        setPosts(newArray);
        setCnNames(newCnNames);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const redirect = (plant) => {
    handleGets(plant);
    navigate("/search");
  };

  const toggleDisplay = (index, type) => {
    const newDisplays = [...displays];
    if (type === "collapse") {
      newDisplays[index] = false;
    } else {
      newDisplays[index] = !newDisplays[index];
    }
    setDisplays(newDisplays);
  };

  return (
    <body className="glossary">
      <Navbar />
      <div className="sec">
        <div className="greenTop" />
        <div className="gTop">
          <Link className="back" to="/database">
            Back
          </Link>
          <h1 className="gh1">Glossary (Click Alphabet to expand)</h1>
        </div>
        <br />
        <br />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <section className="letters">
            <div className="letters1">
              {letters.slice(0, 9).map((letter, index) => (
                <LetterButton
                  key={index}
                  letter={letter}
                  redirect={redirect}
                  displays={displays}
                  post={posts[index]}
                  cnName={cnNames[index]}
                  letters={letters}
                  toggleDisplay={toggleDisplay}
                />
              ))}
            </div>
            <div className="letters2">
              {letters.slice(9, 18).map((letter, index) => (
                <LetterButton
                  key={index}
                  letter={letter}
                  redirect={redirect}
                  displays={displays}
                  post={posts[index + 9]}
                  cnName={cnNames[index + 9]}
                  letters={letters}
                  toggleDisplay={toggleDisplay}
                />
              ))}
            </div>
            <div className="letters3">
              {letters.slice(18, 26).map((letter, index) => (
                <LetterButton
                  key={index}
                  letter={letter}
                  redirect={redirect}
                  displays={displays}
                  post={posts[index + 18]}
                  cnName={cnNames[index + 18]}
                  letters={letters}
                  toggleDisplay={toggleDisplay}
                />
              ))}
            </div>
          </section>
          <div className="fullList">
            <p>Want the Full List?</p>
            <Link to="https://bssgj-my.sharepoint.com/:b:/g/personal/zoe_he41172-biph_basischina_com/EWL-FJbpRiJKpnbj6lZ2g94BGblcwkIxvMI5qHt_PxaWYA?e=JQvdKO">
              Download
            </Link>
          </div>
        </div>
      </div>
      <div className="greenTop"></div>
    </body>
  );
};

export default Glossary;