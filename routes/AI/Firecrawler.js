const express = require('express');
const router = express.Router();
const FirecrawlApp = require('@mendable/firecrawl-js').default;

// Initialize FirecrawlApp with the API key from .env
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

/**
 * POST /api/scrape/editorial
 * Body: { slug: "problem-slug" }
 * Description: Scrapes the editorial page of a LeetCode problem and returns solutions grouped by language.
 */
router.post('/editorial', async (req, res) => {
  try {
    const { slug } = req.body;

    // Validate the slug
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing slug in the request body.' });
    }

    // Construct the LeetCode editorial URL
    const url = `https://leetcode.com/problems/${slug}/editorial/`;
    console.log("url",url);
    // Scrape the editorial page
    const scrapeResult = await firecrawl.scrapeUrl(url, { formats: ['markdown'] });
    console.log("scraoeResult",scrapeResult);

    if (!scrapeResult.success) {
      return res.status(500).json({ error: `Failed to scrape: ${scrapeResult.error}` });
    }

    // Extract solutions grouped by language
    const solutions = {};
    const codeBlocks = scrapeResult.markdown.match(/```[\s\S]*?```/g) || [];

    codeBlocks.forEach((block) => {
      const languageMatch = block.match(/```(\w+)/);
      const language = languageMatch ? languageMatch[1].toLowerCase() : 'unknown';
      const code = block.replace(/```[\w\s]*\n/, '').replace(/```$/, '').trim();

      // Add the code to the solutions object, grouped by language
      if (language !== 'unknown') {
        solutions[language] = code;
      }
    });

    // Return the solutions as JSON
    res.json({ slug, url, solutions });
  } catch (error) {
    console.error('Error scraping the editorial:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

module.exports = router;
