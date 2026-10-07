const logger = require('./logger');

class AIService {
  /**
   * Simulates an AI judging the roasts.
   * Returns 1 if player1 wins, 2 if player2 wins.
   */
  async judgeTiebreaker(topic, roast1, roast2) {
    logger.info('AI Judge invoked for tiebreaker', { topic });
    // In a real app, this would call OpenAI or Gemini API.
    // For now, we simulate a small delay and pick a winner based on length or random.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const r1Len = (roast1 || '').length;
    const r2Len = (roast2 || '').length;
    
    // Slight bias to the longer roast
    if (r1Len > r2Len + 10) return 1;
    if (r2Len > r1Len + 10) return 2;
    
    return Math.random() > 0.5 ? 1 : 2;
  }
}

module.exports = new AIService();
