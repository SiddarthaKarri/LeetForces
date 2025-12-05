import React, { useEffect, useState, useMemo, useCallback } from "react";
import { BASE_URL } from "../config";
import { fetchFromCodeforces } from "../utils/api";
import { HeatmapSkeleton } from "./LoadingSpinner";

/**
 * Fetches recent user submissions using user.status
 */
export default function SubmissionsPanel({ handle }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('overall'); // 'overall' or rating range
  const [hoveredCategory, setHoveredCategory] = useState(null); // for hover effects
  const [totalProblemsAvailable, setTotalProblemsAvailable] = useState(0); // real count from API
  const [searchFilter, setSearchFilter] = useState(''); // New: search filter for submissions
  const [currentPage, setCurrentPage] = useState(1); // New: pagination
  const [itemsPerPage] = useState(25); // New: items per page
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState(null); // New: selected day in heatmap
  const [languageStats, setLanguageStats] = useState({}); // New: language statistics
  const [tagStats, setTagStats] = useState({}); // New: problem tag statistics
  const [darkMode, setDarkMode] = useState(false); // New: dark mode toggle
  const [shareModalOpen, setShareModalOpen] = useState(false); // New: share modal
  const [heatmapScrollRef, setHeatmapScrollRef] = useState(null); // New: ref for heatmap scrolling
  const [hoverTooltip, setHoverTooltip] = useState(null); // New: hover tooltip state
  const [solvedProblems, setSolvedProblems] = useState({
    allTime: 0,
    lastYear: 0,
    lastMonth: 0,
    '800-1200': 0,
    '1201-1600': 0,
    '1601-2000': 0,
    '2001-2400': 0,
    '2401+': 0,
    attempting: 0
  });

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setSubs([]);

    // Update URL with username for sharing
    // Use BASE_URL to ensure we stay within the correct path
    const newUrl = `${window.location.origin}${BASE_URL}/@${encodeURIComponent(handle)}`;
    window.history.replaceState({}, '', newUrl);

    // Fetch user info, ALL submissions, and total problems in parallel
    // Fetch user info, ALL submissions, and total problems in parallel
    Promise.all([
      fetchFromCodeforces(`/user.info?handles=${encodeURIComponent(handle)}`),
      fetchFromCodeforces(`/user.status?handle=${encodeURIComponent(handle)}`),
      fetchFromCodeforces(`/problemset.problems`)
    ])
      // responses are already parsed JSON from fetchFromCodeforces
      .then(([userResponse, submissionsResponse, problemsResponse]) => {
        if (userResponse.status === 'OK' && submissionsResponse.status === 'OK') {
          setUserInfo(userResponse.result[0]);

          // Set total problems available
          if (problemsResponse.status === 'OK') {
            setTotalProblemsAvailable(problemsResponse.result.problems.length);
          }

          // Process ALL submissions for statistics
          const allSubmissions = submissionsResponse.result;
          setSubmissions(allSubmissions);

          // Take recent submissions for display (will be filtered by search)
          const recentSubmissions = allSubmissions.slice(0, 100); // Increased for better filtering
          const mapped = recentSubmissions.map(s => ({
            id: s.id,
            verdict: s.verdict,
            name: s.problem.name,
            contestId: s.problem.contestId,
            index: s.problem.index,
            rating: s.problem.rating,
            language: s.programmingLanguage,
            time: new Date(s.creationTimeSeconds * 1000).toLocaleString(),
            creationTime: s.creationTimeSeconds
          }));
          setSubs(mapped);

          // Calculate statistics
          calculateSolvedProblems(allSubmissions);
          calculateLanguageStats(allSubmissions);
          calculateTagStats(problemsResponse.result.problems, allSubmissions);
        } else {
          resetData();
        }
      })
      .catch(() => resetData())
      .finally(() => setLoading(false));
  }, [handle]);

  // Auto-scroll heatmap to show latest submissions when data loads
  useEffect(() => {
    if (heatmapScrollRef && !loading && submissions.length > 0) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        heatmapScrollRef.scrollLeft = heatmapScrollRef.scrollWidth - heatmapScrollRef.clientWidth;
      }, 100);
    }
  }, [heatmapScrollRef, loading, submissions.length]);

  const resetData = useCallback(() => {
    setSubs([]);
    setSubmissions([]);
    setUserInfo(null);
    setSolvedProblems({ allTime: 0, lastYear: 0, lastMonth: 0, '800-1200': 0, '1201-1600': 0, '1601-2000': 0, '2001-2400': 0, '2401+': 0, attempting: 0 });
    setLanguageStats({});
    setTagStats({});
  }, []);

  // Calculate real solved problems (only accepted submissions) - Memoized for performance
  const calculateSolvedProblems = useCallback((allSubmissions) => {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get only accepted submissions
    const acceptedSubmissions = allSubmissions.filter(sub => sub.verdict === 'OK');

    // Track unique problems solved (by contestId + index)
    const allTimeProblems = new Set();
    const lastYearProblems = new Set();
    const lastMonthProblems = new Set();

    // Track by difficulty
    const difficultyBreakdown = {
      '800-1200': new Set(),
      '1201-1600': new Set(),
      '1601-2000': new Set(),
      '2001-2400': new Set(),
      '2401+': new Set()
    };

    // Track attempted problems (all submissions, not just accepted)
    const attemptedProblems = new Set();

    // First, track all attempted problems
    allSubmissions.forEach(sub => {
      const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
      attemptedProblems.add(problemKey);
    });

    acceptedSubmissions.forEach(sub => {
      const submissionDate = new Date(sub.creationTimeSeconds * 1000);
      const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;

      // All time
      allTimeProblems.add(problemKey);

      // Difficulty breakdown by rating ranges
      const rating = sub.problem.rating;
      if (rating) {
        if (rating >= 800 && rating <= 1200) {
          difficultyBreakdown['800-1200'].add(problemKey);
        } else if (rating >= 1201 && rating <= 1600) {
          difficultyBreakdown['1201-1600'].add(problemKey);
        } else if (rating >= 1601 && rating <= 2000) {
          difficultyBreakdown['1601-2000'].add(problemKey);
        } else if (rating >= 2001 && rating <= 2400) {
          difficultyBreakdown['2001-2400'].add(problemKey);
        } else if (rating > 2400) {
          difficultyBreakdown['2401+'].add(problemKey);
        }
      }

      // Last year
      if (submissionDate >= oneYearAgo) {
        lastYearProblems.add(problemKey);
      }

      // Last month
      if (submissionDate >= oneMonthAgo) {
        lastMonthProblems.add(problemKey);
      }
    });

    setSolvedProblems({
      allTime: allTimeProblems.size,
      lastYear: lastYearProblems.size,
      lastMonth: lastMonthProblems.size,
      '800-1200': difficultyBreakdown['800-1200'].size,
      '1201-1600': difficultyBreakdown['1201-1600'].size,
      '1601-2000': difficultyBreakdown['1601-2000'].size,
      '2001-2400': difficultyBreakdown['2001-2400'].size,
      '2401+': difficultyBreakdown['2401+'].size,
      attempting: attemptedProblems.size
    });
  }, []);

  // Calculate language statistics - New feature
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

  // Calculate problem tag statistics - New feature  
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

  const getSubmissionUrl = (contestId, submissionId) => {
    return `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
  };

  const getProblemUrl = (contestId, index) => {
    return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'OK') return 'var(--easy-color)';
    if (verdict.includes('WRONG_ANSWER')) return 'var(--hard-color)';
    if (verdict.includes('TIME_LIMIT_EXCEEDED')) return 'var(--medium-color)';
    if (verdict.includes('COMPILATION_ERROR')) return 'var(--hard-color)';
    return 'var(--text-muted)';
  };

  const getDifficultyColor = (rating) => {
    if (!rating) return 'var(--text-muted)';
    if (rating <= 1200) return 'var(--easy-color)';
    if (rating <= 1900) return 'var(--medium-color)';
    return 'var(--hard-color)';
  };

  // Generate LeetCode-style SVG heatmap data - Memoized for performance
  const generateHeatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Start from exactly one year ago
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    // Find the Sunday of the week containing oneYearAgo
    const startDate = new Date(oneYearAgo);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const weeks = [];
    const dayData = {};

    // Create submission count map
    submissions.forEach(sub => {
      const date = new Date(sub.creationTimeSeconds * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dayData[dateStr] = (dayData[dateStr] || 0) + 1;
    });

    let currentDate = new Date(startDate);
    let monthIndex = 1;
    let currentMonth = -1;

    // Generate weeks for the full year
    while (currentDate <= today) {
      const weekData = [];

      for (let day = 0; day < 7; day++) {
        const cellDate = new Date(currentDate);
        cellDate.setDate(currentDate.getDate() + day);

        // Check if we need to start a new month
        if (cellDate.getMonth() !== currentMonth) {
          currentMonth = cellDate.getMonth();
          monthIndex++;
        }

        if (cellDate <= today && cellDate >= oneYearAgo) {
          const dateStr = cellDate.toISOString().split('T')[0];
          const submissionCount = dayData[dateStr] || 0;

          weekData.push({
            date: new Date(cellDate),
            dateStr: dateStr,
            submissions: submissionCount,
            submissionDetails: submissions.filter(sub => {
              const subDate = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
              return subDate === dateStr;
            }),
            isToday: cellDate.toDateString() === today.toDateString(),
            month: cellDate.getMonth(),
            monthIndex: monthIndex,
            isFirstDayOfMonth: cellDate.getDate() === 1,
            isFuture: cellDate > today
          });
        } else if (cellDate > today) {
          // Future days - transparent
          weekData.push({
            date: new Date(cellDate),
            dateStr: cellDate.toISOString().split('T')[0],
            submissions: 0,
            submissionDetails: [],
            isToday: false,
            month: cellDate.getMonth(),
            monthIndex: monthIndex,
            isFirstDayOfMonth: false,
            isFuture: true
          });
        } else {
          // Past days before our range
          weekData.push({
            date: new Date(cellDate),
            dateStr: cellDate.toISOString().split('T')[0],
            submissions: 0,
            submissionDetails: [],
            isToday: false,
            month: cellDate.getMonth(),
            monthIndex: monthIndex,
            isFirstDayOfMonth: false,
            isFuture: false
          });
        }
      }

      weeks.push(weekData);
      currentDate.setDate(currentDate.getDate() + 7);

      // Stop if we've gone too far past today
      if (currentDate.getTime() - today.getTime() > 7 * 24 * 60 * 60 * 1000) {
        break;
      }
    }

    return weeks;
  }, [submissions]);

  const getLeetCodeFill = (level, isFuture) => {
    if (isFuture) return "transparent";

    // Use LeetCode's exact color scheme
    const colors = {
      0: "var(--fill-tertiary)", // Empty days - light gray in light mode, dark gray in dark mode
      1: "var(--green-20)",       // Light green
      2: "var(--green-40)",       // Medium green  
      3: "var(--green-60)",       // Darker green
      4: "var(--green-80)"        // Darkest green
    };

    return colors[level] || "var(--fill-tertiary)";
  };

  const generateSVGHeatmap = () => {
    const cellSize = 10;
    const cellGap = 2;
    const monthGap = 8; // Add extra gap between months
    const weeks = generateHeatmapData;

    if (!weeks.length) return null;

    // Group weeks by month and add spacing
    const monthGroups = [];
    let currentMonthGroup = null;
    let xOffset = 0;

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(day => day);
      if (!firstValidDay) return;

      const monthNum = firstValidDay.month + 1;

      if (!currentMonthGroup || currentMonthGroup.month !== monthNum) {
        if (currentMonthGroup) {
          monthGroups.push(currentMonthGroup);
          xOffset += monthGap; // Add gap between months
        }
        currentMonthGroup = {
          month: monthNum,
          weeks: [],
          startX: xOffset
        };
      }

      currentMonthGroup.weeks.push({
        weekData: week,
        x: xOffset
      });

      xOffset += (cellSize + cellGap);
    });

    if (currentMonthGroup) {
      monthGroups.push(currentMonthGroup);
    }

    const totalWidth = xOffset;
    const totalHeight = 7 * (cellSize + cellGap);

    // Generate month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div className="leetcode-svg-heatmap" style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${totalWidth + 20} ${totalHeight + 40}`} width="100%" height="140">
          {monthGroups.map((monthGroup, groupIndex) => (
            <g key={groupIndex}>
              {/* Month separator line */}
              {groupIndex > 0 && (
                <line
                  x1={monthGroup.startX - monthGap / 2}
                  y1="0"
                  x2={monthGroup.startX - monthGap / 2}
                  y2={totalHeight}
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  opacity="0.3"
                />
              )}

              {monthGroup.weeks.map((weekInfo, weekIndex) => (
                <g key={weekIndex}>
                  {weekInfo.weekData.map((day, dayIndex) => {
                    if (!day) return null;

                    const y = dayIndex * (cellSize + cellGap);
                    const level = getHeatmapLevel(day.submissions);
                    const fill = getLeetCodeFill(level, day.isFuture);
                    const isSelected = selectedHeatmapDay?.dateStr === day.dateStr;

                    // Don't render future days
                    if (day.isFuture) return null;

                    return (
                      <rect
                        key={dayIndex}
                        x={weekInfo.x}
                        y={y}
                        width={cellSize}
                        height={cellSize}
                        fill={fill}
                        rx="2"
                        ry="2"
                        className={`cursor-pointer ${isSelected ? 'selected' : ''} ${day.isToday ? 'today' : ''}`}
                        data-state="closed"
                        onMouseEnter={(e) => {
                          const rect = e.target.getBoundingClientRect();
                          const container = e.target.closest('.leetcode-svg-heatmap').getBoundingClientRect();
                          const scrollContainer = document.querySelector('.leetcode-svg-heatmap');

                          // Calculate position relative to container
                          let x = rect.left - container.left + rect.width / 2;
                          let y = rect.top - container.top - 10;

                          // Ensure tooltip doesn't go off screen
                          const tooltipWidth = 200; // Approximate tooltip width
                          const tooltipHeight = 60; // Approximate tooltip height
                          const containerWidth = container.width;
                          const containerHeight = container.height;

                          // Adjust horizontal position if too close to edges
                          if (x - tooltipWidth / 2 < 10) {
                            x = tooltipWidth / 2 + 10;
                          } else if (x + tooltipWidth / 2 > containerWidth - 10) {
                            x = containerWidth - tooltipWidth / 2 - 10;
                          }

                          // Smart vertical positioning for all rows
                          let showBelow = false;
                          const spaceAbove = rect.top - container.top;
                          const spaceBelow = container.bottom - rect.bottom;

                          // For rows 2, 3, 4 (middle rows), check which side has more space
                          if (dayIndex >= 1 && dayIndex <= 3) {
                            if (spaceBelow > spaceAbove && spaceBelow > tooltipHeight + 10) {
                              // Show below if there's more space below
                              y = rect.top - container.top + rect.height + 10;
                              showBelow = true;
                            } else if (spaceAbove > tooltipHeight + 10) {
                              // Show above if there's enough space
                              y = rect.top - container.top - 10;
                              showBelow = false;
                            } else {
                              // Default to above for middle rows
                              y = rect.top - container.top - 10;
                              showBelow = false;
                            }
                          } else {
                            // For top row (dayIndex 0) and bottom rows (5, 6), use original logic
                            if (y < tooltipHeight + 10) {
                              y = rect.top - container.top + rect.height + 10; // Show below instead
                              showBelow = true;
                            }
                          }

                          setHoverTooltip({
                            x: x,
                            y: y,
                            submissions: day.submissions,
                            date: day.date,
                            submissionDetails: day.submissionDetails,
                            showBelow: showBelow
                          });
                        }}
                        onMouseLeave={() => setHoverTooltip(null)}
                        onClick={() => setSelectedHeatmapDay(day.submissions > 0 ? day : null)}
                        style={{
                          stroke: isSelected ? 'var(--easy-color)' : (day.isToday ? 'var(--text-primary)' : 'transparent'),
                          strokeWidth: isSelected || day.isToday ? '2' : '0',
                          cursor: 'pointer'
                        }}
                      />
                    );
                  })}
                </g>
              ))}
            </g>
          ))}

          {/* Month labels */}
          {monthGroups.map((monthGroup, index) => {
            const monthName = monthNames[monthGroup.month - 1] || `Month ${monthGroup.month}`;
            return (
              <text
                key={index}
                x={monthGroup.startX + 10}
                y={totalHeight + 25}
                fontSize="11px"
                fill="var(--text-muted)"
                className="font-xs"
              >
                {monthName}
              </text>
            );
          })}
        </svg>

        {/* Custom Tooltip */}
        {hoverTooltip && (
          <div
            className="heatmap-tooltip"
            style={{
              position: 'absolute',
              left: hoverTooltip.x,
              top: hoverTooltip.y,
              transform: hoverTooltip.showBelow
                ? 'translateX(-50%) translateY(0%)'
                : 'translateX(-50%) translateY(-100%)',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              zIndex: 1000,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              backdropFilter: 'blur(8px)',
              maxWidth: '200px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
              {hoverTooltip.submissions === 0 ? 'No submissions' :
                hoverTooltip.submissions === 1 ? '1 submission' :
                  hoverTooltip.submissions === 2 ? '2 submissions' :
                    hoverTooltip.submissions === 3 ? '3 submissions' :
                      hoverTooltip.submissions === 4 ? '4 submissions' :
                        `${hoverTooltip.submissions} submissions`}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              {hoverTooltip.date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getHeatmapLevel = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const getMonthLabels = (weeks) => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      // Find the first valid day in the week
      const firstValidDay = week.find(day => day !== null);
      if (!firstValidDay) return;

      const month = firstValidDay.date.getMonth();
      const monthName = monthNames[month];

      // Add month label when month changes
      if (month !== lastMonth) {
        months.push({
          name: monthName,
          weekIndex: weekIndex,
          position: weekIndex * 14 // 12px width + 2px gap
        });
        lastMonth = month;
      }
    });

    return months;
  };

  // Get filtered and paginated submissions - Memoized for performance
  const filteredSubmissions = useMemo(() => {
    if (!searchFilter) return subs;

    const lowercaseFilter = searchFilter.toLowerCase();
    return subs.filter(sub =>
      sub.name.toLowerCase().includes(lowercaseFilter) ||
      sub.verdict.toLowerCase().includes(lowercaseFilter) ||
      sub.language.toLowerCase().includes(lowercaseFilter) ||
      (sub.contestId && sub.contestId.toString().includes(lowercaseFilter)) ||
      (sub.index && sub.index.toLowerCase().includes(lowercaseFilter)) ||
      (sub.rating && sub.rating.toString().includes(lowercaseFilter))
    );
  }, [subs, searchFilter]);

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  const heatmapWeeks = generateHeatmapData;
  const monthLabels = useMemo(() => getMonthLabels(heatmapWeeks), [heatmapWeeks]);

  // Filter submissions from past year for accurate statistics
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const pastYearSubmissions = submissions.filter(sub => {
    const submissionDate = new Date(sub.creationTimeSeconds * 1000);
    return submissionDate >= oneYearAgo;
  });

  const totalSubmissions = pastYearSubmissions.length;

  // Calculate statistics based on past year data
  const activeDays = heatmapWeeks.flat().filter(day => day && day.submissions > 0).length;
  const maxStreak = calculateMaxStreak(heatmapWeeks);
  const currentStreak = calculateCurrentStreak(heatmapWeeks);
  const lastYearMaxStreak = calculateLastYearMaxStreak(heatmapWeeks);
  const lastMonthStreak = calculateLastMonthStreak(heatmapWeeks);

  // Helper function to calculate max streak (all time in the year)
  function calculateMaxStreak(weeks) {
    let maxStreak = 0;
    let currentStreak = 0;

    weeks.flat().forEach(day => {
      if (!day) return; // Skip null days
      if (day.submissions > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  }

  // Helper function to calculate current streak (from today backwards)
  function calculateCurrentStreak(weeks) {
    let streak = 0;
    const allDays = weeks.flat().filter(day => day !== null); // Filter out null days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from today and go backwards
    for (let i = allDays.length - 1; i >= 0; i--) {
      const day = allDays[i];
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);

      // Only count days up to today
      if (dayDate > today) continue;

      if (day.submissions > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Helper function to calculate last year max streak
  function calculateLastYearMaxStreak(weeks) {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    let maxStreak = 0;
    let currentStreak = 0;

    weeks.flat().forEach(day => {
      if (!day) return; // Skip null days
      const dayDate = new Date(day.date);

      if (dayDate >= oneYearAgo && dayDate <= now) {
        if (day.submissions > 0) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
    });

    return maxStreak;
  }

  // LeetCode-style Progress Component with Enhanced Animations and Hover Effects
  const LeetCodeProgress = React.memo(() => {
    const categories = [
      { key: '800-1200', label: '800-1200', color: '#00b4aa', total: Math.floor(totalProblemsAvailable * 0.25) },
      { key: '1201-1600', label: '1201-1600', color: '#ffc01e', total: Math.floor(totalProblemsAvailable * 0.25) },
      { key: '1601-2000', label: '1601-2000', color: '#ff375f', total: Math.floor(totalProblemsAvailable * 0.25) },
      { key: '2001-2400', label: '2001-2400', color: '#b91c1c', total: Math.floor(totalProblemsAvailable * 0.15) },
      { key: '2401+', label: '2401+', color: '#7c3aed', total: Math.floor(totalProblemsAvailable * 0.1) }
    ];

    const getProgressData = useCallback(() => {
      const activeCategory = hoveredCategory || selectedCategory;

      if (activeCategory === 'overall' || !activeCategory) {
        return {
          solved: solvedProblems.allTime,
          total: totalProblemsAvailable || solvedProblems.attempting,
          label: 'Solved',
          color: '#f59e0b'
        };
      } else {
        const category = categories.find(c => c.key === activeCategory);
        return {
          solved: solvedProblems[activeCategory] || 0,
          total: category ? category.total : 100,
          label: activeCategory,
          color: category ? category.color : '#f59e0b'
        };
      }
    }, [hoveredCategory, selectedCategory, solvedProblems, totalProblemsAvailable]);

    const progressData = getProgressData();
    const percentage = progressData.total > 0 ? (progressData.solved / progressData.total) * 100 : 0;

    // Main circle parameters
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Enhanced loading animation
    const LoadingCircle = () => (
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--border-color)"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={`${circumference * 0.25} ${circumference}`}
        strokeLinecap="round"
        style={{
          animation: 'spin 1s linear infinite',
          opacity: 0.6
        }}
      />
    );

    // Create multi-colored progress segments with enhanced animations
    const getProgressSegments = useCallback(() => {
      if (loading) {
        return <LoadingCircle />;
      }

      if (hoveredCategory && hoveredCategory !== 'overall') {
        // Single color for hovered category with pulse animation
        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
        return (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressData.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
              animation: hoveredCategory ? 'pulse 2s infinite' : 'none'
            }}
          />
        );
      } else {
        // Multi-colored segments with staggered animations
        let totalOffset = 0;
        return categories.map((category, index) => {
          const solved = solvedProblems[category.key] || 0;
          const categoryPercentage = totalProblemsAvailable > 0 ? (solved / totalProblemsAvailable) * 100 : 0;
          const segmentLength = (categoryPercentage / 100) * circumference;
          const strokeDasharray = `${segmentLength} ${circumference}`;
          const strokeDashoffset = -totalOffset;

          totalOffset += segmentLength;

          return (
            <circle
              key={category.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={category.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: `stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s, stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`,
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))'
              }}
            />
          );
        });
      }
    }, [loading, hoveredCategory, percentage, progressData.color, categories, solvedProblems, totalProblemsAvailable, circumference, radius, size, strokeWidth]);

    return (
      <div className="flex items-center gap-6 flex-wrap lg:flex-nowrap">
        {/* Main Progress Circle - Responsive width */}
        <div className="flex-1 min-w-0 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
              <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="var(--border-color)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  opacity={0.2}
                />
                {/* Progress segments */}
                {getProgressSegments()}
              </svg>
              {/* Center text with enhanced animations */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="text-3xl font-bold transition-all duration-300"
                  style={{
                    color: hoveredCategory ? progressData.color : 'var(--text-primary)',
                    transform: hoveredCategory ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {progressData.solved}
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  /{progressData.total}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {hoveredCategory ? progressData.label : 'Solved'}
                </div>
                {(hoveredCategory || selectedCategory !== 'overall') && (
                  <div
                    className="text-xs mt-1 transition-all duration-300"
                    style={{
                      color: hoveredCategory ? progressData.color : 'var(--text-muted)',
                      opacity: hoveredCategory ? 1 : 0.7
                    }}
                  >
                    {Math.round(percentage)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Grid - Responsive layout */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* First Row */}
            <div className="flex gap-2 sm:gap-3">
              {categories.slice(0, 2).map((category) => {
                const solved = solvedProblems[category.key] || 0;
                const total = category.total;
                const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

                return (
                  <div
                    key={category.key}
                    onMouseEnter={() => setHoveredCategory(category.key)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => setSelectedCategory(selectedCategory === category.key ? 'overall' : category.key)}
                    className="flex-1 flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: hoveredCategory === category.key ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                      borderColor: hoveredCategory === category.key ? category.color : 'var(--border-color)',
                      borderWidth: hoveredCategory === category.key ? '2px' : '1px',
                      height: '60px', // Fixed height for consistent sizing
                      boxShadow: hoveredCategory === category.key ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: category.color,
                          boxShadow: hoveredCategory === category.key ? `0 0 8px ${category.color}` : 'none'
                        }}
                      />
                      <div className="text-left min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate" style={{ color: category.color }}>
                          {category.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {solved}/{total}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Second Row */}
            <div className="flex gap-2 sm:gap-3">
              {categories.slice(2, 4).map((category) => {
                const solved = solvedProblems[category.key] || 0;
                const total = category.total;
                const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

                return (
                  <div
                    key={category.key}
                    onMouseEnter={() => setHoveredCategory(category.key)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => setSelectedCategory(selectedCategory === category.key ? 'overall' : category.key)}
                    className="flex-1 flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: hoveredCategory === category.key ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                      borderColor: hoveredCategory === category.key ? category.color : 'var(--border-color)',
                      borderWidth: hoveredCategory === category.key ? '2px' : '1px',
                      height: '60px', // Fixed height for consistent sizing
                      boxShadow: hoveredCategory === category.key ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: category.color,
                          boxShadow: hoveredCategory === category.key ? `0 0 8px ${category.color}` : 'none'
                        }}
                      />
                      <div className="text-left min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate" style={{ color: category.color }}>
                          {category.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {solved}/{total}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Third Row */}
            <div className="flex gap-2 sm:gap-3">
              {categories.slice(4, 5).map((category) => {
                const solved = solvedProblems[category.key] || 0;
                const total = category.total;
                const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

                return (
                  <div
                    key={category.key}
                    onMouseEnter={() => setHoveredCategory(category.key)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => setSelectedCategory(selectedCategory === category.key ? 'overall' : category.key)}
                    className="flex-1 flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: hoveredCategory === category.key ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                      borderColor: hoveredCategory === category.key ? category.color : 'var(--border-color)',
                      borderWidth: hoveredCategory === category.key ? '2px' : '1px',
                      height: '60px', // Fixed height for consistent sizing
                      boxShadow: hoveredCategory === category.key ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: category.color,
                          boxShadow: hoveredCategory === category.key ? `0 0 8px ${category.color}` : 'none'
                        }}
                      />
                      <div className="text-left min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate" style={{ color: category.color }}>
                          {category.label}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {solved}/{total}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Attempting count - No hover functionality, responsive */}
              <div
                className="flex-1 flex items-center justify-between p-2 sm:p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  height: '60px', // Fixed height for consistent sizing
                  opacity: 0.8
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <div className="text-left min-w-0">
                    <div className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--text-muted)' }}>
                      Attempting
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {solvedProblems.attempting} tried
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  // Helper function to calculate last month streak
  function calculateLastMonthStreak(weeks) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let maxStreak = 0;
    let currentStreak = 0;

    weeks.flat().forEach(day => {
      if (!day) return; // Skip null days
      const dayDate = new Date(day.date);

      if (dayDate >= oneMonthAgo && dayDate <= now) {
        if (day.submissions > 0) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
    });

    return maxStreak;
  }

  return (
    <div className={`space-y-6 ${darkMode ? 'dark' : ''}`} style={{ minHeight: '100vh' }}>
      {/* Header with Share Button */}
      <div className="leet-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {userInfo?.firstName || handle}'s Profile
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {userInfo?.country ? `${userInfo.country} • ` : ''}
              Rank: {userInfo?.rank || 'Unrated'} •
              Rating: {userInfo?.rating || 'N/A'}
            </p>
          </div>
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Profile
          </button>
        </div>
      </div>

      {/* Problem Difficulty Breakdown - LeetCode Style */}
      <div className="leet-card">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {selectedCategory === 'overall' ? 'Problems Solved' : `Problems: ${selectedCategory}`}
          </h3>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {solvedProblems.allTime} solved, {totalProblemsAvailable} total available
          </div>
        </div>

        <LeetCodeProgress />
      </div>

      {/* Submission Heatmap - Enhanced LeetCode Style */}
      <div className="leet-card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {totalSubmissions} submissions in the past one year
          </h3>
          <div className="flex items-center gap-4 text-sm flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span>Total active days: <strong style={{ color: 'var(--text-primary)' }}>{activeDays}</strong></span>
            <span>Max streak: <strong style={{ color: 'var(--text-primary)' }}>{maxStreak}</strong></span>
            <span>Current streak: <strong style={{ color: 'var(--text-primary)' }}>{currentStreak}</strong></span>
          </div>
        </div>

        <div className="leetcode-heatmap-container">
          {/* Heatmap Legend */}
          <div className="heatmap-legend">
            <span className="legend-text">Less</span>
            <div className="legend-colors">
              <div className="legend-square level-0" title="No submissions"></div>
              <div className="legend-square level-1" title="1-2 submissions"></div>
              <div className="legend-square level-2" title="3-4 submissions"></div>
              <div className="legend-square level-3" title="5-6 submissions"></div>
              <div className="legend-square level-4" title="7+ submissions"></div>
            </div>
            <span className="legend-text">More</span>
          </div>

          {/* SVG Heatmap */}
          <div
            className="heatmap-grid-wrapper"
            ref={setHeatmapScrollRef}
          >
            {generateSVGHeatmap()}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedHeatmapDay && selectedHeatmapDay.submissionDetails.length > 0 && (
          <div className="mt-4 p-4 border rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Submissions on {selectedHeatmapDay.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h4>
            <div className="space-y-1 max-h-32 overflow-auto">
              {selectedHeatmapDay.submissionDetails.slice(0, 10).map((sub, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-primary)' }}>{sub.problem.name}</span>
                  <span style={{ color: getVerdictColor(sub.verdict) }}>{sub.verdict}</span>
                </div>
              ))}
              {selectedHeatmapDay.submissionDetails.length > 10 && (
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  +{selectedHeatmapDay.submissionDetails.length - 10} more submissions
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {solvedProblems.allTime}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              problems<br />solved for all time
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {solvedProblems.lastYear}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              problems<br />solved for the last year
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {solvedProblems.lastMonth}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              problems<br />solved for the last month
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {maxStreak}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              days<br />in a row max.
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {lastYearMaxStreak}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              days<br />in a row for the last year
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {lastMonthStreak}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              day<br />in a row for the last month
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions with Search and Pagination */}
      <div className="leet-card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Submissions</h3>
          <div className="flex items-center gap-4">
            {/* Search Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-8 pr-4 py-2 border rounded-lg text-sm w-64"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
              <svg
                className="absolute left-2 top-2.5 h-4 w-4"
                style={{ color: 'var(--text-muted)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {filteredSubmissions.length} of {subs.length} submissions
            </div>
          </div>
        </div>

        {loading && <HeatmapSkeleton />}

        <div className="space-y-1 max-h-96 overflow-auto">
          {paginatedSubmissions.map(s => (
            <div key={s.id} className="submission-item">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <a
                    href={getProblemUrl(s.contestId, s.index)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="submission-title hover:underline truncate"
                  >
                    {s.contestId && s.index ? `${s.contestId}${s.index}. ` : ''}{s.name}
                  </a>
                  <a
                    href={getSubmissionUrl(s.contestId, s.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs opacity-60 hover:opacity-100 flex-shrink-0"
                    title="View submission"
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div className="submission-time flex items-center gap-2 text-xs sm:text-sm">
                  {s.rating && (
                    <span
                      className="font-medium"
                      style={{ color: getDifficultyColor(s.rating) }}
                    >
                      {s.rating}
                    </span>
                  )}
                  <span>• {s.language}</span>
                  <span className="hidden sm:inline">• {s.time}</span>
                </div>
              </div>
              <div
                className="text-sm font-semibold ml-4 flex-shrink-0"
                style={{ color: getVerdictColor(s.verdict) }}
              >
                {s.verdict}
              </div>
            </div>
          ))}
          {!loading && paginatedSubmissions.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              {searchFilter ? 'No submissions found matching your search.' : 'No recent submissions found.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add custom CSS animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes slideIn {
          from { width: 0%; }
          to { width: var(--target-width); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
