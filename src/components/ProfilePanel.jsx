import React, { useEffect, useState } from "react";
import { fetchFromCodeforces } from "../utils/api";
import { ProfileSkeleton } from "./LoadingSpinner";

/**
 * Fetches user.info for the handle and displays a profile card
 */
export default function ProfilePanel({ handle, onProfileData, setShareModalOpen }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setError(null);
    setProfile(null);
    setProfile(null);
    fetchFromCodeforces(`/user.info?handles=${encodeURIComponent(handle)}`)
      .then(json => {
        if (json.status === 'OK') {
          const profileData = json.result[0];
          setProfile(profileData);
          // Pass profile data to parent component if callback provided
          if (onProfileData) {
            onProfileData(profileData);
          }
        } else {
          setError(json.comment || 'Failed to load profile');
        }
      })
      .catch(err => setError(err.message || 'Network error'))
      .finally(() => setLoading(false));
  }, [handle, onProfileData]);

  function badgeClass(rank) {
    if (!rank) return 'bg-gray-300 text-gray-800';
    rank = rank.toLowerCase();
    if (rank.includes('legendary')) return 'bg-yellow-400 text-black';
    if (rank.includes('grandmaster')) return 'bg-red-600 text-white';
    if (rank.includes('master')) return 'bg-indigo-600 text-white';
    if (rank.includes('candidate')) return 'bg-purple-600 text-white';
    if (rank.includes('expert')) return 'bg-pink-500 text-white';
    if (rank.includes('pupil')) return 'bg-green-600 text-white';
    return 'bg-gray-300 text-gray-800';
  }

  return (
    <div>
      {loading && <ProfileSkeleton />}
      {error && (
        <div className="leet-card">
          <div className="text-sm" style={{ color: 'var(--hard-color)' }}>{error}</div>
        </div>
      )}
      {profile && !loading && (
        <div className="leet-card">
          <div className="profile-content">
            <div className="flex items-center gap-4">
              <img
                src={profile.titlePhoto || `https:${profile.avatar || ''}` || `https://codeforces.org/avatars/${profile.handle}.jpg`}
                alt="avatar"
                className="profile-avatar"
              />
              <div>
                <div className="profile-name">{profile.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile.handle}</div>
                <div className="profile-username">@{profile.handle}</div>
                <div className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-medium ${badgeClass(profile.rank)}`}>
                  {profile.rank ? `${profile.rank} • ${profile.rating ?? profile.maxRating ?? '—'}` : 'Unrated'}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Rating" value={profile.rating ?? '—'} />
              <Stat label="Max Rating" value={profile.maxRating ?? '—'} />
              <Stat label="Contribution" value={profile.contribution ?? '—'} />
              <Stat label="Friends" value={profile.friendOfCount ?? '—'} />
            </div>

            <div className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Organization:</strong> {profile.organization || '—'}</div>
              <div className="mt-2 flex flex-col gap-2">
                <a
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                  href={`https://codeforces.com/profile/${profile.handle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on Codeforces →
                </a>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-left"
                >
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {!loading && !profile && !error && (
        <div className="leet-card">
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Search a Codeforces handle to see profile details.
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      className="p-3 rounded-md transition-colors hover:opacity-80"
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
