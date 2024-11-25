import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="notFound">
        <h1 className="notFoundTitle">404</h1>
        <button className="notFoundBtn" onClick={() => navigate("/")}>
          Return to Home{" "}
        </button>
      </div>
    </>
  );
};

export default NotFound;
