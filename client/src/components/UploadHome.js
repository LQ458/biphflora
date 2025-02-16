import axios from "axios";
import React, { useState, useEffect } from "react";
import "../styles/uploadHome.css";

const UploadHome = () => {
  const [homeEntries, setHomeEntries] = useState([]);

  const [serial1, setSerial1] = useState();
  const [serial2, setSerial2] = useState();
  const [returnMessage, setReturnMessage] = useState("");

  const handleUnfeature = async (id) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/unFeatureHome`,
        { id },
      );
      setHomeEntries(response.data.f);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/uploadHome`,
        );
        setHomeEntries(response.data.entries);
        console.log(response.data.entries);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    console.log("handlesubmitTriggered");
    e.preventDefault();
    console.log("Serial No.1 " + serial1);
    console.log("Serial No.2 " + serial2);

    const formData = new FormData();
    formData.append("serial1", serial1);
    formData.append("serial2", serial2);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/featureToHome`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setReturnMessage(response.data.message);
    } catch (error) {
      console.log(error);
      setReturnMessage(error.response.data.message);
    }
  };

  return (
    <>
      <h1 className="homeTitle">Home</h1>
      <form encType="multipart/form-data" onSubmit={handleSubmit}>
        <h2>Feature New</h2>
        <label htmlFor="serial1">Pic:</label>
        <input
          type="text"
          id="serial1"
          name="serial1"
          placeholder="Serial No. 1"
          className="inputBox"
          value={serial1}
          onChange={(e) => setSerial1(e.target.value)}
          required
        />
        <br />
        <label htmlFor="serial2">Art:</label>
        <input
          type="text"
          id="serial2"
          name="serial2"
          placeholder="Serial No. 2"
          className="inputBox"
          value={serial2}
          onChange={(e) => setSerial2(e.target.value)}
        />
        <br />
        <button type="submit" className="formSubmit">
          Submit
        </button>
      </form>
      {Array.isArray(homeEntries) &&
        homeEntries.map((item, index) => (
          <>
            <br /> <br />
            <div key={index} className="homeEntryBox">
              <h3 className="h31">
                {index + 1}. {item.works?.pic?.plant}
              </h3>
              <img
                className="img1"
                key={index}
                src={`${process.env.REACT_APP_Source_URL}/public${item.works?.pic?.path}`}
                alt={item.works?.pic?.plant}
              />
              <img
                className="img1"
                key={index}
                src={`${process.env.REACT_APP_Source_URL}/public${item.works?.art?.path}`}
                alt={item.works?.art?.plant}
              />

              <button
                className="btn2"
                onClick={() => handleUnfeature(item._id)}
              >
                Unfeature
              </button>
            </div>
          </>
        ))}
    </>
  );
};

export default UploadHome;
