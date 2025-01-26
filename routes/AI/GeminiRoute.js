// const express = require('express');
// const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
// require('dotenv').config(); // Load environment variables from .env

// const router = express.Router();

// const model = new ChatGoogleGenerativeAI({
//   model: 'gemini-pro',  // Ensure this model is supported
//   maxOutputTokens: 2048,
//   apiKey: process.env.GOOGLE_API_KEY // Use the API key from the .env file
// });

// router.post('/prompts', async (req, res) => {
//   const { prompt } = req.body;
//   try {
//     const response = await generateResponse(prompt);
//     res.status(200).json({ response: response });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     console.error(error);
//   }
// });

// async function generateResponse(prompt) {
//   try {
//     const response = await model.invoke(prompt);
//     console.log(response.content);
//     return response.content;
//   } catch (error) {
//     console.error('Error invoking model:', error);
//     throw new Error('Failed to generate response'); // Throwing error for proper handling
//   }
// }

// // Function to list available models (for debugging purposes)
// async function listAvailableModels() {
//   try {
//     const models = await model.listModels(); // Ensure `listModels` is available in the SDK
//     console.log('Available Models:', models);
//   } catch (error) {
//     console.error('Error fetching models:', error);
//   }
// }

// // Uncomment below if you want to see available models during testing
// // listAvailableModels();

// module.exports = router;

//------------------------------------------------------------------------------------------------------------------------

// const express = require('express');
// const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
// const FirecrawlApp = require('@mendable/firecrawl-js').default;
// require('dotenv').config();

// const router = express.Router();

// // Initialize FirecrawlApp
// const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

// // Initialize Google Generative AI model
// const model = new ChatGoogleGenerativeAI({
//   model: 'gemini-pro', // Ensure this model is supported
//   maxOutputTokens: 2048,
//   apiKey: process.env.GOOGLE_API_KEY, // Use the API key from the .env file
// });

// /**
//  * POST /api/scrape-and-process
//  * Body: { slug: "problem-slug", language: "python" }
//  * Description: Scrapes the LeetCode editorial page, passes the markdown content to Google Generative AI with specific language request, and returns the cleaned code output.
//  */
// router.post('/scrape-and-process', async (req, res) => {
//   try {
//     const { slug, language } = req.body;

//     // Validate slug and language
//     if (!slug || typeof slug !== 'string') {
//       return res.status(400).json({ error: 'Invalid or missing slug in the request body.' });
//     }
//     if (!language || typeof language !== 'string') {
//       return res.status(400).json({ error: 'Invalid or missing language in the request body.' });
//     }

//     // Construct LeetCode editorial URL
//     const url = `https://leetcode.com/problems/${slug}/editorial/`;

//     // Scrape the editorial page
//     const scrapeResult = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });

//     if (!scrapeResult.success) {
//       return res.status(500).json({ error: `Failed to scrape: ${scrapeResult.error}` });
//     }

//     // Extract markdown content
//     let markdownContent = scrapeResult.markdown;

//     // Clean the content: Remove unwanted characters, HTML tags, and code snippets
//     markdownContent = cleanContent(markdownContent);

//     // Pass markdown to Google Generative AI with language prompt
//     const aiResponse = await generateResponseFromAI(markdownContent, language);

//     // Return AI response as JSON
//     res.json({ slug, url, language, aiResponse });
//   } catch (error) {
//     console.error('Error in scrape-and-process route:', error);
//     res.status(500).json({ error: 'An error occurred while processing your request.' });
//   }
// });

// // Function to interact with Google Generative AI
// async function generateResponseFromAI(markdown, language) {
//   try {
//     const prompt = `Given the following problem description, provide a solution in ${language}:\n${markdown} set classname as Solution   and also once run the code using all the cases and change accordingly if needed i need public class Solution for sure`;
//     const response = await model.invoke(prompt);
//     console.log('AI Response:', response.content);
//     return response.content; // Return AI-generated output
//   } catch (error) {
//     console.error('Error invoking Google Generative AI:', error);
//     throw new Error('Failed to generate AI response');
//   }
// }

// // Function to clean the markdown content (removes unwanted elements)
// function cleanContent(content) {
//   // Remove unwanted \n, ``` and other unwanted sections (like HTML, extra spaces)
//   let cleanedContent = content
//     // .replace(/```\s*/g, '') // Remove code block indicators
//     // .replace(/\n/g, ' ') // Remove newlines
//     // .replace(/<[^>]+>/g, '') // Remove HTML tags
//     // .replace(/reCAPTCHA|Recaptcha|Privacy|Terms/g, '') // Remove reCAPTCHA, Privacy, and Terms
//     // .replace(/(Comments|Reply|Sort by|Read more)/g, '') // Remove comment-related sections
//     // .replace(/\s+/g, ' ') // Condense multiple spaces into one
//     .trim(); // Trim any leading/trailing spaces

//   // Return cleaned content
//   return cleanedContent;
// }

// module.exports = router;







//------------------------------------------------------------------------------------------------------------------


const express = require('express');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const FirecrawlApp = require('@mendable/firecrawl-js').default;
const cookieParser = require('cookie-parser'); // Add this line
require('dotenv').config();

const router = express.Router();

// Use cookie-parser middleware to parse cookies in the request
router.use(cookieParser());

// Initialize FirecrawlApp with API key
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

// Initialize Google Generative AI model
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-pro', // Ensure this model is supported
  maxOutputTokens: 2048,
  apiKey: process.env.GOOGLE_API_KEY, // Use the API key from the .env file
});

/**
 * POST /api/scrape-and-process
 * Body: { slug: "problem-slug", language: "java" }
 * Description: Scrapes the LeetCode solution page (not editorial), passes the markdown content to Google Generative AI,
 *              and returns the processed output for a specific language.
 */
router.post('/scrape-and-process', async (req, res) => {
  try {
    const { slug, language } = req.body;

    // Validate input
    if (!slug || !language || typeof slug !== 'string' || typeof language !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing slug or language in the request body.' });
    }

    // Get the LEETCODE_SESSION cookie from the request
    const leetcodeSessionCookie = req.cookies.LEETCODE_SESSION;

    if (!leetcodeSessionCookie) {
      return res.status(400).json({ error: 'LEETCODE_SESSION cookie is missing.' });
    }

    // Extract URL using Firecrawl (slugname-based link)
    const extractedUrls = await extractUrlsFromSlug(slug, leetcodeSessionCookie);

    // Find the first valid URL (excluding the editorial URL)
    const url = extractedUrls[0];

    if (!url) {
      return res.status(404).json({ error: 'No valid solution URL found for the given slug.' });
    }

    // Scrape the solution page (not editorial)
    const scrapeResult = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });

    if (!scrapeResult.success) {
      return res.status(500).json({ error: `Failed to scrape: ${scrapeResult.error}` });
    }

    // Extract markdown content
    const markdownContent = scrapeResult.markdown;

    // Generate code for the specified language
    const aiResponse = await generateResponseFromAI(markdownContent, language);

    // Return the AI-generated response (code) for the specified language
    res.json({ slug, url, language, code: aiResponse });
  } catch (error) {
    console.error('Error in scrape-and-process route:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

/**
 * Function to extract solution URLs from a given slugname using Firecrawl.
 * @param {string} slug - The LeetCode problem slug.
 * @param {string} leetcodeSessionCookie - The LEETCODE_SESSION cookie.
 * @returns {Promise<string[]>} - A list of URLs extracted by Firecrawl.
 */
async function extractUrlsFromSlug(slug, leetcodeSessionCookie) {
  try {
    // Updated schema: Expecting a list of string content (urls)
    const schema = {
      content: ['string'],
    };

    const result = await firecrawl.extract(
      [`https://leetcode.com/problems/${slug}/solutions`],
      {
        prompt: `get me the links and open only the first URL on a virtual machine which has the slugname from URL
and get me the Java code and ensure the URL doesn't end with 'editorial/'`,
        schema: schema,  // Correct schema structure
        headers: {
          'Cookie': `LEETCODE_SESSION=${leetcodeSessionCookie}`  // Set the LEETCODE_SESSION cookie
        }
      }
    );

    // Extract URLs, filtering out any URL that ends with 'editorial/'
    const validUrls = result.content
      .filter((url) => !url.includes('editorial/'))
      .map((url) => url.trim());

    return validUrls;
  } catch (error) {
    console.error('Error extracting URLs:', error);
    throw new Error('Failed to extract URLs');
  }
}

/**
 * Function to interact with Google Generative AI for generating code for a specified language.
 * @param {string} markdown - The markdown content extracted from the LeetCode solution page.
 * @param {string} language - The target programming language (e.g., 'java', 'python').
 * @returns {Promise<string>} - The generated code for the specified language.
 */
async function generateResponseFromAI(markdown, language) {
  try {
    const prompt = `Extract the solution in ${language} code from the following markdown:\n\n${markdown}`;

    const response = await model.invoke(prompt);

    // Filter out unwanted code and return only the relevant code block for the specified language
    return filterCodeByLanguage(response.content, language);
  } catch (error) {
    console.error('Error invoking Google Generative AI:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Function to filter the AI content to include only the code for the specified language.
 * @param {string} content - The full content generated by AI.
 * @param {string} language - The target programming language.
 * @returns {string} - The filtered code for the specified language.
 */
function filterCodeByLanguage(content, language) {
  const regex = new RegExp(`\`\`\`${language}([\s\S]*?)\`\`\``, 'i');
  const match = content.match(regex);

  return match ? match[1].trim() : 'Code not found for the specified language.';
}

module.exports = router;
