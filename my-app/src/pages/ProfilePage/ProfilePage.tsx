import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './ProfilePage.css';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import FireIcon from '../../components/icons/FireIcon';
import HeartbreakIcon from '../../components/icons/HeartbreakIcon';
import TrophyIcon from '../../components/icons/TrophyIcon';
import ArrowUpIcon from '../../components/icons/ArrowUpIcon';
import ArrowDownIcon from '../../components/icons/ArrowDownIcon';

type ResponseGame = {
  win: boolean;
  userCode: string;
  aiCode: string;
  localDateTime: string;
  winStreak: number;
};

type ResponseProfile = {
  games: ResponseGame[];
  totalWin: number;
  totalLose: number;
  winRate: number;
  winStreak: number;
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th';

  const formattedDate = date.toLocaleDateString('en-US', options);
  return formattedDate.replace(/\d+/, `${day}${suffix}`);
};

const ProfilePage: React.FC = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [profile, setProfile] = useState<ResponseProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());
  const [chartKey, setChartKey] = useState<number>(Date.now());

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setError("You need to log in to view your profile.");
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('http://localhost:8080/games', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch profile");
        }

        const data: ResponseProfile = await response.json();
        setProfile(data);
        setChartKey(Date.now());
      } catch (err: any) {
        console.error('[ERROR] Fetching profile:', err);
        setError(err.message || "Unknown error");
      }
    };

    fetchProfile();
  }, [getAccessTokenSilently, isAuthenticated]);

  const toggleCard = (index: number) => {
    setExpandedIndices(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return new Set(updated);
    });
  };

  if (error) return <div className="profile-error">Error: {error}</div>;
  if (!profile) return <div className="profile-loading">Loading profile...</div>;

  const winLoseData = [
    { name: 'Wins', value: profile.totalWin },
    { name: 'Loses', value: profile.totalLose },
  ];
  const COLORS = ['#00C49F', '#FF6B6B'];

  return (
    <div className="profile-page">
      <h2>My Game History</h2>

      <div className="profile-summary">
        <p><strong>Wins:</strong> {profile.totalWin}</p>
        <p><strong>Loses:</strong> {profile.totalLose}</p>
        <p><strong>Win Rate:</strong> {(profile.winRate * 100).toFixed(2)}%</p>
        <p><strong>Win Streak:</strong> {profile.winStreak}</p>
      </div>

      <div className="profile-chart">
        <h3>Win Rate</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart key={chartKey}>
            <Pie
              data={winLoseData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              dataKey="value"
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-in-out"
            >
              {winLoseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h3>Game Records</h3>
      <div className="game-list">
        {profile.games.map((game, index) => {
          const isExpanded = expandedIndices.has(index);
          return (
            <div
              className={`game-card ${game.win ? 'win-card' : 'lose-card'}`}
              key={index}
            >
              <div className="card-content">
                <div className="game-header-slim">
                  <div className="game-header-text-slim">
                    <p className="result-text">
                      {game.win ? (
                        <>
                          <TrophyIcon className="result-icon" width={18} height={18} style={{ verticalAlign: 'middle' }} />
                          &nbsp;Won Against AI
                        </>
                      ) : (
                        <>
                          <HeartbreakIcon className="result-icon" width={18} height={18} style={{ verticalAlign: 'middle' }} />
                          &nbsp;Lost Against AI
                        </>
                      )}
                    </p>
                    <div className="streak-line">
                      <span className="streak-text">
                        <FireIcon width={16} height={16} style={{ marginBottom: '-2px' }} />
                        &nbsp;Streak: {game.winStreak}
                      </span>
                      <button
  className="expand-btn"
  onClick={() => toggleCard(index)}
>
  {isExpanded ? <ArrowUpIcon width={26} height={26} /> : <ArrowDownIcon width={26} height={26} />}
</button>
                    </div>
                    <p className="date-text">{formatDate(game.localDateTime)}</p>
                  </div>
                </div>
                <div className={`side-color-bar ${game.win ? 'bar-win' : 'bar-lose'}`} />
              </div>

              <div className={`code-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
                <p><strong>Your Code:</strong></p>
                <div className="previous-code-content">
                  <CodeMirror
                    value={game.userCode}
                    theme="dark"
                    extensions={[java()]}
                    readOnly
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLine: true,
                      foldGutter: true,
                    }}
                  />
                </div>

                <p style={{ marginTop: '1rem' }}><strong>AI Code:</strong></p>
                <div className="previous-code-content">
                  <CodeMirror
                    value={game.aiCode}
                    theme="dark"
                    extensions={[java()]}
                    readOnly
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLine: true,
                      foldGutter: true,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfilePage;