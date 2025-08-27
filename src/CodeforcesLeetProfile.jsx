// Codeforces_LeetProfile_React_Component.jsx
// Single-file React component that recreates a LeetCode-like profile UI for a Codeforces handle.
// Features:
// - Header with avatar, name, rating badge, rank
// - Left column with basic stats (rating, max rating, solved problems estimate)
// - Right column with recent contests (rating history) chart and recent submissions
// - Light / Dark theme toggle
// - Fetches from Codeforces public API
// How to use:
// 1. Create a React app (Vite + React recommended) with Tailwind CSS enabled.
// 2. Save this file as a component and import it in your App.
// 3. Install dependencies: `npm install recharts dayjs`
// 4. Start dev server.

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CodeforcesLeetProfile({ defaultHandle = 'tourist' }) {
  const [handle, setHandle] = useState(defaultHandle);
  const [profile, setProfile] = useState(null);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    fetchAll(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll(h) {
    if (!h) return;
    setLoading(true);
    setError(null);
    setProfile(null);
    setRatingHistory([]);
    setSubmissions([]);
    try {
      const p = await fetchProfile(h);
      setProfile(p);
      const rh = await fetchRatingHistory(h);
      setRatingHistory(rh);
      const subs = await fetchSubmissions(h);
      setSubmissions(subs.slice(0, 40));
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(h) {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(h)}`);
    const json = await res.json();
    if (json.status !== 'OK') throw new Error(json.comment || 'Profile fetch failed');
    return json.result[0];
  }

  async function fetchRatingHistory(h) {
    const res = await fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(h)}`);
    const json = await res.json();
    if (json.status !== 'OK') return [];
    // Map to simple points for chart
    return json.result.map(item => ({
      contestName: item.contestName,
      rank: item.rank,
      rating: item.newRating,
      time: new Date(item.ratingUpdateTimeSeconds * 1000).toISOString().slice(0,10),
    }));
  }

  async function fetchSubmissions(h) {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(h)}&from=1&count=100`);
    const json = await res.json();
    if (json.status !== 'OK') return [];
    return json.result.map(s => ({
      id: s.id,
      verdict: s.verdict,
      problem: s.problem,
      creationTimeSeconds: s.creationTimeSeconds,
      language: s.programmingLanguage,
    }));
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchAll(handle.trim());
  }

  function ratingBadgeColor(rankName) {
    // simplified mapping to resemble CF colors
    if (!rankName) return 'bg-gray-300 text-gray-800';
    if (/legendary/i.test(rankName)) return 'bg-yellow-500 text-black';
    if (/international grandmaster|grandmaster/i.test(rankName)) return 'bg-red-600 text-white';
    if (/master/i.test(rankName)) return 'bg-indigo-600 text-white';
    if (/candidate master/i.test(rankName)) return 'bg-purple-600 text-white';
    if (/expert/i.test(rankName)) return 'bg-pink-500 text-white';
    if (/pupil/i.test(rankName)) return 'bg-green-600 text-white';
    return 'bg-gray-300 text-gray-800';
  }

  return (
    <div className={dark ? 'min-h-screen bg-[#0b1020] text-white font-inter' : 'min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-inter'}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <span className="text-amber-400 font-bold">CF</span>
            <span className="opacity-80">LeetProfile</span>
          </h1>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input value={handle} onChange={(e)=>setHandle(e.target.value)} className="px-3 py-2 rounded-md bg-white/10 focus:bg-white/20 outline-none" placeholder="codeforces handle" />
              <button type="submit" className="px-3 py-2 rounded-md bg-gradient-to-r from-amber-400 to-orange-400 text-black font-semibold">Search</button>
            </form>
            <button onClick={()=>setDark(d=>!d)} className="px-3 py-2 rounded-md bg-white/5">{dark ? 'Light' : 'Dark'}</button>
          </div>
        </div>

        {/* Main card */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Profile Card */}
          <div className="col-span-1 rounded-xl p-6" style={{background: dark ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))' : '#fff', boxShadow: dark ? '0 6px 20px rgba(2,6,23,0.8)' : '0 6px 20px rgba(2,6,23,0.06)'}}>
            {loading && <div className="text-sm opacity-70">Loading...</div>}
            {error && <div className="text-sm text-red-400">{error}</div>}
            {profile && (
              <div>
                <div className="flex items-center gap-4">
                  <img src={profile.titlePhoto || `https://codeforces.org/avatars/${profile.handle}.jpg`} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
                  <div>
                    <div className="text-xl font-semibold">{profile.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile.handle}</div>
                    <div className="text-sm opacity-70">@{profile.handle}</div>
                    <div className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${ratingBadgeColor(profile.rank)}`}>
                      {profile.rank ? `${profile.rank} • ${profile.maxRating || profile.rating || '—'}` : 'Unrated'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Stat label="Rating" value={profile.rating ?? '—'} />
                  <Stat label="Max Rating" value={profile.maxRating ?? '—'} />
                  <Stat label="Contribution" value={profile.contribution ?? '—'} />
                  <Stat label="Friend of" value={profile.friendOfCount ?? '—'} />
                </div>

                <div className="mt-6">
                  <h3 className="text-sm opacity-80 mb-2">About</h3>
                  <p className="text-sm opacity-60 leading-relaxed">{profile.organization || 'No organization provided.'}</p>
                </div>

                <div className="mt-6">
                  <a href={`https://codeforces.com/profile/${profile.handle}`} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 rounded-md bg-white/10">Open on Codeforces</a>
                </div>
              </div>
            )}

            {!profile && !loading && (
              <div className="text-sm opacity-70">Search a Codeforces handle to see LeetCode-like profile UI.
              </div>
            )}
          </div>

          {/* Right: Stats + Chart (span 2 cols) */}
          <div className="col-span-2 space-y-6">
            {/* Rating history chart */}
            <div className="rounded-xl p-6" style={{background: dark ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))' : '#fff'}}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Rating History</h3>
                <div className="text-sm opacity-70">{ratingHistory.length} contests</div>
              </div>

              {ratingHistory.length === 0 ? (
                <div className="text-sm opacity-70">No contest rating history available.</div>
              ) : (
                <div style={{height: 260}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratingHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
                      <XAxis dataKey="time" tick={{fontSize:12}} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rating" strokeWidth={3} dot={false} stroke="#FDBA74" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Recent submissions */}
            <div className="rounded-xl p-6" style={{background: dark ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))' : '#fff'}}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Recent Submissions</h3>
                <div className="text-sm opacity-60">Showing latest {submissions.length}</div>
              </div>

              <div className="space-y-3 max-h-80 overflow-auto">
                {submissions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-md" style={{background: dark ? 'rgba(255,255,255,0.02)' : '#fafafa'}}>
                    <div>
                      <div className="text-sm font-medium">{s.problem.contestId ? `${s.problem.contestId} - ` : ''}{s.problem.name}</div>
                      <div className="text-xs opacity-60">{s.problem.rating ? `${s.problem.rating} • ` : ''}{s.language}</div>
                    </div>
                    <div className="text-sm font-semibold {s.verdict === 'OK' ? 'text-green-400' : 'text-rose-400'}">{s.verdict}</div>
                  </div>
                ))}
                {submissions.length === 0 && <div className="text-sm opacity-70">No submissions found.</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer small hint */}
        <div className="mt-6 text-sm opacity-60">Built with Codeforces public API. This UI is inspired by LeetCode profile pages — for educational and personal use. Do not copy assets from LeetCode directly; recreate styles and themes as needed.</div>
      </div>

      {/* Minimal inline fonts/styles to mimic LeetCode-ish appearance */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        .font-inter{font-family: 'Inter', sans-serif}
      `}</style>
    </div>
  );
}

function Stat({ label, value }){
  return (
    <div className="p-3 rounded-md" style={{background:'transparent'}}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
