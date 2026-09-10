import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.confirm
vi.stubGlobal('confirm', vi.fn(() => true));

// Mock window.alert
vi.stubGlobal('alert', vi.fn());
