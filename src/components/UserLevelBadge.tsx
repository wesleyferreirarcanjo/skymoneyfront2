import { useState, useEffect } from 'react';
import { LevelProgress } from '../types/donation';
import { donationAPI } from '../lib/api';
import { TrendingUp, CheckCircle, Clock, Lock } from 'lucide-react';

interface UserLevelBadgeProps {
  className?: string;
}

export default function UserLevelBadge({ className = '' }: UserLevelBadgeProps) {
  const [levelProgress, setLevelProgress] = useState<LevelProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    loadLevelProgress();
  }, []);

  const loadLevelProgress = async () => {
    try {
      const progress = await donationAPI.getMyLevelProgress();
      setLevelProgress(progress);
      
      // Find current level (highest completed level + 1)
      const completedLevels = progress.filter(level => level.level_completed);
      if (completedLevels.length > 0) {
        const highestCompleted = Math.max(...completedLevels.map(l => l.level));
        setCurrentLevel(highestCompleted + 1);
      } else {
        setCurrentLevel(1);
      }
    } catch (error) {
      console.error('Error loading level progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: number) => {
    const currentLevelData = levelProgress.find(l => l.level === level);
    
    if (!currentLevelData) {
      return <Lock className="h-4 w-4" />;
    }
    
    if (currentLevelData.level_completed) {
      return <CheckCircle className="h-4 w-4" />;
    } else if (currentLevelData.donations_received > 0) {
      return <Clock className="h-4 w-4" />;
    } else {
      return <Lock className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (level: number) => {
    const levelData = levelProgress.find(l => l.level === level);
    return levelData ? levelData.progress_percentage : 0;
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 h-8 w-20 rounded-full ${className}`}></div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Current Level Badge */}
      <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getLevelColor(currentLevel)}`}>
        {getLevelIcon(currentLevel)}
        <span className="ml-1">N{currentLevel}</span>
      </div>

      {/* Progress Indicator */}
      {levelProgress.length > 0 && (
        <div className="flex items-center space-x-1">
          {[1, 2, 3].map((level) => (
            <div key={level} className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full ${
                getProgressPercentage(level) === 100 ? 'bg-green-500' :
                getProgressPercentage(level) > 0 ? 'bg-yellow-500' : 'bg-gray-300'
              }`} />
              <span className="text-xs text-gray-500 mt-1">{getProgressPercentage(level)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
