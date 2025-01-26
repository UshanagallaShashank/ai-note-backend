const express = require('express');
const FireCrawlApp = require('@mendable/firecrawl-js').default;
const { z } = require('zod');
require('dotenv').config();

const router = express.Router();

// Initialize FireCrawlApp with API key from the environment variable
const firecrawl = new FireCrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

/**
 * POST /api/extract-solution
 * Body: { url: "solution-page-url" }
 * Description: Extracts the programming language, approach description, and code from a LeetCode solution page.
 */
router.post('/ex', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate that URL is provided
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing URL in the request body.' });
    }

    // Define schema for validation
    const schema = z.object({
      solution: z.object({
        language: z.string(),
        approach: z.string().optional(),
        code: z.string(),
      }),
    });

    // Use FireCrawl to extract data from the provided URL
    const extractResult = await firecrawl.extract([url], {
      prompt: "Extract the programming language, approach description, and code from the solution page. The language and code fields are required.",
      schema,
    });

    // Respond with the extracted data
    res.json({ success: true, data: extractResult });
  } catch (error) {
    console.error('Error extracting solution data:', error);
    res.status(500).json({ error: 'An error occurred while extracting solution data.' });
  }
});

module.exports = router;
