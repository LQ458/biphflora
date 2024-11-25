import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import Navbar from "./Navbar";
import "./login.css";

const Login = () => {
  const { login } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login 登录";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(username, password);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      switch (error.message) {
        case "User not found":
          setMessage("User not found");
          break;
        default:
          setMessage("Invalid username or password");
          break;
      }
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_Source_URL}/userInfo`,
        );
        setAdmin(response.data.admin);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return (
    <body className="loginbd">
      <section className="loginsec">
        <div style={{ position: "fixed", left: 0, top: 0 }}>
          <Navbar />
        </div>
        <div className="form-box-login">
          <div className="form-value">
            <form onSubmit={handleSubmit} id="loginForm">
              <h2 className="titleLogin">Login</h2>
              <div className="inputboxLogin">
                <ion-icon name="mail-outline"></ion-icon>
                <input
                  name="username"
                  type="text"
                  required
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label for="username">Username:</label>
              </div>
              <div className="inputboxLogin">
                <input
                  name="password"
                  type="password"
                  required
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label for="password">Password:</label>
              </div>
              <br />
              <button type="submit" className="loginBtn">
                {loading && (
                  <div className="loading">
                    <TailSpin
                      type="ThreeDots"
                      color="white"
                      height={20}
                      width={40}
                      style={{ marginRight: "5px" }}
                    />
                    <span>Loading...</span>
                  </div>
                )}
                {!loading && <span>Login</span>}
              </button>
              <div className="login">
                {error && <div className="err">{message}</div>}
              </div>
            </form>
          </div>
        </div>
      </section>
    </body>
  );
};

export default Login;
