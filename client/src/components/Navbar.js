import { Link, redirect } from "react-router-dom";
import "../styles/navBar.css";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const status = user.get("status");
  const navigate = useNavigate();

  return (
    <div className="nav">
      <header className="topBar">
        <h1 className="htitle">BIPH FLORA & FAUNA</h1>
        <div className="links">
          {/* <Link
            className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            to="/home"
          >
            Home
          </Link> */}
          {/* <Link
            className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            to="/database_plant"
          >
            Database
          </Link> */}
          <div className={`dropdown ${status !== "authenticated" && "widen"}`}>
            <span className="linkBarLinkDD">Database</span>
            <div className="dropdown-content">
              <Link to="/databasePlant">Plants</Link>
              <Link to="/databaseBird">Birds</Link>
            </div>
          </div>
          <Link
            className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            to="/creation"
          >
            Creation
          </Link>
          {status === "authenticated" && (
            <Link
              to="/upload"
              className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            >
              Upload
            </Link>
          )}
          {/* <Link
            className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            to="/activities"
          >
            Activities
          </Link> */}
          <Link
            className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            to="/aboutUs"
          >
            About us
          </Link>
        </div>
      </header>
      <div className="hline"></div>
    </div>
  );
};

export default Navbar;
