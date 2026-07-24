/**
 * Chat template utility functions
 * Handles message formatting and template processing
 */

/**
 * Validates and normalizes a chat message
 * @param {Object} message - The message object to validate
 * @returns {Object} - Normalized message object
 */
function normalizeMessage(message) {
  if (!message || typeof message !== 'object') {
    throw new Error('Invalid message: must be an object');
  }

  const { role, content, name, function_call, tool_calls } = message;

  if (!role) {
    throw new Error('Invalid message: role is required');
  }

  // Normalize content - handle missing or null content
  let normalizedContent = content;
  
  // For assistant messages, content can be omitted if function_call or tool_calls are present
  if (role === 'assistant') {
    if (content === undefined || content === null) {
      // If there's a function_call or tool_calls, content can be empty string
      if (function_call || tool_calls) {
        normalizedContent = '';
      } else {
        // Otherwise, default to empty string to prevent crashes
        normalizedContent = '';
      }
    }
  } else {
    // For non-assistant messages, content should default to empty string if missing
    if (content === undefined || content === null) {
      normalizedContent = '';
    }
  }

  return {
    role,
    content: normalizedContent,
    ...(name && { name }),
    ...(function_call && { function_call }),
    ...(tool_calls && { tool_calls })
  };
}

/**
 * Applies chat template to messages
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Template options
 * @returns {string} - Formatted chat string
 */
function applyChatTemplate(messages, options = {}) {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }

  try {
    // Normalize all messages to handle missing content keys
    const normalizedMessages = messages.map((msg, index) => {
      try {
        return normalizeMessage(msg);
      } catch (error) {
        throw new Error(`Invalid message at index ${index}: ${error.message}`);
      }
    });

    // Apply template formatting
    const formatted = normalizedMessages.map(msg => {
      const { role, content, name } = msg;
      const prefix = name ? `${role} (${name})` : role;
      return `${prefix}: ${content}`;
    }).join('\n');

    return formatted;
  } catch (error) {
    throw new Error(`Failed to apply chat template: ${error.message}`);
  }
}

/**
 * Validates chat messages array
 * @param {Array} messages - Array of message objects
 * @returns {boolean} - True if valid
 * @throws {Error} - If validation fails
 */
function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }

  if (messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  messages.forEach((msg, index) => {
    if (!msg || typeof msg !== 'object') {
      throw new Error(`Message at index ${index} must be an object`);
    }

    if (!msg.role) {
      throw new Error(`Message at index ${index} is missing required 'role' field`);
    }

    const validRoles = ['system', 'user', 'assistant', 'function', 'tool'];
    if (!validRoles.includes(msg.role)) {
      throw new Error(`Message at index ${index} has invalid role: ${msg.role}`);
    }
  });

  return true;
}

module.exports = {
  normalizeMessage,
  applyChatTemplate,
  validateMessages
};