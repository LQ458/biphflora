import React, { useState, useEffect } from "react";
import axios from "../api/http";
import urls from "../tools/url";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.js";
import "../styles/admin.css";

const Admin = ({ handleAdminPreview }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [userLoadingState, setUserLoadingState] = useState();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(urls.userInfo);
        if (!response.data.admin) {
          alert("You are not an admin, redirecting to home page...");
          navigate("/");
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchData = async () => {
      try {
        await fetchAdmin();
        const response = await axios.get(
          urls.adminDataGet,
        );
        setUsers(response.data.users);
        setPlants(response.data.plants);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // const handleAdminPreviewl = async (input) => {
  //   handleAdminPreview(input);
  //   navigate("/adminView");
  // };

  const toggleAdmin = async (username) => {
    const name = username;
    setUserLoadingState("loading...");
    try {
      await axios.post(
        urls.adminToggle,
        { username: name },
      );
      setUserLoadingState("done");
      setTimeout(() => {
        setUserLoadingState(null);
      }, 500);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.username === username ? { ...user, admin: !user.admin } : user,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />
      <br />
      <h1 className="admin">
        Administrator's Page{" "}
        <button className="logout" onClick={logout}>
          Log out
        </button>
      </h1>
      <h1 className="admin" style={{ fontSize: "1.8rem" }}>
        Users
      </h1>
      <div className="userInfo">
        <div className="usernameList">
          <table className="userTable">
            <thead>
              <tr>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id || user.username}>
                  <td className="Name">{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adminStatusList">
          <h2 className="admin">Admin Status</h2>
          <table className="adminTable">
            <thead>
              <tr>
                <th>Username</th>
                <th>Admin Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="Name">{user.username}</td>
                  <td>{user.admin.toString()}</td>
                  <td>
                    <button
                      className="toggle"
                      onClick={() => toggleAdmin(user.username)}
                    >
                      {" "}
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="usrLoad">{userLoadingState}</h2>
        </div>

        <br />
      </div>
      <br></br>
      <h1 className="admin" style={{ fontSize: "1.8rem" }}>
        Entries
      </h1>
      <div className="entriesInfo">
        <table className="plantsTable">
          <thead>
            <tr>
              <th>Latin Name</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr key={plant.id}>
                <td className="Name">{plant.latinName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Array(4)
        .fill()
        .map((_, i) => (
          <br key={i} />
        ))}{" "}
    </>
  );
};

export default Admin;
