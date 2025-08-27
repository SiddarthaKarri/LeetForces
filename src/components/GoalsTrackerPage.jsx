import React, { useState, useEffect } from 'react';
import { Target, Plus, Trophy, Calendar, TrendingUp, Zap, Edit3, Trash2, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GoalsTrackerPage() {
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'rating',
    targetValue: '',
    currentValue: 0,
    deadline: '',
    description: ''
  });

  const goalTypes = [
    { value: 'rating', label: 'Rating Target', icon: Trophy, color: 'text-yellow-500' },
    { value: 'problems', label: 'Problems Solved', icon: Target, color: 'text-blue-500' },
    { value: 'contests', label: 'Contest Participation', icon: Calendar, color: 'text-green-500' },
    { value: 'streak', label: 'Daily Streak', icon: Zap, color: 'text-purple-500' }
  ];

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('codeforces-goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('codeforces-goals', JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.deadline) return;

    const goal = {
      id: Date.now(),
      ...newGoal,
      targetValue: Number(newGoal.targetValue),
      createdAt: new Date().toISOString(),
      progress: [],
      status: 'active'
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      type: 'rating',
      targetValue: '',
      currentValue: 0,
      deadline: '',
      description: ''
    });
    setShowAddModal(false);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      type: goal.type,
      targetValue: goal.targetValue.toString(),
      currentValue: goal.currentValue,
      deadline: goal.deadline,
      description: goal.description || ''
    });
    setShowAddModal(true);
  };

  const handleUpdateGoal = () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.deadline) return;

    const updatedGoals = goals.map(goal => 
      goal.id === editingGoal.id 
        ? {
            ...goal,
            ...newGoal,
            targetValue: Number(newGoal.targetValue)
          }
        : goal
    );

    setGoals(updatedGoals);
    setEditingGoal(null);
    setNewGoal({
      title: '',
      type: 'rating',
      targetValue: '',
      currentValue: 0,
      deadline: '',
      description: ''
    });
    setShowAddModal(false);
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const updateGoalProgress = (goalId, newValue) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const progress = [...goal.progress, {
          date: new Date().toISOString(),
          value: newValue
        }];
        
        const status = newValue >= goal.targetValue ? 'completed' : 
                      new Date() > new Date(goal.deadline) ? 'overdue' : 'active';

        return {
          ...goal,
          currentValue: newValue,
          progress,
          status
        };
      }
      return goal;
    });

    setGoals(updatedGoals);
  };

  const getProgressPercentage = (goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'overdue': return 'text-red-500';
      case 'active': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getGoalTypeInfo = (type) => {
    return goalTypes.find(gt => gt.value === type) || goalTypes[0];
  };

  const generateProgressData = (goal) => {
    return goal.progress.map((entry, index) => ({
      date: new Date(entry.date).toLocaleDateString(),
      value: entry.value,
      target: goal.targetValue
    }));
  };

  return (
    <div className="min-h-screen pt-20 pb-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="text-blue-500" size={32} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Goals Tracker
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Set targets and track your competitive programming progress
          </p>
        </div>

        {/* Add Goal Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Goal
          </button>
        </div>

        {/* Goals Overview */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="leet-card text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {goals.filter(g => g.status === 'active').length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Active Goals</div>
            </div>
            <div className="leet-card text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {goals.filter(g => g.status === 'completed').length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Completed</div>
            </div>
            <div className="leet-card text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">
                {goals.filter(g => g.status === 'overdue').length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Overdue</div>
            </div>
            <div className="leet-card text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">
                {goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + getProgressPercentage(g), 0) / goals.length) : 0}%
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Average Progress</div>
            </div>
          </div>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="leet-card text-center py-12">
            <Target className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Goals Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start setting goals to track your competitive programming journey
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map(goal => {
              const typeInfo = getGoalTypeInfo(goal.type);
              const TypeIcon = typeInfo.icon;
              const progressPercentage = getProgressPercentage(goal);
              const daysRemaining = getDaysRemaining(goal.deadline);

              return (
                <div key={goal.id} className="leet-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <TypeIcon className={typeInfo.color} size={24} />
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {goal.title}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {typeInfo.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                        {goal.status === 'completed' && <CheckCircle size={12} className="inline mr-1" />}
                        {goal.status === 'overdue' && <Clock size={12} className="inline mr-1" />}
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </div>
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit3 size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {goal.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Progress: {goal.currentValue} / {goal.targetValue}
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div style={{ color: 'var(--text-muted)' }}>
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                    <div className={daysRemaining >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {daysRemaining >= 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`}
                    </div>
                  </div>

                  {goal.status === 'active' && (
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Update progress"
                        className="flex-1 px-3 py-2 text-sm rounded border"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const value = Number(e.target.value);
                            if (value >= 0) {
                              updateGoalProgress(goal.id, value);
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          const value = Number(input.value);
                          if (value >= 0) {
                            updateGoalProgress(goal.id, value);
                            input.value = '';
                          }
                        }}
                        className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  )}

                  {goal.progress.length > 1 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Progress Chart
                      </h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={generateProgressData(goal)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                          <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} />
                          <YAxis stroke="var(--text-muted)" fontSize={10} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="target" 
                            stroke="#ef4444" 
                            strokeDasharray="5 5"
                            strokeWidth={1}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Goal Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="leet-card max-w-md w-full">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="e.g., Reach 1600 rating"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Goal Type
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({...newGoal, type: e.target.value})}
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {goalTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
                    placeholder="e.g., 1600"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Current Value
                  </label>
                  <input
                    type="number"
                    value={newGoal.currentValue}
                    onChange={(e) => setNewGoal({...newGoal, currentValue: Number(e.target.value)})}
                    placeholder="e.g., 1200"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Additional details about your goal..."
                    rows={3}
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                    setNewGoal({
                      title: '',
                      type: 'rating',
                      targetValue: '',
                      currentValue: 0,
                      deadline: '',
                      description: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
