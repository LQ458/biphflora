import { Link } from "react-router-dom";
import "./navBar.css";
import { useContext } from "react";
import { UserContext } from "./UserContext";

const Navbar = () => {
  const { user } = useContext(UserContext);
  const status = user.get("status");

  return (
    <div className="nav">
      <header className="topBar">
        <h1 className="htitle">BIPH FLORA 识草木</h1>
        <div className="links">
          <Link
            className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            to="/"
          >
            Home
          </Link>
          <Link
            className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            to="/database"
          >
            Database
          </Link>
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
          <Link
            className={`linkBarLink ${status !== "authenticated" && "widen"}`}
            to="/activities"
          >
            Activities
          </Link>
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
