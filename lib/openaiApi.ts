// Note: In a production app, API calls should be made through your backend server
// This is for development/demo purposes only
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const analyzeImage = async (
  base64Image: string,
  analysisType: 'calories' | 'health' | 'conversation' = 'conversation'
) => {
  try {
    let systemPrompt = '';

    switch (analysisType) {
      case 'calories':
        systemPrompt = `Analyze the food items in this image and provide:
          1. A brief one-line description of the meal
          2. List each food item and its calorie content in the format:
             [Item name]: [Calorie range]
          Be concise and focus only on calorie information.`;
        break;

      case 'health':
        systemPrompt = `Analyze the health implications of this food and provide a concise response in this exact format:

          Summary: [One sentence overview of the meal's health impact]

          Benefits:
          - [Benefit 1]
          - [Benefit 2]

          Concerns:
          - [Concern 1]
          - [Concern 2]

          Recommendations:
          - [Recommendation 1]
          - [Recommendation 2]

          Keep each point brief and clear. Maximum 2-3 points per section.`;
        break;

      case 'conversation':
        systemPrompt = `Identify only the main dish type in this image using 1-2 words maximum.
          Example: If you see Japanese fried rice, just say "fried rice".
          If you see a healthy garden salad, just say "salad".`;
        break;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

export const getChatResponse = async (message: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful chef assistant who can provide cooking advice, recipes, and nutritional information. Keep responses concise and practical.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
};
