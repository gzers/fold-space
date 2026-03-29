import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Landing from './Landing';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock hooks
vi.mock('../hooks/useCamera', () => ({
  useCamera: () => ({ requestPermission: vi.fn().mockResolvedValue(true) })
}));

vi.mock('../hooks/useMicrophone', () => ({
  useMicrophone: () => ({ requestPermission: vi.fn().mockResolvedValue(true) })
}));

describe('Landing Page', () => {
  it('should render the main title and description', () => {
    render(<Landing />);
    
    expect(screen.getByText('褶宇宙 Fold-Space')).toBeInTheDocument();
    expect(screen.getByText('把你的生命时刻折叠进可触摸的时空褶皱里。')).toBeInTheDocument();
  });

  it('should display permission requirements', () => {
    render(<Landing />);
    
    expect(screen.getByText('需要以下权限以获得完整体验')).toBeInTheDocument();
    expect(screen.getByText('摄像头权限')).toBeInTheDocument();
    expect(screen.getByText('麦克风权限')).toBeInTheDocument();
    expect(screen.getByText('本地存储')).toBeInTheDocument();
  });

  it('should navigate to canvas when start button is clicked', async () => {
    render(<Landing />);
    
    const startButton = screen.getByText('开始进入我的宇宙');
    fireEvent.click(startButton);

    // Because handleStart is async, we need to wait a tick to check navigation
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/canvas');
    });
  });

  it('should navigate to canvas when skip button is clicked', () => {
    render(<Landing />);
    
    const skipButton = screen.getByText('跳过手势，使用鼠标/触控进入');
    fireEvent.click(skipButton);

    expect(mockNavigate).toHaveBeenCalledWith('/canvas');
  });
});
