const matchScoresCache: Record<string, number> = {};


export const generateConsistentMatchScore = (resourceId: string | number, skills: string[] = []): number => {
  const key = String(resourceId);
  
  // If we already have a cached score, use it
  if (matchScoresCache[key]) {
    return matchScoresCache[key];
  }

  // Generate a deterministic score based on resource ID
  let hash = 0;
  const idStr = String(resourceId);
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to generate a score between 70 and 98
  const seed = Math.abs(hash);
  const score = 70 + (seed % 29); // 70-98 range
  
  // Add small bonus based on number of skills (max +5)
  const skillBonus = Math.min(skills.length * 0.5, 5);
  const finalScore = Math.min(Math.round(score + skillBonus), 99);
  
  // Cache the score
  matchScoresCache[key] = finalScore;
  
  return finalScore;
};

/**
 * Clear the cache (useful for testing or when data changes)
 */
export const clearMatchScoreCache = () => {
  Object.keys(matchScoresCache).forEach(key => {
    delete matchScoresCache[key];
  });
};