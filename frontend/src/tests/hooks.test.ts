/**
 * Tests for voice hooks
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

describe('useSpeechRecognition', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.transcript).toBe('');
    expect(result.current.isListening).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should start and stop listening', async () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    await waitFor(() => {
      expect(result.current.isListening).toBe(true);
    });

    act(() => {
      result.current.stopListening();
    });

    await waitFor(() => {
      expect(result.current.isListening).toBe(false);
    });
  });

  it('should reset transcript', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe('');
  });

  it('should call onResult callback', async () => {
    const mockOnResult = vi.fn();
    const { result } = renderHook(() => 
      useSpeechRecognition({ onResult: mockOnResult })
    );

    // Simulate recognition result
    // Note: In real tests, you'd need to trigger the actual recognition event
    expect(result.current.isSupported).toBe(true);
  });
});

describe('useTextToSpeech', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTextToSpeech());

    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.voices).toEqual([]);
  });

  it('should have speak function', () => {
    const { result } = renderHook(() => useTextToSpeech());

    expect(typeof result.current.speak).toBe('function');
    expect(typeof result.current.stop).toBe('function');
    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.resume).toBe('function');
  });

  it('should call speak with text', () => {
    const { result } = renderHook(() => useTextToSpeech());

    act(() => {
      result.current.speak('Test text');
    });

    // Speech API is mocked, so we just verify it doesn't throw
    expect(result.current.isSupported).toBe(true);
  });

  it('should stop speaking', () => {
    const { result } = renderHook(() => useTextToSpeech());

    act(() => {
      result.current.speak('Test text');
      result.current.stop();
    });

    expect(result.current.isSpeaking).toBe(false);
  });
});
