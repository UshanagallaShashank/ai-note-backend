// const natural = require('natural');
// const Sentiment = require('sentiment');

// const sentiment = new Sentiment();
// const tokenizer = new natural.WordTokenizer();

// // Summarize notes using NLP
// function summarizeNotes(notes) {
//   if (!notes.length) return "No tasks for today! You're all caught up.";

//   const descriptions = notes.map(note => note.description || "").join(". ");
//   const tokens = tokenizer.tokenize(descriptions);
//   const frequentWords = tokens
//     .filter(word => word.length > 3)
//     .reduce((acc, word) => {
//       acc[word] = (acc[word] || 0) + 1;
//       return acc;
//     }, {});

//   const keywords = Object.keys(frequentWords)
//     .sort((a, b) => frequentWords[b] - frequentWords[a])
//     .slice(0, 5);

//   return `Today's focus areas include: ${keywords.join(", ")}.`;
// }

// // Assign priority levels to notes
// function detectPriority(note) {
//   const keywords = ["urgent", "important", "critical", "high", "priority"];
//   const noteContent = `${note.title} ${note.description}`;
//   const priorityCount = keywords.filter(keyword =>
//     noteContent.toLowerCase().includes(keyword)
//   ).length;

//   if (priorityCount > 2) return "High";
//   if (priorityCount === 1) return "Medium";
//   return "Low";
// }

// // Analyze sentiment of notes
// function analyzeSentiment(notes) {
//   const sentiments = notes.map(note =>
//     sentiment.analyze(note.description || "").score
//   );

//   const averageSentiment =
//     sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;

//   if (averageSentiment > 1) return "Positive vibes! You're doing great!";
//   if (averageSentiment < -1) return "Tough day? Remember to take breaks!";
//   return "Neutral mood. Keep going!";
// }

// // Generate lifestyle suggestions based on patterns
// function lifestyleSuggestions(notes) {
//   const workHours = notes.reduce((total, note) => {
//     const start = new Date(note.startDate);
//     const end = new Date(note.endDate);
//     const hours = (end - start) / (1000 * 60 * 60);
//     return total + hours;
//   }, 0);

//   if (workHours > 8) {
//     return 'You’ve been working a lot today. Consider setting a fixed work schedule.';
//   } else if (workHours < 4) {
//     return 'You have extra time today. Consider learning something new or relaxing!';
//   }
//   return 'Great balance today! Keep maintaining this routine.';
// }

// // Generate time management tips
// function timeManagementTips(notes) {
//   const timeSpent = notes.reduce((total, note) => {
//     const start = new Date(note.startDate);
//     const end = new Date(note.endDate);
//     return total + (end - start) / (1000 * 60 * 60);
//   }, 0);

//   return timeSpent > 8
//     ? "Consider breaking tasks into smaller chunks to avoid burnout."
//     : "You're doing well! Try to plan tomorrow's tasks in advance.";
// }

// module.exports = {
//   summarizeNotes,
//   detectPriority,
//   analyzeSentiment,
//   lifestyleSuggestions,
//   timeManagementTips,
// };


// const { OpenAI } = require('openai');
// const openai = new OpenAI({
//   apiKey: 'yourapikey',
// });

// async function summarizeNotes(notes) {
//   if (!notes.length) return "No tasks for today! You're all caught up.";

//   const descriptions = notes.map(note => note.description || "").join(". ");
  
//   const response = await openai.chat.completions.create({
//     messages: [
//       {
//         role: 'system',
//         content: 'You are a helpful assistant that summarizes text.',
//       },
//       {
//         role: 'user',
//         content: `Summarize the following notes: ${descriptions}`,
//       },
//     ],
//     model: 'gpt-4', // You can use GPT-3.5 or GPT-4
//   });

//   return response.choices[0].message.content;
// }

// async function detectPriority(note) {
//   const noteContent = `${note.title} ${note.description}`;

//   const response = await openai.chat.completions.create({
//     messages: [
//       {
//         role: 'system',
//         content: 'You are a helpful assistant that can assign priority levels based on text.',
//       },
//       {
//         role: 'user',
//         content: `Assign a priority level (High, Medium, Low) based on this text: ${noteContent}`,
//       },
//     ],
//     model: 'gpt-4',
//   });

//   return response.choices[0].message.content.trim();
// }

// async function analyzeSentiment(notes) {
//   const descriptions = notes.map(note => note.description || "").join(". ");
  
//   const response = await openai.chat.completions.create({
//     messages: [
//       {
//         role: 'system',
//         content: 'You are a helpful assistant that analyzes sentiment from text.',
//       },
//       {
//         role: 'user',
//         content: `Analyze the sentiment of the following notes: ${descriptions}`,
//       },
//     ],
//     model: 'gpt-4',
//   });

//   return response.choices[0].message.content.trim();
// }

// async function lifestyleSuggestions(notes) {
//   const workHours = notes.reduce((total, note) => {
//     const start = new Date(note.startDate);
//     const end = new Date(note.endDate);
//     const hours = (end - start) / (1000 * 60 * 60);
//     return total + hours;
//   }, 0);

//   const response = await openai.chat.completions.create({
//     messages: [
//       {
//         role: 'system',
//         content: 'You are a helpful assistant that gives lifestyle suggestions based on work hours.',
//       },
//       {
//         role: 'user',
//         content: `Suggest a lifestyle tip based on this total work hours: ${workHours}`,
//       },
//     ],
//     model: 'gpt-4',
//   });

//   return response.choices[0].message.content.trim();
// }

// async function timeManagementTips(notes) {
//   const timeSpent = notes.reduce((total, note) => {
//     const start = new Date(note.startDate);
//     const end = new Date(note.endDate);
//     return total + (end - start) / (1000 * 60 * 60);
//   }, 0);

//   const response = await openai.chat.completions.create({
//     messages: [
//       {
//         role: 'system',
//         content: 'You are a helpful assistant that provides time management tips.',
//       },
//       {
//         role: 'user',
//         content: `Give a time management tip based on this total time spent: ${timeSpent}`,
//       },
//     ],
//     model: 'gpt-4',
//   });

//   return response.choices[0].message.content.trim();
// }

// module.exports = {
//   summarizeNotes,
//   detectPriority,
//   analyzeSentiment,
//   lifestyleSuggestions,
//   timeManagementTips,
// };














// Import required libraries
const natural = require('natural');
const Sentiment = require('sentiment');

const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();

/**
 * Summarizes the focus areas for today based on the content of the notes.
 * @param {Array} notes - An array of note objects with `description` fields.
 * @returns {string} - A summary of the most common keywords.
 */
function summarizeNotes(notes) {
  if (!notes.length) return "No tasks for today! You're all caught up.";

  // Combine all descriptions into a single string
  const descriptions = notes.map(note => note.description || "").join(". ");

  // Tokenize descriptions
  const tokens = tokenizer.tokenize(descriptions);

  // Calculate word frequency, filtering out common stopwords and short words
  const stopwords = new Set([
    "the", "and", "is", "in", "to", "of", "a", "on", "for", "with", "at", "this", "that",
  ]);
  const frequentWords = tokens
    .map(word => word.toLowerCase())
    .filter(word => word.length > 3 && !stopwords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  // Sort keywords by frequency and get the top 10
  const sortedKeywords = Object.entries(frequentWords)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .slice(0, 10);

  // Focus areas
  const focusAreas = sortedKeywords.map(([word, freq]) => `${word} (${freq} times)`);
  const focusSummary = focusAreas.length
    ? `Today's focus areas include: ${focusAreas.join(", ")}.`
    : "No significant focus areas detected.";

  // Total and completed notes
  const totalNotes = notes.length;
  const completedNotes = notes.filter(note => note.isCompleted).length;
  const completionRate = ((completedNotes / totalNotes) * 100).toFixed(2);

  // Time-based analysis
  const overdueTasks = notes.filter(note => new Date(note.endDate) < new Date());
  const upcomingTasks = notes.filter(
    note => new Date(note.startDate) > new Date() && !note.isCompleted
  );

  const overdueSummary = overdueTasks.length
    ? `You have ${overdueTasks.length} overdue tasks. Prioritize completing these.`
    : "No overdue tasks! Great job staying on track.";

  const upcomingSummary = upcomingTasks.length
    ? `You have ${upcomingTasks.length} upcoming tasks. Plan ahead to stay productive.`
    : "No upcoming tasks logged.";

  // Priority analysis
  const highPriorityTasks = notes.filter(note => note.priority === 'high');
  const prioritySummary = highPriorityTasks.length
    ? `You have ${highPriorityTasks.length} high-priority tasks to focus on.`
    : "No high-priority tasks detected.";

  // Combined summary
  return `
    Summary for today:
    - Total tasks: ${totalNotes}
    - Completed tasks: ${completedNotes} (${completionRate}% completion rate)
    - ${focusSummary}
    - ${overdueSummary}
    - ${upcomingSummary}
    - ${prioritySummary}
    - Keep up the great work!
  `.trim();
}


/**
 * Determines the priority level of a note based on specific keywords.
 * @param {Object} note - A note object with `title` and `description` fields.
 * @returns {string} - The priority level: High, Medium, or Low.
 */
function detectPriority(note) {
  const keywords = ["urgent", "important", "critical", "high", "priority", "asap", "deadline", "emergency", "vital", "pressing"];
  const noteContent = `${note.title} ${note.description}`;

  const priorityCount = keywords.filter(keyword =>
    noteContent.toLowerCase().includes(keyword)
  ).length;

  if (priorityCount >= 3) return "High";
  if (priorityCount === 2) return "Medium";
  return "Low";
}

/**
 * Analyzes the overall sentiment of the notes' descriptions.
 * @param {Array} notes - An array of note objects with `description` fields.
 * @returns {string} - A message reflecting the general sentiment.
 */
function analyzeSentiment(notes) {
  if (!notes.length) {
    return {
      summary: "No notes to analyze.",
      tips: ["Start logging your daily activities to track your emotional trends."],
    };
  }

  const sentiments = notes.map(note => sentiment.analyze(note.description || "").score);

  const totalNotes = sentiments.length;
  const averageSentiment =
    sentiments.reduce((sum, score) => sum + score, 0) / totalNotes;

  const sentimentSummary = sentiments.map((score, index) => ({
    note: notes[index].title || `Note ${index + 1}`,
    score,
    mood:
      score > 1.5
        ? "Very Positive"
        : score > 0.5
        ? "Positive"
        : score < -1.5
        ? "Very Negative"
        : score < -0.5
        ? "Negative"
        : "Neutral",
  }));

  let overallFeedback;
  let tips;

  if (averageSentiment > 1.5) {
    overallFeedback =
      "You're radiating positivity today! It's a great day to tackle important tasks or spread encouragement to others.";
    tips = [
      "Use this energy to focus on creative or challenging tasks.",
      "Share your positive mood with your team or loved ones.",
    ];
  } else if (averageSentiment > 0.5) {
    overallFeedback =
      "A positive vibe detected! You're in a good headspace to maintain productivity and stay motivated.";
    tips = [
      "Keep up the good work and continue tackling tasks with enthusiasm.",
      "Take a moment to appreciate what's contributing to your good mood.",
    ];
  } else if (averageSentiment > -0.5) {
    overallFeedback =
      "You're feeling neutral today. A balanced state of mind can be a great opportunity to focus on routine tasks.";
    tips = [
      "Consider scheduling tasks that don't require high energy or creativity.",
      "Use this time for reflection or journaling to maintain emotional balance.",
    ];
  } else if (averageSentiment > -1.5) {
    overallFeedback =
      "A slightly negative vibe detected. It might be helpful to identify any stressors and address them calmly.";
    tips = [
      "Take short breaks to re-center yourself.",
      "Reach out to a trusted friend or colleague if you're feeling off.",
    ];
  } else {
    overallFeedback =
      "It seems like a tough day. Prioritize self-care and take some time to recharge your mental and emotional batteries.";
    tips = [
      "Avoid making critical decisions while in this mindset.",
      "Engage in activities that bring you joy, such as a hobby or relaxation.",
    ];
  }

  return {
    averageSentiment: averageSentiment.toFixed(2),
    overallFeedback,
    sentimentSummary,
    tips,
  };
}

/**
 * Provides lifestyle suggestions based on the total working hours.
 * @param {Array} notes - An array of note objects with `startDate` and `endDate` fields.
 * @returns {string} - A lifestyle suggestion message.
 */
function lifestyleSuggestions(notes) {
  if (!notes.length) {
    return [
      "No tasks logged. Start tracking your activities to gain insights into your routine.",
      "Consider logging your daily tasks to better understand how you spend your time and improve productivity."
    ];
  }

  // Calculate work hours
  const totalWorkHours = notes.reduce((total, note) => {
    const start = new Date(note.startDate);
    const end = new Date(note.endDate);
    const hours = (end - start) / (1000 * 60 * 60);
    return total + (hours > 0 ? hours : 0);
  }, 0);

  // Calculate task distribution
  const priorityCounts = notes.reduce(
    (counts, note) => {
      counts[note.priority] = (counts[note.priority] || 0) + 1;
      return counts;
    },
    { low: 0, medium: 0, high: 0 }
  );

  // Calculate task completion rate
  const completedTasks = notes.filter(note => note.isCompleted).length;
  const totalTasks = notes.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  // Identify free time (gaps between tasks)
  const sortedNotes = notes.sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );
  let freeTimeHours = 0;
  for (let i = 1; i < sortedNotes.length; i++) {
    const prevEnd = new Date(sortedNotes[i - 1].endDate);
    const nextStart = new Date(sortedNotes[i].startDate);
    const gap = (nextStart - prevEnd) / (1000 * 60 * 60);
    if (gap > 0) freeTimeHours += gap;
  }

  // Analyze overlapping tasks
  const overlappingTasks = notes.filter(note => {
    return notes.some(otherNote => {
      const start = new Date(note.startDate);
      const end = new Date(note.endDate);
      const otherStart = new Date(otherNote.startDate);
      const otherEnd = new Date(otherNote.endDate);
      return (
        note._id !== otherNote._id &&
        ((start >= otherStart && start < otherEnd) ||
          (end > otherStart && end <= otherEnd))
      );
    });
  });

  // Suggestions based on analysis
  const suggestions = [];

  if (totalWorkHours > 10) {
    suggestions.push(
      "You've been working extensively today. Make sure to rest and rejuvenate. Consider spending time with loved ones or enjoying a hobby."
    );
  } else if (totalWorkHours < 4) {
    suggestions.push(
      "You have some free time today. Use it to explore new skills, engage in self-care, or plan ahead for upcoming tasks."
    );
  } else {
    suggestions.push(
      "Great job maintaining a balanced workday. Keep up this healthy routine by mixing productivity with relaxation."
    );
  }

  if (priorityCounts.high > 5) {
    suggestions.push(
      "You have a high number of critical tasks today. Prioritize them carefully and delegate or reschedule less urgent work if needed."
    );
  }

  if (completionRate < 50) {
    suggestions.push(
      "Your task completion rate is below 50%. Review your pending tasks and focus on achievable goals for the day."
    );
  } else {
    suggestions.push(
      "You're completing tasks efficiently! Celebrate your achievements and set new milestones for tomorrow."
    );
  }

  if (freeTimeHours > 3) {
    suggestions.push(
      "You have over 3 hours of free time today. Consider using this opportunity for personal growth, like reading or learning something new."
    );
  }

  if (overlappingTasks.length > 0) {
    suggestions.push(
      `Some of your tasks overlap, which could lead to stress or inefficiency. Review your schedule to minimize conflicts.`
    );
  }

  // Shuffle suggestions and return a subset
  const shuffledSuggestions = suggestions.sort(() => Math.random() - 0.5);
  return shuffledSuggestions.slice(0, 5);
}


/**
 * Offers time management tips based on total time spent on tasks.
 * @param {Array} notes - An array of note objects with `startDate` and `endDate` fields.
 * @returns {string} - A time management tip.
 */
function timeManagementTips(notes, user) {
  console.log("object",user)
  if (!notes.length) {
    return [
      "No tasks logged. Start your day by planning and setting clear goals.",
      "Make sure to log your activities to gain better control over your schedule."
    ];
  }

  // Calculate total work hours
  const totalWorkHours = notes.reduce((total, note) => {
    const start = new Date(note.startDate);
    const end = new Date(note.endDate);
    return total + (end - start) / (1000 * 60 * 60);
  }, 0);

  // Calculate time since last login
  const lastLoginDiffHours =
    (Date.now() - new Date(user.activity.lastLogin)) / (1000 * 60 * 60);

  // High-priority tasks
  const highPriorityTasks = notes.filter(note => note.priority === "high").length;

  // User habits
  const habitStreaks = user.habits.map(habit => ({
    name: habit.habitName,
    streak: habit.streak,
    longestStreak: habit.longestStreak
  }));

  // Tips based on user activity and notes
  const tips = [];

  if (lastLoginDiffHours > 24) {
    tips.push(
      "Welcome back! It’s been a while since your last login. Consider reviewing your pending tasks and goals."
    );
  } else {
    tips.push(
      "You’re maintaining a consistent login streak. Keep up the great habit of staying on top of your tasks!"
    );
  }

  if (totalWorkHours > 10) {
    tips.push(
      "You've worked extensively today. Prioritize relaxation and take some time for self-care."
    );
  } else if (totalWorkHours < 4) {
    tips.push(
      "You have some extra time today. Use it for personal growth, hobbies, or connecting with loved ones."
    );
  }

  if (highPriorityTasks > 3) {
    tips.push(
      `You have ${highPriorityTasks} high-priority tasks. Focus on these first to make the most impact.`
    );
  } else {
    tips.push(
      "Your tasks today seem manageable. Use the opportunity to plan ahead or explore new challenges."
    );
  }

  if (habitStreaks.length > 0) {
    const topStreak = habitStreaks.reduce((max, habit) =>
      habit.streak > max.streak ? habit : max, { streak: 0 }
    );
    tips.push(
      `You're maintaining a great streak with your habit '${topStreak.name}'. Keep it up!`
    );
  } else {
    tips.push(
      "Consider starting a new habit to enhance your productivity or well-being."
    );
  }

  if (user.activity.tasksCompleted > 100) {
    tips.push(
      `You've completed over 100 tasks so far. Celebrate your achievements and continue setting ambitious goals!`
    );
  }

  // Add general time management tips
  const generalTips = [
    "Break your work into shorter sessions (e.g., 25 minutes focus, 5 minutes rest).",
    "Plan your day the night before for a smoother start in the morning.",
    "Use a time-blocking method to allocate specific hours for tasks.",
    "Take regular breaks to recharge and maintain focus.",
    "Reflect on completed tasks to identify areas for improvement.",
    "Review your long-term goals weekly to ensure alignment with daily tasks."
  ];

  // Shuffle and merge tips for variety
  const shuffledTips = [...tips, ...generalTips].sort(() => Math.random() - 0.5);
  return shuffledTips.slice(0, 5); // Return a subset of 5 tips
}


/**
 * Recommends tools or techniques to enhance productivity.
 * @returns {string} - A suggestion for productivity tools or methods.
 */
function productivityToolsSuggestion(userPreferences = {}) {
  const generalSuggestions = [
    "Master the Pomodoro Technique to break your work into focused intervals with regular breaks, boosting both focus and energy.",
    "Organize your tasks and deadlines with tools like Todoist or Asana, ensuring you prioritize effectively and never miss an important task.",
    "Use time-blocking techniques to plan your day by assigning specific periods to tasks, helping you maintain structure and control.",
    "Minimize distractions and maintain focus with apps like Freedom or Cold Turkey by blocking time-draining websites and apps.",
    "Streamline repetitive tasks using automation tools like Zapier or IFTTT, freeing up time for more important work.",
    "Understand your work habits better by tracking your daily activity with tools like Clockify or RescueTime, and optimize accordingly.",
    "Visualize and manage projects effectively with Kanban boards in Trello or Miro, perfect for both personal and team workflows.",
    "Reset your focus and calm your mind with mindfulness exercises or quick meditation sessions, essential for maintaining mental clarity.",
    "Prioritize tasks strategically using the Eisenhower Matrix, categorizing them by urgency and importance for better decision-making.",
    "Keep your digital files organized and accessible using tools like Google Drive, OneDrive, or Dropbox to ensure seamless collaboration and storage."
  ];

  const collaborationSuggestions = [
    "Improve team communication and integrate workflows seamlessly with Slack or Microsoft Teams, essential for remote or hybrid teams.",
    "Collaborate efficiently with Notion or Coda, which combine documents, databases, and team coordination in one platform.",
    "Stay on top of meetings and appointments by using scheduling tools like Calendly or Microsoft Outlook, reducing calendar conflicts.",
    "Track shared tasks and monitor team progress in real time with tools like ClickUp or Monday.com, ideal for managing projects of all sizes.",
    "Brainstorm and visualize ideas effectively during team sessions using digital whiteboards like Miro or Jamboard."
  ];

  const healthAndWellbeingSuggestions = [
    "Incorporate short walking or stretching breaks every hour to keep your body active and reduce sedentary fatigue.",
    "Establish a screen-free evening routine by disconnecting from digital devices to unwind and prepare for better sleep.",
    "Build and track positive habits with gamified apps like Habitica, Streaks, or Fabulous to stay consistent and motivated.",
    "Take a moment to de-stress during hectic days by using meditation apps like Calm or Headspace for guided relaxation sessions.",
    "Protect your eyes by following the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds, reducing eye strain."
  ];

  const learningAndSelfGrowthSuggestions = [
    "Expand your productivity mindset by reading transformational books like 'Deep Work' by Cal Newport or 'Atomic Habits' by James Clear.",
    "Invest in self-growth with online courses on platforms like LinkedIn Learning, Udemy, or MasterClass to enhance your skill set.",
    "Start or maintain a gratitude journal to reflect on positive aspects of your day, boosting overall happiness and productivity.",
    "Review and realign your long-term goals weekly to ensure your daily efforts contribute to meaningful outcomes.",
    "Stay updated on the latest trends and best practices by following industry leaders or productivity influencers online."
  ];

  const advancedSuggestions = [
    "Leverage cutting-edge AI assistants like Notion AI or Microsoft Copilot to streamline complex tasks and improve efficiency.",
    "Save time and effort by creating custom keyboard shortcuts for repetitive tasks in your favorite tools or software.",
    "Boost multitasking efficiency by using dual monitors or an ultrawide screen, ideal for managing multiple applications simultaneously.",
    "Create a focused work environment with noise-canceling headphones, eliminating background distractions during deep work sessions.",
    "Turn productivity into a game with apps like Forest or Habitica, making task completion enjoyable and engaging."
  ];

  const tipsByCategory = {
    general: generalSuggestions,
    collaboration: collaborationSuggestions,
    health: healthAndWellbeingSuggestions,
    growth: learningAndSelfGrowthSuggestions,
    advanced: advancedSuggestions
  };

  // Personalize suggestions based on user preferences
  let personalizedTips = [];
  if (userPreferences.theme === 'dark') {
    personalizedTips.push("Using dark mode in your apps can reduce eye strain during long work sessions and improve focus.");
  }
  if (userPreferences.language && userPreferences.language !== 'en') {
    personalizedTips.push("Look for tools with multilingual support to ensure you can work comfortably in your preferred language.");
  }

  // Combine all suggestions for selection
  const allTips = [
    ...generalSuggestions,
    ...collaborationSuggestions,
    ...healthAndWellbeingSuggestions,
    ...learningAndSelfGrowthSuggestions,
    ...advancedSuggestions,
    ...personalizedTips
  ];

  // Return a random suggestion
  return allTips[Math.floor(Math.random() * allTips.length)];
}



function generateAIInsights(notes) {
  if (!notes.length) return "No notes available for generating insights.";

  const totalTasks = notes.length;
  const completedTasks = notes.filter(note => note.isCompleted).length;
  const incompleteTasks = totalTasks - completedTasks;
  const highPriorityTasks = notes.filter(note => note.priority === 'high').length;

  // Calculate time spent and time left
  const timeSpent = notes.reduce((total, note) => {
    const start = new Date(note.startDate);
    const end = new Date(note.endDate);
    return total + (end - start);
  }, 0);

  const timeLeft = notes.reduce((total, note) => {
    const now = new Date();
    const end = new Date(note.endDate);
    return end > now ? total + (end - now) : total;
  }, 0);

  // Convert milliseconds to hours for readability
  const timeSpentHours = (timeSpent / (1000 * 60 * 60)).toFixed(2);
  const timeLeftHours = (timeLeft / (1000 * 60 * 60)).toFixed(2);

  const insights = [
    `You have a total of ${totalTasks} tasks logged.`,
    `${completedTasks} task(s) are completed, while ${incompleteTasks} are still pending.`,
    `There are ${highPriorityTasks} high-priority task(s) demanding your attention.`,
    `You have spent approximately ${timeSpentHours} hours working on tasks so far.`,
    `You have around ${timeLeftHours} hours left for the remaining tasks.`,
    "Consider focusing on high-priority tasks to optimize your productivity.",
    "Great job completing tasks on time! Keep up the momentum."
  ];

  return insights;
}

module.exports = {
  summarizeNotes,
  detectPriority,
  analyzeSentiment,
  lifestyleSuggestions,
  timeManagementTips,
  productivityToolsSuggestion,
  generateAIInsights
};
