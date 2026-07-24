/**
 * Chat handler middleware
 * Processes chat requests with proper error handling
 */

const { applyChatTemplate, validateMessages } = require('../utils/chatTemplate');

/**
 * Middleware to handle chat completion requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function handleChatCompletion(req, res, next) {
  try {
    const { messages, model, temperature, max_tokens } = req.body;

    // Validate messages
    if (!messages) {
      return res.status(400).json({
        error: {
          message: 'Missing required field: messages',
          type: 'invalid_request_error',
          code: 'missing_messages'
        }
      });
    }

    try {
      validateMessages(messages);
    } catch (validationError) {
      return res.status(400).json({
        error: {
          message: validationError.message,
          type: 'invalid_request_error',
          code: 'invalid_messages'
        }
      });
    }

    // Apply chat template with error handling
    let formattedChat;
    try {
      formattedChat = applyChatTemplate(messages);
    } catch (templateError) {
      return res.status(500).json({
        error: {
          message: `Failed to process chat template: ${templateError.message}`,
          type: 'server_error',
          code: 'template_error'
        }
      });
    }

    // Attach formatted chat to request for downstream processing
    req.formattedChat = formattedChat;
    req.chatParams = {
      model: model || 'default',
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 2048
    };

    next();
  } catch (error) {
    console.error('Error in chat handler:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error processing chat request',
        type: 'server_error',
        code: 'internal_error'
      }
    });
  }
}

module.exports = {
  handleChatCompletion
};