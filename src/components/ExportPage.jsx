import React, { useState, useRef } from 'react';
import { Download, Share, FileText, Image, Printer, Copy, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportPage() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const reportRef = useRef(null);

  const fetchUserData = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [userResponse, submissionsResponse] = await Promise.all([
        fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username.trim())}`),
        fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username.trim())}`)
      ]);

      const userData = await userResponse.json();
      const submissionsData = await submissionsResponse.json();

      if (userData.status !== 'OK' || submissionsData.status !== 'OK') {
        throw new Error('User not found');
      }

      const user = userData.result[0];
      const submissions = submissionsData.result;

      // Calculate statistics
      const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
      const uniqueProblems = new Set(acceptedSubmissions.map(sub => `${sub.problem.contestId}-${sub.problem.index}`));

      const languageStats = {};
      acceptedSubmissions.forEach(sub => {
        const lang = sub.programmingLanguage;
        languageStats[lang] = (languageStats[lang] || 0) + 1;
      });

      const topLanguages = Object.entries(languageStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

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

      setUserData({
        ...user,
        totalSolved: uniqueProblems.size,
        totalSubmissions: submissions.length,
        acceptanceRate: submissions.length > 0 ? (acceptedSubmissions.length / submissions.length * 100) : 0,
        topLanguages,
        difficultyBreakdown
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!userData || !reportRef.current) return;

    setExportLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${userData.handle}_codeforces_report.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const generateImage = async () => {
    if (!userData || !reportRef.current) return;

    setExportLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${userData.handle}_codeforces_card.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const shareToSocial = (platform) => {
    if (!userData) return;

    const text = `Check out my Codeforces profile! 🚀\n📊 Rating: ${userData.rating || 'N/A'}\n🎯 Problems Solved: ${userData.totalSolved}\n💯 Acceptance Rate: ${userData.acceptanceRate.toFixed(1)}%`;
    const url = `https://codeforces.com/profile/${userData.handle}`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = () => {
    if (!userData) return;

    const text = `Check out my Codeforces profile! 🚀
📊 Rating: ${userData.rating || 'N/A'}
🎯 Problems Solved: ${userData.totalSolved}
💯 Acceptance Rate: ${userData.acceptanceRate.toFixed(1)}%
🔗 https://codeforces.com/profile/${userData.handle}`;

    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
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
    <div className="min-h-screen pt-[120px] md:pt-28 pb-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Share className="text-green-500" size={32} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Export & Share
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Generate beautiful reports and share your Codeforces achievements
          </p>
        </div>

        {/* Search Section */}
        <div className="leet-card mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Codeforces Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter handle to generate report"
                className="w-full px-4 py-2 rounded-lg border transition-all focus:ring-2 focus:ring-green-500/50"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <button
              onClick={fetchUserData}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <FileText size={18} />
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Export Options */}
        {userData && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={generatePDF}
              disabled={exportLoading}
              className="leet-card text-center hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-50"
            >
              <FileText className="mx-auto mb-3 text-red-500" size={32} />
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Download PDF
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Complete detailed report
              </p>
            </button>

            <button
              onClick={generateImage}
              disabled={exportLoading}
              className="leet-card text-center hover:shadow-lg transition-shadow cursor-pointer disabled:opacity-50"
            >
              <Image className="mx-auto mb-3 text-blue-500" size={32} />
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Save as Image
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Social media ready card
              </p>
            </button>

            <button
              onClick={copyToClipboard}
              className="leet-card text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Copy className="mx-auto mb-3 text-purple-500" size={32} />
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Copy Stats
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Text format for sharing
              </p>
            </button>

            <button
              onClick={() => window.print()}
              className="leet-card text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Printer className="mx-auto mb-3 text-orange-500" size={32} />
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Print Report
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Physical copy
              </p>
            </button>
          </div>
        )}

        {/* Social Sharing */}
        {userData && (
          <div className="leet-card mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Share size={20} />
              Share on Social Media
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Twitter size={18} />
                Twitter
              </button>
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Facebook size={18} />
                Facebook
              </button>
              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Linkedin size={18} />
                LinkedIn
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <Instagram size={18} />
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Report Preview */}
        {userData && (
          <div ref={reportRef} className="bg-white p-8 rounded-lg shadow-lg print:shadow-none">
            {/* Report Header */}
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Codeforces Profile Report</h1>
              <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-6 mb-8">
              <img
                src={userData.avatar || userData.titlePhoto}
                alt={userData.handle}
                className="w-24 h-24 rounded-full border-4 border-gray-200"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-xl text-gray-600 mb-1">@{userData.handle}</p>
                <p className={`text-lg font-semibold ${getRankStyle(userData.rank)}`}>
                  {userData.rank}
                </p>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">{userData.rating || 'N/A'}</div>
                <div className="text-sm text-gray-600">Current Rating</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">{userData.maxRating || 'N/A'}</div>
                <div className="text-sm text-gray-600">Max Rating</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">{userData.totalSolved}</div>
                <div className="text-sm text-gray-600">Problems Solved</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">{userData.acceptanceRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Acceptance Rate</div>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Difficulty Breakdown */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Problems by Difficulty</h3>
                <div className="space-y-3">
                  {Object.entries(userData.difficultyBreakdown).map(([range, count]) => (
                    <div key={range} className="flex justify-between items-center">
                      <span className="text-gray-600">{range}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min((count / userData.totalSolved) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Languages */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Programming Languages</h3>
                <div className="space-y-3">
                  {userData.topLanguages.map(([lang, count], index) => (
                    <div key={lang} className="flex justify-between items-center">
                      <span className="text-gray-600">{lang}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(count / userData.topLanguages[0][1]) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t">
              <p className="text-gray-500 text-sm">
                Profile: https://codeforces.com/profile/{userData.handle}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Report generated by LeetForces Profile Tracker
              </p>
            </div>
          </div>
        )}

        {exportLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating export...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
