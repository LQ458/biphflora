import { useEffect } from "react";
import axios from "axios";

const useData = ({ url, setVariables, fetchAdmin, loading, setLoading }) => {
  // 检查 url 是否存在
  if (!url) {
    throw new Error("The 'url' parameter is required.");
  }

  useEffect(() => {
    const needLoading = setLoading !== undefined;

    const fetchData = async () => {
      try {
        needLoading && setLoading(true);
        // await fetchAdmin();
        const response = await axios.get(url);
        if (response.data && setVariables.length > 0) {
          setVariables(response);
        } else {
          console.error("Invalid response data or variables.");
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally {
        needLoading && setLoading(false);
      }
    };

    fetchData();
  }, [url, setLoading]);
};

export default useData;
