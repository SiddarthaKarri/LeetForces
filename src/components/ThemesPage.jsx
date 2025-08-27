import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Eye, Download, Upload, Trash2, Star } from 'lucide-react';

export default function ThemesPage() {
  const [currentTheme, setCurrentTheme] = useState('system');
  const [customThemes, setCustomThemes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTheme, setNewTheme] = useState({
    name: '',
    colors: {
      'bg-primary': '#ffffff',
      'bg-secondary': '#f8fafc',
      'bg-tertiary': '#f1f5f9',
      'text-primary': '#1e293b',
      'text-secondary': '#475569',
      'text-muted': '#64748b',
      'border-color': '#e2e8f0',
      'accent-color': '#3b82f6'
    }
  });

  const predefinedThemes = [
    {
      id: 'system',
      name: 'System Default',
      icon: Monitor,
      description: 'Follows your system preferences',
      colors: {}
    },
    {
      id: 'light',
      name: 'Light Mode',
      icon: Sun,
      description: 'Clean and bright interface',
      colors: {
        'bg-primary': '#ffffff',
        'bg-secondary': '#f8fafc',
        'bg-tertiary': '#f1f5f9',
        'text-primary': '#1e293b',
        'text-secondary': '#475569',
        'text-muted': '#64748b',
        'border-color': '#e2e8f0',
        'accent-color': '#3b82f6'
      }
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      icon: Moon,
      description: 'Easy on the eyes',
      colors: {
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'bg-tertiary': '#334155',
        'text-primary': '#f1f5f9',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
        'border-color': '#475569',
        'accent-color': '#60a5fa'
      }
    },
    {
      id: 'codeforces',
      name: 'Codeforces Classic',
      icon: Star,
      description: 'Inspired by Codeforces colors',
      colors: {
        'bg-primary': '#ffffff',
        'bg-secondary': '#f7f9fc',
        'bg-tertiary': '#eef2f7',
        'text-primary': '#2c3e50',
        'text-secondary': '#34495e',
        'text-muted': '#7f8c8d',
        'border-color': '#bdc3c7',
        'accent-color': '#3498db'
      }
    },
    {
      id: 'hacker',
      name: 'Hacker Terminal',
      icon: Monitor,
      description: 'Green terminal vibes',
      colors: {
        'bg-primary': '#0d1117',
        'bg-secondary': '#161b22',
        'bg-tertiary': '#21262d',
        'text-primary': '#00ff00',
        'text-secondary': '#7dff7d',
        'text-muted': '#4d9950',
        'border-color': '#30363d',
        'accent-color': '#00ff00'
      }
    },
    {
      id: 'purple',
      name: 'Purple Dreams',
      icon: Palette,
      description: 'Purple gradient theme',
      colors: {
        'bg-primary': '#faf5ff',
        'bg-secondary': '#f3e8ff',
        'bg-tertiary': '#e9d5ff',
        'text-primary': '#581c87',
        'text-secondary': '#7c3aed',
        'text-muted': '#a855f7',
        'border-color': '#c4b5fd',
        'accent-color': '#8b5cf6'
      }
    },
    {
      id: 'ocean',
      name: 'Ocean Blue',
      icon: Palette,
      description: 'Calm ocean colors',
      colors: {
        'bg-primary': '#f0f9ff',
        'bg-secondary': '#e0f2fe',
        'bg-tertiary': '#bae6fd',
        'text-primary': '#0c4a6e',
        'text-secondary': '#0369a1',
        'text-muted': '#0284c7',
        'border-color': '#7dd3fc',
        'accent-color': '#0ea5e9'
      }
    }
  ];

  // Load saved theme and custom themes from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('selected-theme') || 'system';
    const savedCustomThemes = localStorage.getItem('custom-themes');
    
    setCurrentTheme(savedTheme);
    if (savedCustomThemes) {
      setCustomThemes(JSON.parse(savedCustomThemes));
    }
    
    applyTheme(savedTheme);
  }, []);

  // Save custom themes to localStorage
  useEffect(() => {
    localStorage.setItem('custom-themes', JSON.stringify(customThemes));
  }, [customThemes]);

  const applyTheme = (themeId) => {
    const theme = predefinedThemes.find(t => t.id === themeId) || 
                  customThemes.find(t => t.id === themeId);
    
    if (!theme || themeId === 'system') {
      // Remove custom CSS variables to fall back to system
      Object.keys(newTheme.colors).forEach(key => {
        document.documentElement.style.removeProperty(`--${key}`);
      });
      
      if (themeId === 'system') {
        // Apply system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          const darkTheme = predefinedThemes.find(t => t.id === 'dark');
          Object.entries(darkTheme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
          });
        }
      }
      return;
    }

    // Apply theme colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  };

  const handleThemeSelect = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('selected-theme', themeId);
    applyTheme(themeId);
  };

  const handleCreateTheme = () => {
    if (!newTheme.name) return;

    const theme = {
      id: `custom-${Date.now()}`,
      name: newTheme.name,
      icon: Palette,
      description: 'Custom theme',
      colors: { ...newTheme.colors },
      custom: true
    };

    setCustomThemes([...customThemes, theme]);
    setShowCreateModal(false);
    setNewTheme({
      name: '',
      colors: {
        'bg-primary': '#ffffff',
        'bg-secondary': '#f8fafc',
        'bg-tertiary': '#f1f5f9',
        'text-primary': '#1e293b',
        'text-secondary': '#475569',
        'text-muted': '#64748b',
        'border-color': '#e2e8f0',
        'accent-color': '#3b82f6'
      }
    });
  };

  const deleteCustomTheme = (themeId) => {
    setCustomThemes(customThemes.filter(t => t.id !== themeId));
    if (currentTheme === themeId) {
      handleThemeSelect('system');
    }
  };

  const exportTheme = (theme) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.name.replace(/\s+/g, '_').toLowerCase()}_theme.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importTheme = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target.result);
        theme.id = `custom-${Date.now()}`;
        theme.custom = true;
        theme.icon = Palette;
        
        setCustomThemes([...customThemes, theme]);
      } catch (err) {
        alert('Invalid theme file');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const previewTheme = (theme) => {
    applyTheme(theme.id);
  };

  const allThemes = [...predefinedThemes, ...customThemes];

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="text-pink-500" size={32} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Themes & Customization
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Personalize your experience with beautiful themes
          </p>
        </div>

        {/* Theme Controls */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium flex items-center gap-2"
          >
            <Palette size={20} />
            Create Custom Theme
          </button>
          
          <label className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 cursor-pointer">
            <Upload size={20} />
            Import Theme
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
          </label>
        </div>

        {/* Current Theme Info */}
        <div className="leet-card mb-8 text-center">
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Current Theme
          </h3>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-color)' }}>
            {allThemes.find(t => t.id === currentTheme)?.name || 'Unknown'}
          </p>
        </div>

        {/* Predefined Themes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Star className="text-yellow-500" size={24} />
            Built-in Themes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {predefinedThemes.map((theme) => {
              const IconComponent = theme.icon;
              const isActive = currentTheme === theme.id;
              
              return (
                <div
                  key={theme.id}
                  className={`leet-card cursor-pointer transition-all hover:shadow-lg ${
                    isActive ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent size={24} style={{ color: 'var(--accent-color)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {theme.name}
                    </h3>
                  </div>
                  
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    {theme.description}
                  </p>
                  
                  {theme.id !== 'system' && (
                    <div className="flex gap-2 mb-4">
                      {Object.values(theme.colors).slice(0, 6).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previewTheme(theme);
                      }}
                      className="flex-1 px-3 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                    >
                      <Eye size={14} className="inline mr-1" />
                      Preview
                    </button>
                    {isActive && (
                      <div className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                        Active
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Themes */}
        {customThemes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Palette className="text-purple-500" size={24} />
              Custom Themes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {customThemes.map((theme) => {
                const isActive = currentTheme === theme.id;
                
                return (
                  <div
                    key={theme.id}
                    className={`leet-card cursor-pointer transition-all hover:shadow-lg ${
                      isActive ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Palette size={24} style={{ color: 'var(--accent-color)' }} />
                      <h3 className="font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
                        {theme.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomTheme(theme.id);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                    
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      Custom theme
                    </p>
                    
                    <div className="flex gap-2 mb-4">
                      {Object.values(theme.colors).slice(0, 6).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportTheme(theme);
                        }}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                      >
                        <Download size={14} className="inline mr-1" />
                        Export
                      </button>
                      {isActive && (
                        <div className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
                          Active
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Theme Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="leet-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Create Custom Theme
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Theme Name
                  </label>
                  <input
                    type="text"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme({...newTheme, name: e.target.value})}
                    placeholder="e.g., My Awesome Theme"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(newTheme.colors).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1 capitalize" style={{ color: 'var(--text-secondary)' }}>
                        {key.replace('-', ' ')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => setNewTheme({
                            ...newTheme,
                            colors: { ...newTheme.colors, [key]: e.target.value }
                          })}
                          className="w-12 h-10 rounded border"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setNewTheme({
                            ...newTheme,
                            colors: { ...newTheme.colors, [key]: e.target.value }
                          })}
                          className="flex-1 px-3 py-2 rounded border font-mono text-sm"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => previewTheme({ colors: newTheme.colors })}
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    Preview Theme
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTheme({
                      name: '',
                      colors: {
                        'bg-primary': '#ffffff',
                        'bg-secondary': '#f8fafc',
                        'bg-tertiary': '#f1f5f9',
                        'text-primary': '#1e293b',
                        'text-secondary': '#475569',
                        'text-muted': '#64748b',
                        'border-color': '#e2e8f0',
                        'accent-color': '#3b82f6'
                      }
                    });
                    // Restore current theme
                    applyTheme(currentTheme);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTheme}
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
                >
                  Create Theme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
