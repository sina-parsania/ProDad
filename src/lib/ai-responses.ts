// Sample AI responses for the ProDad assistant

const generalResponses = [
  "Thanks for reaching out! I'm here to help with any parenting questions you might have.",
  "I appreciate your question. As a ProDad assistant, I'm here to support your parenting journey.",
  "That's a great question. I'll provide the best guidance I can as your parenting assistant.",
];

const parentingTips = [
  'Creating a consistent bedtime routine can help children fall asleep easier. Try including activities like reading a story, gentle music, or a warm bath.',
  "When dealing with tantrums, stay calm and acknowledge your child's feelings. Remember that tantrums are a normal part of emotional development.",
  "Quality time doesn't have to be elaborate. Even 10-15 minutes of focused, device-free interaction each day can strengthen your bond.",
  'Praise effort rather than results to help develop a growth mindset in your child.',
  'Model the behavior you want to see. Children learn more from what you do than what you say.',
];

const appFeatureResponses = [
  'The Reminders widget helps you keep track of important events and tasks. You can add new reminders directly from the dashboard.',
  'You can upload important documents in the Documents widget for easy access. Compatible formats include PDF, DOC, and images.',
  'The calendar feature allows you to organize family activities and appointments in one place.',
  'Your data in ProDad is stored locally on your device for privacy and security.',
  'You can customize your dashboard by rearranging widgets to suit your preferences.',
];

const keywordMap: Record<string, string[]> = {
  sleep: [
    'Consistent bedtime routines can significantly improve sleep quality for children.',
    'For better sleep, limit screen time at least an hour before bedtime and create a calm environment.',
    'Most toddlers need 11-14 hours of sleep per day, including naps.',
  ],
  food: [
    'Introducing a variety of foods early can help prevent picky eating later on.',
    'Family meals are associated with better nutrition and closer family bonds.',
    'Let children serve themselves (with guidance) to help them develop healthy eating habits and recognize hunger cues.',
  ],
  tantrum: [
    'Tantrums are a normal part of development as children learn to express and manage emotions.',
    "Stay calm during a tantrum and acknowledge your child's feelings before trying to solve the problem.",
    'Distraction can be an effective strategy for younger children having a tantrum.',
  ],
  work: [
    'Setting boundaries between work and family time is crucial for being present with your children.',
    'Consider flexible work arrangements if available to balance parenting responsibilities.',
    'Quality time matters more than quantity - make the most of the time you have with your children.',
  ],
  app: [
    'The ProDad app helps you organize your parenting responsibilities and track important milestones.',
    'You can access all your parenting resources in one place with our intuitive dashboard.',
    'Use the reminders feature to never miss important events or appointments.',
  ],
};

export function getAiResponse(userMessage: string): string {
  // Convert to lowercase for easier matching
  const message = userMessage.toLowerCase();

  // Check for keyword matches
  for (const [keyword, responses] of Object.entries(keywordMap)) {
    if (message.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Check if asking about app features
  if (
    message.includes('how') &&
    (message.includes('app') || message.includes('use') || message.includes('feature'))
  ) {
    return appFeatureResponses[Math.floor(Math.random() * appFeatureResponses.length)];
  }

  // Check if asking for parenting advice
  if (
    message.includes('advice') ||
    message.includes('help') ||
    message.includes('tip') ||
    message.includes('suggestion')
  ) {
    return parentingTips[Math.floor(Math.random() * parentingTips.length)];
  }

  // Default to general responses
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}
