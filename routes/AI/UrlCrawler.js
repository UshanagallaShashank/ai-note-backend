const express = require('express');
const FirecrawlApp = require('@mendable/firecrawl-js').default;

const router = express.Router();


/**
 * POST /api/crawl-solutions
 * Body: { url: "problem-solutions-url" }
 * Description: Crawls the given LeetCode problem solutions page and filters out URLs containing 'by-leetcode'.
 *              Returns up to 6 valid solution URLs.
 */
router.post('/crawl-sol', async (req, res) => {
  try {

    const apiKeys = process.env.FIRECRAWL_API_KEYS ? process.env.FIRECRAWL_API_KEYS.split(',') : [];
    const crawlapi = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    const firecrawl = new FireCrawlApp({ apiKey: crawlapi });
    const { slug } = req.body;
    const url = `https://leetcode.com/problems/${slug}/solutions/`;

    // Validate that URL is provided
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing URL in the request body.' });
    }

    // Crawl the provided URL
    const crawlResult = await firecrawl.crawlUrl(url, {
      limit: 1,
	maxDepth: 2,
	includePaths: [ url ],
	ignoreSitemap: true,
	scrapeOptions: {
		formats: [  "links" ],
		onlyMainContent: false,
		waitFor: 100
      }
    });

    // Filter the URLs based on criteria:
    // - URL must contain '/solutions/'

     // Access the array of links
let validUrls=crawlResult.data[0].links;
    // Now you can filter the links
    if (crawlResult && crawlResult.data && Array.isArray(crawlResult.data) && crawlResult.data.length > 0) {
        const linksArray = crawlResult.data[0].links; // Access the array of links
        
         validUrls = linksArray
  .filter(link => 
    new RegExp(`/leetcode.com/problems/${slug}/solutions/[^/\\s]+`).test(link)  // Ensure there is something after /solutions/
    && !link.includes('by-leetcode') 
    && !link.includes('video') 
    && link.trim() !== ''
  )
  .slice(0, 6); 
      
      } else {
        console.error('Expected data structure is not available:', crawlResult);
      }

    // Return the filtered URLs
    res.json({ success: true, data: validUrls });
  } catch (error) {
    console.error('Error crawling solution URLs:', error);
    res.status(500).json({ error: 'An error occurred while crawling the solution URLs.' });
  }
});

module.exports = router;
