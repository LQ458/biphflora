// UserContext.js
import { createContext, useReducer, useEffect } from "react";
import { Map, fromJS } from "immutable";
import axios from "axios";

axios.defaults.withCredentials = true;

const userReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return state.merge(
        fromJS({ ...action.payload, status: "authenticated" }),
      );
    case "LOGOUT":
      return Map({ status: "unauthenticated" });
    default:
      return state;
  }
};

export const UserContext = createContext(Map());

export const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(userReducer, Map({ status: "loading" }));

  const refresh = async () => {
    try {
      const token = localStorage.getItem("askanything");
      const response = await axios.get(
        `${process.env.REACT_APP_Source_URL}/refresh`,
        {
          headers: {
            authorization: token,
          },
        },
      );
      if (response.data.user) {
        dispatch({ type: "LOGIN", payload: response.data.user });
      } else {
        dispatch({ type: "LOGOUT" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (username, password) => {
    try {
      const token = localStorage.getItem("askanything");
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/login`,
        {
          username,
          password,
          headers: {
            authorization: token,
          },
        },
      );
      switch (response.data.message) {
        case "Login successful":
          dispatch({ type: "LOGIN", payload: response.data.user });
          localStorage.setItem("askanything", response.data.token);
          return response.data.message;
        case "Already logged in":
          return response.data.message;
        case "User not found":
          throw new Error(response.data.message);
        default:
          throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("askanything");
      localStorage.removeItem("askanything");
      const response = await axios.post(
        `${process.env.REACT_APP_Source_URL}/logout`,
        {
          headers: {
            authorization: token,
          },
        },
      );
      if (response.data.message === "Logout successful") {
        dispatch({ type: "LOGOUT" });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
