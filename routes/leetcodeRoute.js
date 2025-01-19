const express = require('express');
const fetchRandomQuestions = require("../utils/fetchleetcode")
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Function to fetch detailed information for a single problem by titleSlug
const fetchSingleProblem = async (titleSlug) => {
  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
      },
      body: JSON.stringify({
        query: getSingleProblemQuery,
        variables: { titleSlug },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(JSON.stringify(result.errors));
    }

    return result.data.question;
  } catch (err) {
    console.error('Error fetching single problem:', err.message);
    throw new Error('Failed to fetch problem details');
  }
};


router.post('/fetch-random-question', async (req, res) => {
  const { difficulty } = req.body;

  if (!difficulty) {
    return res.status(400).json({ message: 'Difficulty is required' });
  }

  try {
    const data = await fetchRandomQuestions();

    if (!data) {
      return res.status(500).json({ message: 'Failed to fetch questions' });
    }

    // Filter questions based on difficulty
    const filteredQuestions = data.filter((q) => q.difficulty === difficulty);

    if (filteredQuestions.length === 0) {
      return res.status(404).json({ message: 'No questions found for the specified difficulty' });
    }

    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];

    res.json(randomQuestion); // Sending the randomly selected question as the response
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GraphQL query to fetch detailed information of a problem by titleSlug
const getSingleProblemQuery = `#graphql
query selectProblem($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        boundTopicId
        title
        titleSlug
        content
        translatedTitle
        translatedContent
        isPaidOnly
        difficulty
        likes
        dislikes
        isLiked
        similarQuestions
        exampleTestcases
        contributors {
            username
            profileUrl
            avatarUrl
        }
        topicTags {
            name
            slug
            translatedName
        }
        companyTagStats
        codeSnippets {
            lang
            langSlug
            code
        }
        stats
        hints
        solution {
            id
            canSeeDetail
            paidOnly
            hasVideoSolution
            paidOnlyVideo
        }
        status
        sampleTestCase
        metaData
        judgerAvailable
        judgeType
        mysqlSchemas
        enableRunCode
        enableTestMode
        enableDebugger
        envInfo
        libraryUrl
        adminUrl
        challengeQuestion {
            id
            date
            incompleteChallengeCount
            streakCount
            type
        }
        note
    }
}`;


router.post('/singleproblem', async (req, res) => {
  const { difficulty } = req.body;

  if (!difficulty) {
    return res.status(400).json({ error: 'difficulty is required' });
  }

  let data = "", filteredQuestions = "";
  try {
    data = await fetchRandomQuestions();
    if (!data) {
      return res.status(500).json({ message: 'Failed to fetch questions' });
    }

    filteredQuestions = await data.filter((q) => q.difficulty === difficulty);

    if (filteredQuestions.length === 0) {
      return res.status(404).json({ message: 'No questions found for the specified difficulty' });
    }
  } catch (e) {
    console.log("error", e);
  }

  const randomQuestion = await filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];

  const problemValue = await randomQuestion.titleSlug;
  if (!problemValue) {
    return res.status(400).json({ error: 'Missing "problemValue" query parameter' });
  }

  try {
    console.log(`Fetching details for problem: ${problemValue}`);
    const problemDetails = await fetchSingleProblem(problemValue);
    let innerHTML = await problemDetails.content.replace(/\n/g, '');
    innerHTML = innerHTML.replace(/<strong>/g, '<br>').replace(/<\/strong>/g, '');

    innerHTML = innerHTML.replace(/<p>/g, '<p class="inner-element">');
    innerHTML = innerHTML.replace(/<strong class="example">/g, '<strong class="inner-element">');
    innerHTML = innerHTML.replace(/<pre>/g, '<pre class="inner-element">');
    // innerHTML = innerHTML.replace(/<ul>/g, '<ul class="inner-element">');
    // innerHTML = innerHTML.replace(/<li>/g, '<li class="inner-element">');

    const newHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${problemDetails.title}</title>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
       body {
  font-family: 'JetBrains Mono', monospace;
  background-color: #2e2e2e;
  color: #f5f5f5;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  overflow-x: auto;  /* Allow horizontal scroll */
  overflow-y: auto;  /* Allow vertical scroll */
  box-sizing: border-box;
}

.container {
  width: 90%;
  max-width: 1200px;
  background-color: #333333;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.7);
  margin: 20px auto;
  height: auto;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal scrolling beyond the container */
}

h1 {
  text-align: center;
  font-size: 40px;
  color: #76c7c0;
  margin-bottom: 20px;
}

.content {
  font-size: 18px;
  color: #f5f5f5;
  line-height: 1.8;
  word-wrap: break-word;
  width: 100%;
  overflow-wrap: break-word;
  padding-right: 10px;
  box-sizing: border-box;
  white-space: normal; /* Ensure text within .content wraps */
  overflow-x: hidden;  /* Ensure no horizontal overflow */
  max-height: 80vh;  /* Make the content scrollable vertically */
}

.inner-element {
  word-wrap: break-word; 
  overflow: hidden;
  white-space: normal; /* Allow wrapping inside the inner-element */
}

ul.inner-element {
  list-style-type: disc;  /* Big dot */
  padding-left: 20px;
}

li.inner-element {
  margin-bottom: 8px;
}

footer {
  margin-top: 40px;
  font-size: 14px;
  color: #888;
  text-align: center;
}

footer a {
  color: #76c7c0;
  text-decoration: none;
}

@media (max-width: 768px) {
  .container {
    width: 95%;
    padding: 20px;
  }

  h1 {
    font-size: 32px;
  }

  .content {
    font-size: 16px;
  }
}

      </style>
    </head>
    <body>
      <div class="container">
        <h1>${problemDetails.title}</h1>
        <div class="content">
          ${innerHTML}
        </div>
        <footer>
          Generated using <a href="https://graphql.org/" target="_blank">GRAPHQL</a>
        </footer>
      </div>
    </body>
    </html>`;

    // Clean up the unwanted characters (newlines, tabs, etc.)
    const cleanHTML = await newHTML
      .replace(/\n/g, '')  // Remove newlines
      .replace(/\t/g, '')  // Remove tabs
      .replace(/\\"/g, '"'); // Unescape double quotes

    res.setHeader('Content-Type', 'text/html');
    return res.send(cleanHTML); // Send the cleaned HTML
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Failed to fetch problem details',
      message: err.message,
    });
  }
});

// Route to fetch a single problem's details by titleSlug
router.get('/problemwithslug/:title_slug', async (req, res) => {
  const { title_slug } = req.params;
  try {
    console.log(`Fetching details for problem: ${title_slug}`);
    const problemDetails = await fetchSingleProblem(title_slug);
    let innerHTML = problemDetails.content.replace(/\n/g, '');
    innerHTML = innerHTML.replace(/<strong>/g, '<br>').replace(/<\/strong>/g, '');

    innerHTML = innerHTML.replace(/<p>/g, '<p class="inner-element">');
    innerHTML = innerHTML.replace(/<strong class="example">/g, '<strong class="inner-element">');
    innerHTML = innerHTML.replace(/<pre>/g, '<pre class="inner-element">');

    const newHTML = `
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>${problemDetails.title}</title>
       <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
       <style>
        body {
   font-family: 'JetBrains Mono', monospace;
   background-color: #2e2e2e;
   color: #f5f5f5;
   margin: 0;
   padding: 0;
   display: flex;
   justify-content: center;
   align-items: flex-start;
   min-height: 100vh;
   overflow-x: auto;  /* Allow horizontal scroll */
   overflow-y: auto;  /* Allow vertical scroll */
   box-sizing: border-box;
 }
 
 .container {
   width: 90%;
   max-width: 1200px;
   background-color: #333333;
   padding: 40px;
   border-radius: 12px;
   box-shadow: 0 8px 20px rgba(0,0,0,0.7);
   margin: 20px auto;
   height: auto;
   box-sizing: border-box;
   overflow-x: hidden; /* Prevent horizontal scrolling beyond the container */
 }
 
 h1 {
   text-align: center;
   font-size: 40px;
   color: #76c7c0;
   margin-bottom: 20px;
 }
 
 .content {
   font-size: 18px;
   color: #f5f5f5;
   line-height: 1.8;
   word-wrap: break-word;
   width: 100%;
   overflow-wrap: break-word;
   padding-right: 10px;
   box-sizing: border-box;
   white-space: normal; /* Ensure text within .content wraps */
   overflow-x: hidden;  /* Ensure no horizontal overflow */
   max-height: 80vh;  /* Make the content scrollable vertically */
 }
 
 .inner-element {
   word-wrap: break-word; 
   overflow: hidden;
   white-space: normal; /* Allow wrapping inside the inner-element */
 }
 
 ul.inner-element {
   list-style-type: disc;  /* Big dot */
   padding-left: 20px;
 }
 
 li.inner-element {
   margin-bottom: 8px;
 }
 
 footer {
   margin-top: 40px;
   font-size: 14px;
   color: #888;
   text-align: center;
 }
 
 footer a {
   color: #76c7c0;
   text-decoration: none;
 }
 
 @media (max-width: 768px) {
   .container {
     width: 95%;
     padding: 20px;
   }
 
   h1 {
     font-size: 32px;
   }
 
   .content {
     font-size: 16px;
   }
 }
 
       </style>
     </head>
     <body>
       <div class="container">
         <h1>${problemDetails.title}</h1>
         <div class="content">
           ${innerHTML}
         </div>
         <footer>
           Generated using <a href="https://graphql.org/" target="_blank">GRAPHQL</a>
         </footer>
       </div>
     </body>
     </html>`;

    // Clean up the unwanted characters (newlines, tabs, etc.)
    const cleanHTML = newHTML
      .replace(/\n/g, '')  // Remove newlines
      .replace(/\t/g, '')  // Remove tabs
      .replace(/\\"/g, '"'); // Unescape double quotes

    res.setHeader('Content-Type', 'text/html');
    return res.send(cleanHTML);
    // return res.json(problemDetails);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Failed to fetch problem details',
      message: err,
    });
  }
});



module.exports = router;



