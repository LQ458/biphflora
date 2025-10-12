import React from "react";
import "../styles/subBox.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../UserContext";

const SubBox = ({
  displayObjectList,
  currentDisplayIndexes,
  index,
  handleGets,
}) => {
  const { user } = useContext(UserContext);
  const admin = user.get("admin");
  const navigate = useNavigate();
  const redirect = (plant) => {
    handleGets(plant);
    navigate(`/search/${plant.replace(" ", "_")}`);
  };

  return (
    <section className="subBox">
      {displayObjectList[currentDisplayIndexes[index]] && (
        <div style={{ position: "relative" }}>
          <div className="artCodeT">
            <img
              className="art"
              src={`${process.env.REACT_APP_Source_URL}/public${displayObjectList[currentDisplayIndexes[index]].art}`}
              alt="art"
            />
            {admin && (
              <p
                style={{
                  position: "absolute",
                  bottom: "7px",
                  left: "7px",
                  margin: 0,
                  backgroundColor: "white",
                  borderRadius: "4px",
                  paddingLeft: "3px",
                  paddingRight: "3px",
                }}
              >
                Code: {displayObjectList[currentDisplayIndexes[index]].artCode}
              </p>
            )}
          </div>
          <div className="picInfo">
            <span>
              {displayObjectList[currentDisplayIndexes[index]]?.photographer
                ? "Photographer: " +
                  displayObjectList[currentDisplayIndexes[index]].photographer
                : ""}
            </span>
            <span>
              {displayObjectList[currentDisplayIndexes[index]]?.date
                ? "Time: " +
                  displayObjectList[currentDisplayIndexes[index]].date.slice(0,10)
                : ""}
            </span>
            <span>
              {displayObjectList[currentDisplayIndexes[index]]?.location
                ? "Setting: " +
                  displayObjectList[currentDisplayIndexes[index]].location
                : ""}
            </span>
          </div>
          <div className="subsubBox">
            <div>
              <div
                className="subTop"
                onClick={() =>
                  redirect(
                    displayObjectList[currentDisplayIndexes[index]].plant,
                  )
                }
              >
                <h1>
                  <em>
                    {displayObjectList[currentDisplayIndexes[index]].name}
                  </em>{" "}
                  {displayObjectList[currentDisplayIndexes[index]].commonName}
                </h1>
                <h1>
                  {displayObjectList[currentDisplayIndexes[index]].chineseName}
                </h1>
              </div>
              {/* Name */}
              <div className="subMid">
                <h3>
                  {displayObjectList[currentDisplayIndexes[index]].artist
                    ? "By " +
                      displayObjectList[currentDisplayIndexes[index]].artist
                    : ""}
                </h3>
                <h3>
                  {displayObjectList[currentDisplayIndexes[index]].location
                    ? "Location: " +
                      displayObjectList[currentDisplayIndexes[index]].location
                    : ""}
                </h3>
              </div>
              {/* Art Info */}
              <div style={{ position: "relative", marginTop: "1.5rem" }}>
                <img
                  className="pic"
                  src={`${process.env.REACT_APP_Source_URL}/public${displayObjectList[currentDisplayIndexes[index]].pic}`}
                  alt="pic"
                />
                {admin && (
                  <p
                    style={{
                      position: "absolute",
                      bottom: "7px",
                      left: "7px",
                      margin: 0,
                      backgroundColor: "white",
                      borderRadius: "4px",
                      paddingLeft: "3px",
                      paddingRight: "3px",
                    }}
                  >
                    Code:{" "}
                    {displayObjectList[currentDisplayIndexes[index]].picCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {displayObjectList[currentDisplayIndexes[index + 1]] ? (
        <div style={{ position: "relative" }}>
          <div className="artCodeT">
            <img
              className="art"
              src={`${process.env.REACT_APP_Source_URL}/public${displayObjectList[currentDisplayIndexes[index + 1]].art}`}
              alt="art"
            />
            {admin && (
              <p
                style={{
                  position: "absolute",
                  bottom: "7px",
                  left: "7px",
                  margin: 0,
                  backgroundColor: "white",
                  borderRadius: "4px",
                  paddingLeft: "3px",
                  paddingRight: "3px",
                }}
              >
                Code:{" "}
                {displayObjectList[currentDisplayIndexes[index + 1]].artCode}
              </p>
            )}
          </div>
          <div className="picInfo">
            <span>
              {displayObjectList[currentDisplayIndexes[index + 1]].photographer
                ? "Photographer: " +
                  displayObjectList[currentDisplayIndexes[index + 1]]
                    .photographer
                : ""}
            </span>
            <span>
              {displayObjectList[currentDisplayIndexes[index + 1]].date
                ? "Time: " +
                  displayObjectList[currentDisplayIndexes[index + 1]].date.slice(0,10)
                : ""}
            </span>
            <span>
              {displayObjectList[currentDisplayIndexes[index + 1]].location
                ? "Setting: " +
                  displayObjectList[currentDisplayIndexes[index + 1]].location
                : ""}
            </span>
          </div>
          <div className="subsubBox">
            <div>
              <div
                className="subTop"
                onClick={() =>
                  redirect(
                    displayObjectList[currentDisplayIndexes[index + 1]].plant,
                  )
                }
              >
                <h1>
                  <em>
                    {displayObjectList[currentDisplayIndexes[index + 1]].name}
                  </em>{" "}
                  {
                    displayObjectList[currentDisplayIndexes[index + 1]]
                      .commonName
                  }
                </h1>
                <h1>
                  {
                    displayObjectList[currentDisplayIndexes[index + 1]]
                      .chineseName
                  }
                </h1>
              </div>
              <div className="subMid">
                <h3>
                  {displayObjectList[currentDisplayIndexes[index + 1]].artist
                    ? "By " +
                      displayObjectList[currentDisplayIndexes[index + 1]].artist
                    : ""}
                </h3>
                <h3>
                  {displayObjectList[currentDisplayIndexes[index + 1]].location
                    ? "Location: " +
                      displayObjectList[currentDisplayIndexes[index + 1]]
                        .location
                    : ""}
                </h3>
              </div>
              <div style={{ position: "relative", marginTop: "1.5rem" }}>
                <img
                  className="pic"
                  src={`${process.env.REACT_APP_Source_URL}/public${displayObjectList[currentDisplayIndexes[index + 1]].pic}`}
                  alt="pic"
                />
                {admin && (
                  <p
                    style={{
                      position: "absolute",
                      bottom: "7px",
                      left: "7px",
                      margin: 0,
                      backgroundColor: "white",
                      borderRadius: "4px",
                      paddingLeft: "3px",
                      paddingRight: "3px",
                    }}
                  >
                    Code:{" "}
                    {
                      displayObjectList[currentDisplayIndexes[index + 1]]
                        .picCode
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ): <div></div>}
    </section>
  );
};

export default SubBox;
