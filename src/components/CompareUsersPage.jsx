import React, { useState, useEffect } from 'react';
import { Search, Users, Trophy, Calendar, Code, TrendingUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

export default function CompareUsersPage() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [user1Data, setUser1Data] = useState(null);
  const [user2Data, setUser2Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUserData = async (handle) => {
    try {
      const [userResponse, submissionsResponse] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
        fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`)
      ]);

      const userData = await userResponse.json();
      const submissionsData = await submissionsResponse.json();

      if (userData.status !== 'OK' || submissionsData.status !== 'OK') {
        throw new Error(`User ${handle} not found`);
      }

      const user = userData.result[0];
      const submissions = submissionsData.result;

      // Calculate statistics
      const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
      const uniqueProblems = new Set(acceptedSubmissions.map(sub => `${sub.problem.contestId}-${sub.problem.index}`));
      
      const difficultyBreakdown = {
        '800-1200': 0,
        '1201-1600': 0,
        '1601-2000': 0,
        '2001-2400': 0,
        '2401+': 0
      };

      acceptedSubmissions.forEach(sub => {
        const rating = sub.problem.rating;
        if (rating) {
          if (rating >= 800 && rating <= 1200) difficultyBreakdown['800-1200']++;
          else if (rating >= 1201 && rating <= 1600) difficultyBreakdown['1201-1600']++;
          else if (rating >= 1601 && rating <= 2000) difficultyBreakdown['1601-2000']++;
          else if (rating >= 2001 && rating <= 2400) difficultyBreakdown['2001-2400']++;
          else if (rating > 2400) difficultyBreakdown['2401+']++;
        }
      });

      const languageStats = {};
      acceptedSubmissions.forEach(sub => {
        const lang = sub.programmingLanguage;
        languageStats[lang] = (languageStats[lang] || 0) + 1;
      });

      return {
        ...user,
        totalSolved: uniqueProblems.size,
        totalSubmissions: submissions.length,
        difficultyBreakdown,
        languageStats,
        acceptanceRate: submissions.length > 0 ? (acceptedSubmissions.length / submissions.length * 100) : 0
      };
    } catch (err) {
      throw new Error(`Failed to fetch data for ${handle}: ${err.message}`);
    }
  };

  const handleCompare = async () => {
    if (!user1.trim() || !user2.trim()) {
      setError('Please enter both usernames');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const [data1, data2] = await Promise.all([
        fetchUserData(user1.trim()),
        fetchUserData(user2.trim())
      ]);
      
      setUser1Data(data1);
      setUser2Data(data2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyChartData = () => {
    if (!user1Data || !user2Data) return [];
    
    return Object.keys(user1Data.difficultyBreakdown).map(difficulty => ({
      difficulty,
      [user1Data.handle]: user1Data.difficultyBreakdown[difficulty],
      [user2Data.handle]: user2Data.difficultyBreakdown[difficulty]
    }));
  };

  const getRadarChartData = () => {
    if (!user1Data || !user2Data) return [];
    
    const maxValues = {
      'Total Solved': Math.max(user1Data.totalSolved, user2Data.totalSolved),
      'Rating': Math.max(user1Data.rating || 0, user2Data.rating || 0),
      'Max Rating': Math.max(user1Data.maxRating || 0, user2Data.maxRating || 0),
      'Acceptance Rate': 100,
      'Submissions': Math.max(user1Data.totalSubmissions, user2Data.totalSubmissions)
    };

    return [
      {
        metric: 'Total Solved',
        [user1Data.handle]: (user1Data.totalSolved / maxValues['Total Solved']) * 100,
        [user2Data.handle]: (user2Data.totalSolved / maxValues['Total Solved']) * 100
      },
      {
        metric: 'Rating',
        [user1Data.handle]: ((user1Data.rating || 0) / maxValues['Rating']) * 100,
        [user2Data.handle]: ((user2Data.rating || 0) / maxValues['Rating']) * 100
      },
      {
        metric: 'Max Rating',
        [user1Data.handle]: ((user1Data.maxRating || 0) / maxValues['Max Rating']) * 100,
        [user2Data.handle]: ((user2Data.maxRating || 0) / maxValues['Max Rating']) * 100
      },
      {
        metric: 'Acceptance Rate',
        [user1Data.handle]: user1Data.acceptanceRate,
        [user2Data.handle]: user2Data.acceptanceRate
      }
    ];
  };

  const getRankStyle = (rank) => {
    const rankColors = {
      'newbie': 'text-gray-600',
      'pupil': 'text-green-600',
      'specialist': 'text-cyan-600',
      'expert': 'text-blue-600',
      'candidate master': 'text-purple-600',
      'master': 'text-orange-600',
      'international master': 'text-orange-600',
      'grandmaster': 'text-red-600',
      'international grandmaster': 'text-red-600',
      'legendary grandmaster': 'text-red-800'
    };
    return rankColors[rank?.toLowerCase()] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="text-purple-500" size={32} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Compare Coders
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Side-by-side comparison of Codeforces profiles
          </p>
        </div>

        {/* Search Section */}
        <div className="leet-card mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                First User
              </label>
              <input
                type="text"
                value={user1}
                onChange={(e) => setUser1(e.target.value)}
                placeholder="Enter handle (e.g., tourist)"
                className="w-full px-4 py-2 rounded-lg border transition-all focus:ring-2 focus:ring-purple-500/50"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div className="hidden md:flex items-center justify-center px-4 py-2">
              <span className="text-2xl font-bold text-purple-500">VS</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Second User
              </label>
              <input
                type="text"
                value={user2}
                onChange={(e) => setUser2(e.target.value)}
                placeholder="Enter handle (e.g., jiangly)"
                className="w-full px-4 py-2 rounded-lg border transition-all focus:ring-2 focus:ring-purple-500/50"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={18} />
              {loading ? 'Comparing...' : 'Compare'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {user1Data && user2Data && (
          <div className="space-y-8">
            {/* Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[user1Data, user2Data].map((userData, index) => (
                <div key={index} className="leet-card">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={userData.avatar || userData.titlePhoto}
                      alt={userData.handle}
                      className="w-16 h-16 rounded-full border-3"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {userData.firstName} {userData.lastName}
                      </h3>
                      <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {userData.handle}
                      </p>
                      <p className={`text-sm font-medium ${getRankStyle(userData.rank)}`}>
                        {userData.rank}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="text-2xl font-bold text-blue-500">{userData.rating || 'N/A'}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Current Rating</div>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="text-2xl font-bold text-green-500">{userData.maxRating || 'N/A'}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Max Rating</div>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="text-2xl font-bold text-purple-500">{userData.totalSolved}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Problems Solved</div>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="text-2xl font-bold text-orange-500">{userData.acceptanceRate.toFixed(1)}%</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Acceptance Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Difficulty Breakdown Chart */}
            <div className="leet-card">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Trophy className="text-yellow-500" size={24} />
                Problems Solved by Difficulty
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getDifficultyChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="difficulty" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey={user1Data.handle} fill="#8884d8" />
                  <Bar dataKey={user2Data.handle} fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart Comparison */}
            <div className="leet-card">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Zap className="text-purple-500" size={24} />
                Overall Performance Comparison
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={getRadarChartData()}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Radar
                    name={user1Data.handle}
                    dataKey={user1Data.handle}
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Radar
                    name={user2Data.handle}
                    dataKey={user2Data.handle}
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="leet-card text-center">
                <TrendingUp className="mx-auto mb-4 text-blue-500" size={32} />
                <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Higher Rating
                </h4>
                <p className="text-2xl font-bold text-blue-500">
                  {(user1Data.rating || 0) > (user2Data.rating || 0) ? user1Data.handle : user2Data.handle}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {Math.max(user1Data.rating || 0, user2Data.rating || 0)} rating
                </p>
              </div>
              
              <div className="leet-card text-center">
                <Code className="mx-auto mb-4 text-green-500" size={32} />
                <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  More Problems Solved
                </h4>
                <p className="text-2xl font-bold text-green-500">
                  {user1Data.totalSolved > user2Data.totalSolved ? user1Data.handle : user2Data.handle}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {Math.max(user1Data.totalSolved, user2Data.totalSolved)} problems
                </p>
              </div>
              
              <div className="leet-card text-center">
                <Trophy className="mx-auto mb-4 text-purple-500" size={32} />
                <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Better Acceptance Rate
                </h4>
                <p className="text-2xl font-bold text-purple-500">
                  {user1Data.acceptanceRate > user2Data.acceptanceRate ? user1Data.handle : user2Data.handle}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {Math.max(user1Data.acceptanceRate, user2Data.acceptanceRate).toFixed(1)}% acceptance
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
