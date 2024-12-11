import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import urls from "../tools/url.js";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [admin, setAdmin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Register 注册";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await axios.post(urls.register, {
        username,
        password,
        },
      );
      setMessage(response.data.message);
      if (response.data.message === "Register successful") {
        localStorage.setItem("token", response.data.token);
        alert("Registration successful, redirecting to home page...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
        setLoading(false);
      } else {
        setLoading(false);
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(urls.userInfo);
        setAdmin(response.data.admin);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return (
    <body className="registerbd">
      <section className="registersec">
        <div style={{ position: "fixed", left: 0, top: 0 }}>
          <Navbar />
        </div>
        <div className="form-box-register">
          <div className="form-value">
            <form onSubmit={handleSubmit} id="registerForm">
              <h2 className="regtitle">Register</h2>
              <div className="inputboxRegister">
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
              <div className="inputboxRegister">
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
              <button type="submit" className="registerBtn">
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
                {!loading && <span>Register</span>}
              </button>
              <div className="register">
                {error && (
                  <div className="error">
                    <span>{message}</span>
                  </div>
                )}
                {!error && (
                  <p>
                    Already have an account?{" "}
                    <Link to="/KQsfhwifheKDFJfkdfjdkfjd3q3puod0d0">Login</Link>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </body>
  );
};

export default Register;
