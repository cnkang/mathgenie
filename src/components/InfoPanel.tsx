import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import type { Problem, QuizResult, Settings } from '../types';

interface InfoPanelProps {
  problems: Problem[];
  settings: Settings;
  onGenerateProblems?: () => void;
  onDownloadPdf?: () => void;
  quizResult?: QuizResult | null;
  onStartQuiz?: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  problems,
  settings,
  onGenerateProblems,
  onDownloadPdf,
  quizResult,
  onStartQuiz,
}) => {
  useTranslation();
  const [sessionStats, setSessionStats] = useState({
    totalGenerated: 0,
    sessionsCount: 1,
  });

  useEffect(() => {
    if (problems.length > 0) {
      setSessionStats((prev) => ({
        totalGenerated: prev.totalGenerated + problems.length,
        sessionsCount: prev.sessionsCount + (problems.length > 0 ? 1 : 0),
      }));
    }
  }, [problems.length]);

  // 计算统计信息
  const calculateStats = () => {
    if (problems.length === 0) {
      return {
        totalProblems: 0,
        averageComplexity: 0,
        operationTypes: 0,
        difficultyLevel: '初级',
      };
    }

    const operationTypes = settings.operations.length;
    const numberRange = settings.numRange[1] - settings.numRange[0];
    const averageOperands = (settings.numOperandsRange[0] + settings.numOperandsRange[1]) / 2;

    // 简单的难度计算
    const complexity = (numberRange * operationTypes * averageOperands) / 100;

    let difficultyLevel = '初级';
    if (complexity > 2) {
      difficultyLevel = '中级';
    }
    if (complexity > 5) {
      difficultyLevel = '高级';
    }
    if (complexity > 10) {
      difficultyLevel = '专家';
    }

    return {
      totalProblems: problems.length,
      averageComplexity: Math.round(complexity * 10) / 10,
      operationTypes,
      difficultyLevel,
    };
  };

  const stats = calculateStats();

  const tips = [
    '使用快速预设可以快速配置常用设置',
    '增加操作数个数可以提高题目难度',
    '限制结果范围可以控制答案的复杂度',
    '开启显示答案功能便于检查学习效果',
    'PDF导出支持多种纸张格式',
  ];

  // 计算学习进度（基于题目完成度）
  const learningProgress = Math.min((sessionStats.totalGenerated / 100) * 100, 100);

  return (
    <div className="info-panel">
      <h3>
        <span>📊</span>
        练习统计
      </h3>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.totalProblems}</span>
          <div className="stat-label">当前题目</div>
        </div>

        <div className="stat-card">
          <span className="stat-value">{sessionStats.totalGenerated}</span>
          <div className="stat-label">累计生成</div>
        </div>

        <div className="stat-card">
          <span className="stat-value">{stats.difficultyLevel}</span>
          <div className="stat-label">难度等级</div>
        </div>

        <div className="stat-card">
          <span className="stat-value">{stats.operationTypes}</span>
          <div className="stat-label">运算类型</div>
        </div>
      </div>

      <div className="progress-section">
        <h4>🎯 学习进度</h4>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${learningProgress}%` }}></div>
        </div>
        <div className="progress-text">已完成 {Math.round(learningProgress)}% (目标: 100题)</div>
      </div>

      <div className="tips-section">
        <h4>⚡ 快速操作</h4>
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={onGenerateProblems}>
            <span>🔄</span>
            重新生成题目
          </button>
          <button
            className="quick-action-btn"
            onClick={onDownloadPdf}
            disabled={problems.length === 0}
          >
            <span>📄</span>
            下载PDF
          </button>
          <button
            className="quick-action-btn"
            onClick={onStartQuiz}
            disabled={problems.length === 0}
          >
            <span>🎯</span>
            开始答题
          </button>
          <button
            className="quick-action-btn"
            onClick={() => {
              const element = document.querySelector('.problems-grid');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <span>📝</span>
            跳转到题目
          </button>
        </div>
      </div>

      {quizResult && (
        <div className="tips-section">
          <h4>🏆 最近答题结果</h4>
          <div className="quiz-result-summary">
            <div className="result-item">
              <span className="result-label">得分:</span>
              <span className="result-value">{quizResult.score}分</span>
            </div>
            <div className="result-item">
              <span className="result-label">等级:</span>
              <span className="result-value">{quizResult.grade}</span>
            </div>
            <div className="result-item">
              <span className="result-label">正确率:</span>
              <span className="result-value">
                {Math.round((quizResult.correctAnswers / quizResult.totalProblems) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="tips-section">
        <h4>💡 使用技巧</h4>
        <ul className="tips-list">
          {tips.slice(0, 3).map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="tips-section">
        <h4>⚙️ 当前配置</h4>
        <ul className="tips-list">
          <li>运算: {settings.operations.join(', ')}</li>
          <li>
            数字: {settings.numRange[0]}-{settings.numRange[1]}
          </li>
          <li>
            结果: {settings.resultRange[0]}-{settings.resultRange[1]}
          </li>
          <li>
            操作数: {settings.numOperandsRange[0]}-{settings.numOperandsRange[1]}个
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InfoPanel;
