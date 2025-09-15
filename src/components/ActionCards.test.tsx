import React from 'react';
import { render, screen, fireEvent } from '../../tests/helpers/testUtils';
import ActionCards from './ActionCards';

const t = (key: string, params?: Record<string, string | number>) => {
  let result = key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
  }
  return result;
};

describe.sequential('ActionCards', () => {
  test('renders buttons and labels', () => {
    render(
      <ActionCards
        t={t}
        problemsCount={3}
        onGenerate={() => {}}
        onDownload={() => {}}
        onStartQuiz={() => {}}
      />
    );

    expect(
      screen.getByRole('group', { name: /infoPanel\.quickActions\.title/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons\.generate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons\.download/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /infoPanel\.quickActions\.startQuiz/i })
    ).toBeInTheDocument();
  });

  test('disables download and quiz when no problems', () => {
    render(
      <ActionCards
        t={t}
        problemsCount={0}
        onGenerate={() => {}}
        onDownload={() => {}}
        onStartQuiz={() => {}}
      />
    );

    const download = screen.getByRole('button', {
      name: /buttons\.download/i,
    }) as HTMLButtonElement;
    const quiz = screen.getByRole('button', {
      name: /infoPanel\.quickActions\.startQuiz/i,
    }) as HTMLButtonElement;

    expect(download.disabled).toBe(true);
    expect(quiz.disabled).toBe(true);
  });

  test('fires callbacks when clicked', () => {
    const onGenerate = vi.fn();
    const onDownload = vi.fn();
    const onStartQuiz = vi.fn();

    render(
      <ActionCards
        t={t}
        problemsCount={2}
        onGenerate={onGenerate}
        onDownload={onDownload}
        onStartQuiz={onStartQuiz}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /buttons\.generate/i }));
    fireEvent.click(screen.getByRole('button', { name: /buttons\.download/i }));
    fireEvent.click(screen.getByRole('button', { name: /infoPanel\.quickActions\.startQuiz/i }));

    expect(onGenerate).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onStartQuiz).toHaveBeenCalledTimes(1);
  });

  test('handles rejected download promise without throwing', () => {
    const onDownload = vi.fn(() => Promise.reject(new Error('fail')));
    render(
      <ActionCards
        t={t}
        problemsCount={1}
        onGenerate={() => {}}
        onDownload={onDownload}
        onStartQuiz={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /buttons\.download/i }));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });
});
