const logger = require('./logger');

class AIService {
  /**
   * AI Judge evaluating the roasts to break a tie.
   * Returns 1 if player1 wins, 2 if player2 wins.
   */
  async judgeTiebreaker(topic, roast1, roast2) {
    logger.info('AI Judge invoked for tiebreaker', { topic });
    
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OPENAI_API_KEY is not set. Falling back to length-based tiebreaker for open source compatibility.');
      return (roast1 || '').length >= (roast2 || '').length ? 1 : 2;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an impartial judge for a roasting battle. Given the topic and two roasts, output ONLY the number "1" if roast1 is better, or "2" if roast2 is better. Do not output any other text.'
            },
            {
              role: 'user',
              content: `Topic: ${topic}\n\nRoast 1: ${roast1}\n\nRoast 2: ${roast2}`
            }
          ],
          temperature: 0.7,
          max_tokens: 10
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const choice = data.choices[0]?.message?.content?.trim();
      
      if (choice === '1' || choice === '2') {
        return parseInt(choice, 10);
      }
      
      logger.warn('AI Judge returned unexpected format, defaulting to player 1', { choice });
      return 1;
    } catch (error) {
      logger.error('Failed to call AI Judge', error);
      // Fallback
      return 1;
    }
  }
}

module.exports = new AIService();
