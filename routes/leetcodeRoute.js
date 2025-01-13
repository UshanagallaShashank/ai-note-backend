const express = require('express');
const fetchRandomQuestions=require("../utils/fetchleetcode")
const router = express.Router();
const { chromium } = require('playwright-chromium');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');
const cheerio = require('cheerio');

router.post('/capture-screenshot', async (req, res) => {

  const { difficulty } = req.body; 

  if (!difficulty) {
    return res.status(400).json({ message: 'Difficulty is required' });
  }
let data="",filteredQuestions=""
  try {
     data = await fetchRandomQuestions();

    if (!data) {
      return res.status(500).json({ message: 'Failed to fetch questions' });
    }

     filteredQuestions = data.filter((q) => q.difficulty === difficulty);

    if (filteredQuestions.length === 0) {
      return res.status(404).json({ message: 'No questions found for the specified difficulty' });
    }
  }catch(e){
    console.log("error",e)
  }

      const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
 

  const problemValue = randomQuestion.titleSlug;
  if (!problemValue) {
    return res.status(400).json({ error: 'Missing "problemValue" query parameter' });
  }

  const url = `https://leetcode.com/problems/${problemValue}/description`;

  const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--no-sandbox'] });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  });

  try {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1600, height: 2000 }); 


    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await  page.waitForSelector('.elfjS',{timeout:5000});

    let retries = 3;
    let elements = [];
    while (retries > 0) {
      elements = await page.$$('.elfjS');
      if (elements.length > 0) break;
      retries--;
      if (retries > 0) {
        console.log("Retrying to find .elfjS element...");
        await page.reload({ waitUntil: 'domcontentloaded' });
      }
    }

    if (elements.length === 0) {
      console.log('Element with class ".elfjS" not found after retries.');
      await browser.close();
      return res.status(404).json({ error: 'Element not found' });
    }


    const firstElement = elements[0];
    let innerHTML = await firstElement.innerHTML();


    innerHTML = innerHTML.replace(/<(\w+)/g, '<$1 class="inner-element"'); 


    const newHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Captured Element Screenshot</title>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'JetBrains Mono', monospace;
            background-color: #2e2e2e;
            color: #f5f5f5;
            margin: 0;
            padding: 40px 0 0 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            height: 100vh;
            overflow: hidden;
          }
          .container {
            width: 90%;
            max-width: 1200px;
            background-color: #333333;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.7);
          }
          h1 {
            text-align: center;
            font-size: 40px;
            color: #76c7c0;
            margin-bottom: 20px;
          }
          .content {
            font-size: 20px;
            color: #f5f5f5;
            line-height: 1.8;
            word-wrap: break-word;
            overflow: auto;
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

        </style>
      </head>
      <body>
        <div class="container">
          <h1>Captured Content</h1>
          <div class="content">
            ${innerHTML}
          </div>
          <footer>
            Generated using <a href="https://playwright.dev" target="_blank">Playwright</a>
          </footer>
        </div>
      </body>
      </html>
    `;

    // Set content and capture screenshot
    await page.setContent(newHTML);
    const imagesDir = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Construct the screenshot path dynamically based on problemValue
    const screenshotPath = path.join(imagesDir, `${problemValue}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    res.sendFile(screenshotPath, () => {
      fs.unlinkSync(screenshotPath);
    });
   
  } catch (error) {
    console.error('Error during screenshot capture:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  finally{
    await browser.close();
  }
});

// const express = require('express');
// const puppeteer = require('puppeteer'); // Import puppeteer here
// const router = express.Router();

// Your route logic


// router.post('/capture-screenshot', async (req, res) => {
//   const { difficulty } = req.body;

//   if (!difficulty) {
//     return res.status(400).json({ error: 'Difficulty is required' });
//   }

//   try {
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--disable-setuid-sandbox",
//         "--no-sandbox",
//         "--single-process",
//         "--no-zygote",
//       ],
//       executablePath:
//       process.env.NODE_ENV === "production"
//         ? process.env.PUPPETEER_EXECUTABLE_PATH
//         : puppeteer.executablePath(),
//     });
//     const page = await browser.newPage();

//     const url = 'https://leetcode.com/problems/two-sum/'; // Example URL
//     await page.goto(url, { waitUntil: 'domcontentloaded' });

//     await page.screenshot({ path: 'screenshot.png', fullPage: true });

//     res.sendFile('screenshot.png', { root: __dirname }, () => {
//       fs.unlinkSync('screenshot.png'); // Clean up after sending
//     });

//     await browser.close();
//     res.status(200).json({message:"suuccess"})
//   } catch (error) {
//     console.error('Error during screenshot capture:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// router.post('/capture-data', async (req, res) => {
//   const { difficulty } = req.body;

//   if (!difficulty) {
//     return res.status(400).json({ error: 'Difficulty is required' });
//   }

//   try {
//     const url = 'https://leetcode.com/problems/two-sum/'; 
//     const { data: html } = await axios.get(url, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//       },
//     });

//     // Load the HTML into Cheerio for parsing
//     const $ = cheerio.load(html);

//     // Extract content based on selectors
//     const title = $('div.css-v3d350 h4').text(); // Example: Update with correct selector
//     const description = $('div.content__u3I1').text(); // Update selector based on the LeetCode page structure
//     const constraints = $('div.constraints__u3I1').text();

//     // Return the extracted data
//     res.status(200).json({
//       title: title.trim(),
//       description: description.trim(),
//       constraints: constraints.trim(),
//     });
//   } catch (error) {
//     console.error('Error during data capture:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


router.post('/fetch-random-question', authMiddleware,async (req, res) => {
  const { difficulty } = req.body; // Extracting the difficulty from the body of the POST request

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

    // Randomly select a question
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];

    res.json(randomQuestion); // Sending the randomly selected question as the response
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});






///-----------------------------------------------------------------------------------------------------------------------------------
// // GraphQL query to fetch list of problems
// const getProblemsQuery = `#graphql
// query getProblems($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
//     problemsetQuestionList: questionList(
//         categorySlug: $categorySlug
//         limit: $limit
//         skip: $skip
//         filters: $filters
//     ) {
//         total: totalNum
//         questions: data {
//             acRate
//             difficulty
//             questionFrontendId
//             title
//             titleSlug
//             topicTags {
//                 name
//                 id
//                 slug
//             }
//             hasSolution
//             hasVideoSolution
//         }
//     }
// }`;

// // GraphQL query to fetch detailed information of a problem by titleSlug
// const getSingleProblemQuery = `#graphql
// query selectProblem($titleSlug: String!) {
//     question(titleSlug: $titleSlug) {
//         questionId
//         questionFrontendId
//         boundTopicId
//         title
//         titleSlug
//         content
//         translatedTitle
//         translatedContent
//         isPaidOnly
//         difficulty
//         likes
//         dislikes
//         isLiked
//         similarQuestions
//         exampleTestcases
//         contributors {
//             username
//             profileUrl
//             avatarUrl
//         }
//         topicTags {
//             name
//             slug
//             translatedName
//         }
//         companyTagStats
//         codeSnippets {
//             lang
//             langSlug
//             code
//         }
//         stats
//         hints
//         solution {
//             id
//             canSeeDetail
//             paidOnly
//             hasVideoSolution
//             paidOnlyVideo
//         }
//         status
//         sampleTestCase
//         metaData
//         judgerAvailable
//         judgeType
//         mysqlSchemas
//         enableRunCode
//         enableTestMode
//         enableDebugger
//         envInfo
//         libraryUrl
//         adminUrl
//         challengeQuestion {
//             id
//             date
//             incompleteChallengeCount
//             streakCount
//             type
//         }
//         note
//     }
// }`;

// // Function to fetch a list of problems
// // const fetchProblems = async (options, res) => {
// //   try {
// //     const limit = options.limit || 20;
// //     const skip = options.skip || 0;
// //     const tags = options.tags ? options.tags.split(' ') : [];
// //     const difficulty = options.difficulty || '';
// //     const title = options.title || '';

// //     const response = await fetch('https://leetcode.com/graphql', {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         Referer: 'https://leetcode.com',
// //       },
// //       body: JSON.stringify({
// //         query: getProblemsQuery,
// //         variables: {
// //           categorySlug: '',
// //           skip,
// //           limit,
// //           filters: { title, tags, difficulty },
// //         },
// //       }),
// //     });

// //     const result = await response.json();

// //     if (result.errors) {
// //       return res.status(400).json(result.errors);
// //     }

// //     if (!result.data || !result.data.problemsetQuestionList || !result.data.problemsetQuestionList.questions) {
// //       return res.status(500).json({ error: 'No problems found or invalid response format' });
// //     }

// //     return result.data.problemsetQuestionList.questions;
// //   } catch (err) {
// //     console.error('Error:', err);
// //     return res.status(500).json({ error: 'Internal server error' });
// //   }
// // };

// // Function to fetch problems
// const fetchProblems = async (options, res) => {
//   try {
//     const limit = options.skip !== undefined && options.limit === undefined ? 1 : options.limit || 20;
//     const skip = options.skip || 0;
    
//     // Ensure tags is a string if it’s an array
//     const tags = Array.isArray(options.tags) ? options.tags.join(' ') : options.tags || '';  // Convert array to a space-separated string

//     const difficulty = options.difficulty || undefined;
//     const title = options.title || undefined;
//     const titleSlug = options.titleSlug || undefined;
//     const slug = options.slug || undefined;

//     const response = await fetch('https://leetcode.com/graphql', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Referer: 'https://leetcode.com',
//       },
//       body: JSON.stringify({
//         query: query,
//         variables: {
//           categorySlug: '',
//           skip,
//           limit,
//           filters: { title, titleSlug, slug, tags, difficulty },
//         },
//       }),
//     });

//     const result = await response.json();

//     if (result.errors) {
//       return res.status(400).json(result.errors);
//     }
//     return result.data.problemsetQuestionList.questions; // Return the array of questions
//   } catch (err) {
//     console.error('Error fetching problems:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };



// // Function to fetch detailed information for a single problem by titleSlug
// const fetchSingleProblem = async (titleSlug, res) => {
//   try {
//     const response = await fetch('https://leetcode.com/graphql', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Referer: 'https://leetcode.com',
//       },
//       body: JSON.stringify({
//         query: getSingleProblemQuery,
//         variables: { titleSlug },
//       }),
//     });

//     const result = await response.json();

//     if (result.errors) {
//       return res.status(400).json(result.errors);
//     }

//     return result.data.question;
//   } catch (err) {
//     console.error('Error:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Route to fetch problems and their details
// router.get('/problems', async (req, res) => {
//   console.log("Started fetching problems");

//   const options = {
//     limit: 1,
//     skip: 0,
//     tags: ['Array'],
//     difficulty: 'EASY',
//   };

//   try {
//     // Fetch the list of problems
//     const problems = await fetchProblems(options, res);

//     // Log the fetched problems to understand its structure
//     console.log('Fetched problems:', problems);

//     // Ensure that problems is an array before attempting to iterate
//     if (!Array.isArray(problems)) {
//       console.error('Problems is not an array:', problems);
//       return res.status(500).json({ message: 'Unexpected response format: problems is not an array' });
//     }

//     const problemDetails = [];

//     // Iterate over problems to fetch details
//     for (const problem of problems) {
//       const { titleSlug } = problem;
//       console.log('Fetching details for problem:', titleSlug);

//       try {
//         const details = await fetchSingleProblem(titleSlug, res);
//         console.log('Fetched details for problem:', titleSlug);
//         problemDetails.push(details);
//       } catch (err) {
//         console.error(`Error fetching details for problem: ${titleSlug}`, err);
//         problemDetails.push({
//           titleSlug,
//           error: `Failed to fetch details for ${titleSlug}`,
//         });
//       }
//     }

//     // Only send the final response once
//     console.log('Sending final response with problems and details');
//     return res.json({
//       problems,
//       problemDetails,
//     });

//   } catch (err) {
//     console.error('Error fetching problems:', err);
//     return res.status(500).json({
//       error: 'Failed to fetch problems',
//       message: err.message,
//     });
//   }
// });


module.exports = router;



