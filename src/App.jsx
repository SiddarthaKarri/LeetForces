import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import { GitCompare, Target, BookOpen, Download, QrCode, Users, Settings, Home } from "lucide-react";
import ProfilePanel from "./components/ProfilePanel";
import RatingChart from "./components/RatingChart";
import SubmissionsPanel from "./components/SubmissionsPanel";
import ProblemsPanel from "./components/ProblemsPanel";
import LanguageStatsChart from "./components/LanguageStatsChart";
import ProblemTagsCloud from "./components/ProblemTagsCloud";
import DarkModeToggle from "./components/DarkModeToggle";
import ShareModal from "./components/ShareModal";
import CompareUsersPage from "./components/CompareUsersPage";
import GoalsTrackerPage from "./components/GoalsTrackerPage";
import RecommendationsPage from "./components/RecommendationsPage";
import ExportPage from "./components/ExportPage";
import ThemesPage from "./components/ThemesPage";
import useCodeforceStats from "./hooks/useCodeforceStats";
import LandingPage from "./components/LandingPage";
import { BASE_URL } from "./config";

// Main Dashboard Component
function Dashboard({ handle, submittedHandle, languageStats, tagStats, submissions, onProfileData, setShareModalOpen }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 mt-[120px] md:mt-[100px]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Profile, Languages & Tags */}
        <div className="lg:col-span-1 space-y-6">
          <ProfilePanel handle={submittedHandle} onProfileData={onProfileData} setShareModalOpen={setShareModalOpen} />
          <LanguageStatsChart languageStats={languageStats} />
          <ProblemTagsCloud tagStats={tagStats} />
        </div>

        {/* Middle Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <RatingChart handle={submittedHandle} />
          <SubmissionsPanel handle={submittedHandle} />
        </div>

        {/* Right Column - Problems Panel (full height) */}
        <div className="lg:col-span-1">
          <ProblemsPanel handle={submittedHandle} submissions={submissions} />
        </div>
      </div>
    </div>
  );
}

// Wrapper component to handle username parameter from URL
function DashboardWithParams({ handle, setHandle, submittedHandle, setSubmittedHandle, languageStats, tagStats, submissions, onProfileData, setShareModalOpen, usernameOverride }) {
  const params = useParams();
  // Use override if provided, otherwise get from params
  const username = usernameOverride || params.username;

  useEffect(() => {
    if (username && username !== submittedHandle) {
      console.log('Setting username from URL:', username);
      setHandle(username);
      setSubmittedHandle(username);
    }
  }, [username, setHandle, setSubmittedHandle, submittedHandle]);

  // Get language and tag statistics for the URL username
  const { languageStats: urlLanguageStats, tagStats: urlTagStats, submissions: urlSubmissions } = useCodeforceStats(username || submittedHandle);

  return (
    <Dashboard
      handle={handle}
      submittedHandle={username || submittedHandle}
      languageStats={urlLanguageStats}
      tagStats={urlTagStats}
      submissions={urlSubmissions}
      onProfileData={onProfileData}
      setShareModalOpen={setShareModalOpen}
    />
  );
}

// Smart Route Component to handle /@username, /username, etc.
function SmartRedirect({ handle, setHandle, submittedHandle, setSubmittedHandle, languageStats, tagStats, submissions, onProfileData, setShareModalOpen }) {
  const { slug } = useParams();

  if (!slug) return <Navigate to="/" replace />;

  let username = slug;
  // If slug starts with @, remove it
  if (slug.startsWith('@')) {
    username = slug.slice(1);
  }

  // If it looks like a username, render dashboard
  return (
    <DashboardWithParams
      handle={handle}
      setHandle={setHandle}
      submittedHandle={submittedHandle}
      setSubmittedHandle={setSubmittedHandle}
      languageStats={languageStats}
      tagStats={tagStats}
      submissions={submissions}
      onProfileData={onProfileData}
      setShareModalOpen={setShareModalOpen}
      usernameOverride={username}
    />
  );
}

// Enhanced Navigation Component
function Navigation({ handle, setHandle, onSearch, setShareModalOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { path: handle ? `/user/${handle}` : '/', icon: Home, label: 'Dashboard', color: 'text-blue-500' },
    { path: '/compare', icon: GitCompare, label: 'Compare', color: 'text-purple-500' },
    { path: '/goals', icon: Target, label: 'Goals', color: 'text-green-500' },
    { path: '/recommendations', icon: BookOpen, label: 'Recommendations', color: 'text-orange-500' },
    { path: '/export', icon: Download, label: 'Export', color: 'text-indigo-500' },
    { path: '/themes', icon: Settings, label: 'Themes', color: 'text-pink-500' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (handle.trim()) {
      const trimmedHandle = handle.trim();
      // Use React Router navigation instead of window.history
      navigate(`/user/${encodeURIComponent(trimmedHandle)}`);
      onSearch(trimmedHandle);
    }
  };

  // Hide navigation and footer on Landing Page
  const isLandingPage = location.pathname === '/' || location.pathname === BASE_URL || location.pathname === `${BASE_URL}/`;

  if (isLandingPage) {
    return null;
  }

  return (
    <header className="leet-card fixed top-0 left-0 right-0 z-40 transition-all duration-300" style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '0',
      borderBottom: '1px solid var(--border-color)',
      margin: 0,
      backdropFilter: 'blur(12px)',
    }}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between h-[60px]">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="text-lg font-extrabold text-amber-400">CF</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>LeetForces</div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                >
                  <Icon size={16} className={isActive ? 'text-amber-600 dark:text-amber-400' : item.color} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="px-2 py-1 rounded-md outline-none w-32 md:w-44 border text-sm transition-all focus:ring-2 focus:ring-amber-400/50"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
              placeholder="Handle"
            />
            <button className="px-2 py-1 bg-amber-400 rounded-md font-medium text-black hover:bg-amber-500 transition-colors text-sm">
              <span className="hidden md:inline">Search</span>
              <span className="md:hidden">Go</span>
            </button>
          </form>
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
            title="Share profile"
          >
            <QrCode size={14} />
            <span className="hidden md:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 min-w-[60px] px-2 py-1 rounded-lg transition-all duration-200 ${isActive
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                  <Icon size={16} />
                  <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

// Footer Component with conditional rendering
function Footer() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === BASE_URL || location.pathname === `${BASE_URL}/`;

  if (isLandingPage) return null;

  return (
    <footer className="max-w-6xl mx-auto px-4 pb-8 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
      <div className="mb-2">
        Built with Codeforces public API · UI inspired by LeetCode
      </div>
      <div className="flex justify-center items-center gap-4">
        <span>By <a href="https://github.com/SiddarthaKarri" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Siddartha Karri</a></span>
        <span>•</span>
        <a href="https://siddartha-karri.vercel.app/" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">Portfolio</a>
        <span>•</span>
        <a href="https://www.linkedin.com/in/siddarthakarri/" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">LinkedIn</a>
        <span>•</span>
        <a href="https://github.com/SiddarthaKarri" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">GitHub</a>
      </div>
    </footer>
  );
}

export default function App() {
  // theme - default to dark if not set
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem('leetforces-theme');
    return savedTheme !== 'light'; // Default to dark (true) if 'dark' or null
  });

  useEffect(() => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem('leetforces-theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('leetforces-theme', 'light');
    }
  }, [dark]);

  // Extract username from URL if present (e.g., /@username or /user/username)
  const getInitialHandle = () => {
    const path = window.location.pathname;
    // Remove base path if present
    // BASE_URL is now dynamic, so we just check if path starts with it
    const relativePath = (BASE_URL && path.startsWith(BASE_URL)) ? path.slice(BASE_URL.length) : path;

    if (relativePath.startsWith('/@')) {
      return decodeURIComponent(relativePath.slice(2)); // Remove /@ prefix
    } else if (relativePath.startsWith('/user/')) {
      return decodeURIComponent(relativePath.slice(6)); // Remove /user/ prefix
    }
    return 'tourist'; // Default handle
  };

  // handle input
  const [handle, setHandle] = useState(getInitialHandle());
  const [submittedHandle, setSubmittedHandle] = useState(getInitialHandle());

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Get language and tag statistics using custom hook
  const { languageStats, tagStats, submissions } = useCodeforceStats(submittedHandle);

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const newHandle = getInitialHandle();
      setHandle(newHandle);
      setSubmittedHandle(newHandle);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function onSearch(trimmedHandle) {
    setSubmittedHandle(trimmedHandle);
  }

  return (
    <Router basename={BASE_URL}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <Navigation
          handle={handle}
          setHandle={setHandle}
          onSearch={onSearch}
          setShareModalOpen={setShareModalOpen}
        />

        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Standard user route */}
          <Route path="/user/:username" element={
            <DashboardWithParams
              handle={handle}
              setHandle={setHandle}
              submittedHandle={submittedHandle}
              setSubmittedHandle={setSubmittedHandle}
              languageStats={languageStats}
              tagStats={tagStats}
              submissions={submissions}
              onProfileData={setProfileData}
              setShareModalOpen={setShareModalOpen}
            />
          } />

          {/* Static Routes */}
          <Route path="/compare" element={<CompareUsersPage />} />
          <Route path="/goals" element={<GoalsTrackerPage handle={submittedHandle} />} />
          <Route path="/recommendations" element={<RecommendationsPage handle={submittedHandle} />} />
          <Route path="/export" element={<ExportPage handle={submittedHandle} profileData={profileData} />} />
          <Route path="/themes" element={<ThemesPage darkMode={dark} setDarkMode={setDark} />} />

          {/* Catch-all for /@username or just /username */}
          <Route path="/:slug" element={
            <SmartRedirect
              handle={handle}
              setHandle={setHandle}
              submittedHandle={submittedHandle}
              setSubmittedHandle={setSubmittedHandle}
              languageStats={languageStats}
              tagStats={tagStats}
              submissions={submissions}
              onProfileData={setProfileData}
              setShareModalOpen={setShareModalOpen}
            />
          } />

          {/* Global catch-all for other paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />

        {/* Share Modal */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          username={submittedHandle}
          profileData={profileData}
        />
      </div>
    </Router>
  );
}
