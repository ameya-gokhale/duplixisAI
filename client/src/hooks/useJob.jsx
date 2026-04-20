import { useState, useEffect, useRef } from "react";
import { pollJob } from "../utils/api.jsx";

export function useJob(jobId) {
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const fetch = async () => {
      try {
        const { data } = await pollJob(jobId);
        setJob(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(intervalRef.current);
        }
      } catch (e) {
        setError(e.message);
        clearInterval(intervalRef.current);
      }
    };

    fetch();
    intervalRef.current = setInterval(fetch, 2000);

    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  return { job, error };
}
