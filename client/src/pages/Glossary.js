import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import LetterButton from "../components/LetterButton.js";
import { Link } from "react-router-dom";
import styles from "../styles/glossary.module.css";
import Navbar from "../components/Navbar.js";
import urls from "../tools/url.js";

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
        const response = await axios.get(urls.userInfoGlossary);
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
    //plant的类型是string
    handleGets(plant);
    navigate(`/search/${plant.replace(" ", "_")}`);
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
    <body className={styles.glossary}>
      <Navbar />
      <div className={styles.sec}>
        <div className={styles.greenTop} />
        <div className={styles.gTop}>
          <Link className={styles.back} to="/database">
            Back
          </Link>
          <h1 className={styles.gh1}>Glossary (Click Alphabet to expand)</h1>
        </div>
        <br />
        <br />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <section className={styles.letters}>
            <div className={styles.letters1}>
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
            <div className={styles.letters2}>
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
            <div className={styles.letters3}>
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
          <div className={styles.fullList}>
            <p>Want the Full List?</p>
            <Link to="https://bssgj-my.sharepoint.com/:b:/g/personal/zoe_he41172-biph_basischina_com/EWL-FJbpRiJKpnbj6lZ2g94BGblcwkIxvMI5qHt_PxaWYA?e=JQvdKO">
              Download
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.greenTop}></div>
    </body>
  );
};

export default Glossary;
