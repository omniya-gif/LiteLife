/**
 * Utility for filtering non-halal food terms from recipe searches
 */

// List of non-halal food terms to filter out
export const nonHalalTerms: string[] = [
    // Pork and derivatives
    'pork', 'bacon', 'ham', 'pepperoni', 'salami', 'prosciutto', 'pancetta', 'chorizo', 
    'sausage', 'lard', 'gelatin', 'pig', 'swine',
    
    // Alcohol and alcohol-containing items
    'alcohol', 'wine', 'beer', 'liquor', 'rum', 'vodka', 'whiskey', 'brandy', 'champagne',
    'tequila', 'gin', 'bourbon', 'cognac', 'sake', 'mirin', 'cooking wine',
    
    // Other non-halal items
    'blood', 'blood sausage', 'blood pudding',
    
    // Specific dishes known to contain non-halal ingredients
    'jamón', 'blood pudding', 'black pudding', 'haggis'
  ];
  
  /**
   * Checks if a search query contains non-halal terms
   * @param query The search query to check
   * @returns True if the query contains non-halal terms, false otherwise
   */
  export const containsNonHalalTerms = (query: string): boolean => {
    if (!query) return false;
    
    const lowerQuery = query.toLowerCase();
    
    // Check if any non-halal term is in the query
    return nonHalalTerms.some(term => 
      // Check for whole words or parts of words
      lowerQuery.includes(term)
    );
  };
  
  /**
   * Filters out non-halal terms from a search query
   * @param query The search query to filter
   * @returns The filtered query with non-halal terms removed
   */
  export const filterNonHalalTerms = (query: string): string => {
    if (!query) return query;
    
    let filteredQuery = query.toLowerCase();
    
    // Replace non-halal terms with empty string
    nonHalalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      filteredQuery = filteredQuery.replace(regex, '');
    });
    
    // Clean up extra spaces
    return filteredQuery.replace(/\s+/g, ' ').trim();
  };
  
  /**
   * Gets a warning message if the query contains non-halal terms
   * @param query The search query to check
   * @returns A warning message or null if no non-halal terms are found
   */
  export const getNonHalalWarning = (query: string): string | null => {
    if (!query) return null;
    
    const lowerQuery = query.toLowerCase();
    const foundTerms: string[] = [];
    
    // Find all non-halal terms in the query
    nonHalalTerms.forEach(term => {
      if (lowerQuery.includes(term)) {
        foundTerms.push(term);
      }
    });
    
    if (foundTerms.length === 0) return null;
    
    return `Your search contains non-halal terms (${foundTerms.join(', ')}) which have been filtered out.`;
  };