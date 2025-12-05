import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import dayjs from "dayjs";
import { ChartSkeleton } from "./LoadingSpinner";
import { fetchFromCodeforces } from "../utils/api";

/**
 * Custom tooltip component for the rating chart - LeetCode style
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const ratingChange = data.ratingChange || 0;
    const isIncrease = ratingChange > 0;
    const changeSymbol = isIncrease ? '↗' : ratingChange < 0 ? '↘' : '→';
    const changeColor = isIncrease ? 'var(--easy-color)' : ratingChange < 0 ? 'var(--hard-color)' : 'var(--text-muted)';

    return (
      <div className="p-3 rounded-lg shadow-lg border"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          minWidth: '200px'
        }}>
        <div className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
          {data.contest}
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Date:</span>
            <span style={{ color: 'var(--text-primary)' }}>{data.fullDate}</span>
          </div>

          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Rank:</span>
            <span style={{ color: 'var(--text-primary)' }}>#{data.rank}</span>
          </div>

          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Rating:</span>
            <span style={{ color: 'var(--text-primary)' }}>{data.rating}</span>
          </div>

          {ratingChange !== 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Change:</span>
              <span style={{ color: changeColor }} className="flex items-center gap-1">
                <span>{changeSymbol}</span>
                <span>{ratingChange > 0 ? '+' : ''}{ratingChange}</span>
              </span>
            </div>
          )}

          {data.problemsSolved && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-muted)' }}>Solved:</span>
              <span style={{ color: 'var(--text-primary)' }}>{data.problemsSolved} problems</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Fetches user.rating and draws a line chart of rating over contests.
 */
export default function RatingChart({ handle }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setData([]);
    setData([]);
    fetchFromCodeforces(`/user.rating?handle=${encodeURIComponent(handle)}`)
      .then(json => {
        if (json.status === 'OK') {
          const mapped = json.result.map((item, index) => {
            const prevRating = index > 0 ? json.result[index - 1].newRating : item.oldRating;
            const ratingChange = item.newRating - prevRating;

            return {
              time: dayjs.unix(item.ratingUpdateTimeSeconds).format('MMM DD'),
              fullDate: dayjs.unix(item.ratingUpdateTimeSeconds).format('MMM DD, YYYY'),
              rating: item.newRating,
              contest: item.contestName,
              rank: item.rank,
              ratingChange: ratingChange,
              problemsSolved: item.problemsSolved || null
            };
          });
          setData(mapped);
        } else {
          setData([]);
        }
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [handle]);

  return (
    <div>
      {loading && <ChartSkeleton height="320px" />}
      {!loading && (
        <div className="leet-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Contest Rating
            </h3>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {data.length} contests
            </div>
          </div>

          {data.length === 0 && (
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No rating history available.
            </div>
          )}

          {data.length > 0 && (
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{
                      fontSize: 12,
                      fill: 'var(--text-muted)'
                    }}
                    axisLine={{ stroke: 'var(--border-color)' }}
                    tickLine={{ stroke: 'var(--border-color)' }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: 'var(--text-muted)'
                    }}
                    axisLine={{ stroke: 'var(--border-color)' }}
                    tickLine={{ stroke: 'var(--border-color)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: '#f59e0b',
                      stroke: 'var(--bg-primary)',
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
