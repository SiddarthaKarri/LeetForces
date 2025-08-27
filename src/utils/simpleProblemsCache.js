// Simple global problems cache - loads once per session
let problemsData = null;
let isLoading = false;
let hasLoaded = false;

export const getProblemsData = async () => {
  // Return cached data if available
  if (hasLoaded && problemsData) {
    console.log('Using cached problems data');
    return problemsData;
  }

  // If already loading, wait for it
  if (isLoading) {
    console.log('Problems already loading, waiting...');
    // Simple polling to wait for loading to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return problemsData;
  }

  // Start loading
  console.log('Loading problems data for the first time...');
  isLoading = true;

  try {
    const response = await fetch('https://codeforces.com/api/problemset.problems');
    const json = await response.json();
    
    if (json.status === 'OK') {
      const problems = json.result.problems || [];
      
      // Calculate stats
      const countsByRating = {};
      problems.forEach(p => {
        if (p.rating) {
          countsByRating[p.rating] = (countsByRating[p.rating] || 0) + 1;
        }
      });

      problemsData = {
        total: problems.length,
        byRating: countsByRating,
        sample: problems.slice(0, 20) // Get first 20 as sample
      };

      hasLoaded = true;
      console.log(`Loaded ${problems.length} problems and cached them`);
    } else {
      throw new Error('Failed to fetch problems');
    }
  } catch (error) {
    console.error('Error loading problems:', error);
    problemsData = {
      total: 0,
      byRating: {},
      sample: []
    };
  } finally {
    isLoading = false;
  }

  return problemsData;
};

export const clearProblemsCache = () => {
  problemsData = null;
  hasLoaded = false;
  isLoading = false;
  console.log('Problems cache cleared');
};
