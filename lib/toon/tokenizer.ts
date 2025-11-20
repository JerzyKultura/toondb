import { TokenCount } from './types';

/**
 * Approximate token counting using OpenAI's tokenization rules
 * This is a simplified version - for production, use actual tokenizers like tiktoken
 */
export class TokenCounter {
  /**
   * Estimate token count for a given text
   * Roughly 1 token ≈ 4 characters in English
   */
  countTokens(text: string): number {
    // Remove whitespace for better estimation
    const withoutExcessWhitespace = text.replace(/\s+/g, ' ').trim();
    
    // Basic heuristic: ~4 chars per token
    const charCount = withoutExcessWhitespace.length;
    let tokenEstimate = Math.ceil(charCount / 4);
    
    // Add tokens for punctuation and special chars
    const specialChars = (text.match(/[,:.;!?{}\[\]()]/g) || []).length;
    tokenEstimate += Math.ceil(specialChars * 0.5);
    
    return tokenEstimate;
  }

  /**
   * Compare token counts between TOON and JSON formats
   */
  compare(toonContent: string, jsonContent: string): TokenCount {
    const toonTokens = this.countTokens(toonContent);
    const jsonTokens = this.countTokens(jsonContent);
    const savings = jsonTokens - toonTokens;
    const savingsPercentage = jsonTokens > 0 ? (savings / jsonTokens) * 100 : 0;

    return {
      toon: toonTokens,
      json: jsonTokens,
      savings,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    };
  }
}

export const tokenCounter = new TokenCounter();

export function countTokens(text: string): number {
  return tokenCounter.countTokens(text);
}

export function compareTokens(toonContent: string, jsonContent: string): TokenCount {
  return tokenCounter.compare(toonContent, jsonContent);
}

