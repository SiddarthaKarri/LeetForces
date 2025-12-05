import { useState, useEffect, useCallback } from "react";
import { fetchFromCodeforces } from "../utils/api";

// Custom hook to fetch and share language and tag statistics
const useCodeforceStats = (handle) => {
  const [languageStats, setLanguageStats] = useState({});
  const [tagStats, setTagStats] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate language statistics
  const calculateLanguageStats = useCallback((allSubmissions) => {
    const languageCount = {};
    allSubmissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        const lang = sub.programmingLanguage;
        languageCount[lang] = (languageCount[lang] || 0) + 1;
      }
    });
    setLanguageStats(languageCount);
  }, []);

  // Calculate problem tag statistics  
  const calculateTagStats = useCallback((problems, allSubmissions) => {
    const acceptedProblems = new Set();
    allSubmissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        acceptedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
      }
    });

    const tagCount = {};
    problems.forEach(problem => {
      const problemKey = `${problem.contestId}-${problem.index}`;
      if (acceptedProblems.has(problemKey) && problem.tags) {
        problem.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    setTagStats(tagCount);
  }, []);

  useEffect(() => {
    if (!handle) return;

    setLoading(true);
    setLanguageStats({});
    setTagStats({});
    setSubmissions([]);

    // Fetch submissions and problems data
    Promise.all([
      fetchFromCodeforces(`/user.status?handle=${encodeURIComponent(handle)}`),
      fetchFromCodeforces(`/problemset.problems`)
    ])
      // responses are already parsed JSON from fetchFromCodeforces
      .then(([submissionsResponse, problemsResponse]) => {
        if (submissionsResponse.status === 'OK' && problemsResponse.status === 'OK') {
          const allSubmissions = submissionsResponse.result;

          // Store submissions data
          setSubmissions(allSubmissions);

          // Calculate statistics
          calculateLanguageStats(allSubmissions);
          calculateTagStats(problemsResponse.result.problems, allSubmissions);
        }
      })
      .catch(() => {
        setLanguageStats({});
        setTagStats({});
      })
      .finally(() => setLoading(false));
  }, [handle, calculateLanguageStats, calculateTagStats]);

  return { languageStats, tagStats, submissions, loading };
};

export default useCodeforceStats;
