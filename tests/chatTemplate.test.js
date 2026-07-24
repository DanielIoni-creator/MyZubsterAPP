/**
 * Unit tests for chat template utilities
 */

const { normalizeMessage, applyChatTemplate, validateMessages } = require('../src/utils/chatTemplate');

describe('Chat Template Utilities', () => {
  describe('normalizeMessage', () => {
    test('should handle assistant message without content key', () => {
      const message = {
        role: 'assistant',
        function_call: { name: 'get_weather', arguments: '{}' }
      };
      const normalized = normalizeMessage(message);
      expect(normalized.content).toBe('');
      expect(normalized.role).toBe('assistant');
      expect(normalized.function_call).toBeDefined();
    });

    test('should handle assistant message with null content', () => {
      const message = {
        role: 'assistant',
        content: null,
        tool_calls: [{ id: '1', type: 'function' }]
      };
      const normalized = normalizeMessage(message);
      expect(normalized.content).toBe('');
    });

    test('should preserve valid content', () => {
      const message = {
        role: 'assistant',
        content: 'Hello, world!'
      };
      const normalized = normalizeMessage(message);
      expect(normalized.content).toBe('Hello, world!');
    });

    test('should handle user message without content', () => {
      const message = {
        role: 'user'
      };
      const normalized = normalizeMessage(message);
      expect(normalized.content).toBe('');
    });

    test('should throw error for invalid message', () => {
      expect(() => normalizeMessage(null)).toThrow('Invalid message');
      expect(() => normalizeMessage('string')).toThrow('Invalid message');
    });

    test('should throw error for missing role', () => {
      expect(() => normalizeMessage({ content: 'test' })).toThrow('role is required');
    });
  });

  describe('applyChatTemplate', () => {
    test('should handle messages with missing content keys', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', function_call: { name: 'test' } },
        { role: 'user', content: 'Thanks' }
      ];
      const result = applyChatTemplate(messages);
      expect(result).toContain('user: Hello');
      expect(result).toContain('assistant: ');
      expect(result).toContain('user: Thanks');
    });

    test('should format messages correctly', () => {
      const messages = [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' }
      ];
      const result = applyChatTemplate(messages);
      expect(result).toBe('system: You are helpful\nuser: Hi\nassistant: Hello!');
    });

    test('should handle empty messages array gracefully', () => {
      expect(() => applyChatTemplate([])).toThrow();
    });

    test('should throw error for non-array input', () => {
      expect(() => applyChatTemplate('not an array')).toThrow('Messages must be an array');
    });
  });

  describe('validateMessages', () => {
    test('should validate correct messages', () => {
      const messages = [
        { role: 'user', content: 'test' },
        { role: 'assistant' }
      ];
      expect(validateMessages(messages)).toBe(true);
    });

    test('should reject non-array input', () => {
      expect(() => validateMessages('not array')).toThrow('Messages must be an array');
    });

    test('should reject empty array', () => {
      expect(() => validateMessages([])).toThrow('Messages array cannot be empty');
    });

    test('should reject messages without role', () => {
      const messages = [{ content: 'test' }];
      expect(() => validateMessages(messages)).toThrow('missing required \'role\' field');
    });

    test('should reject invalid role', () => {
      const messages = [{ role: 'invalid_role', content: 'test' }];
      expect(() => validateMessages(messages)).toThrow('invalid role');
    });
  });
});