import { describe, expect, it } from 'vitest';
import { ApiClient } from '../services/ApiClient';

describe('ApiClient', () => {
  it('devuelve siempre la misma instancia (patrón Singleton)', () => {
    const first = ApiClient.getInstance('http://localhost:5000/api');
    const second = ApiClient.getInstance('http://localhost:5000/api');

    expect(first).toBe(second);
  });
});
