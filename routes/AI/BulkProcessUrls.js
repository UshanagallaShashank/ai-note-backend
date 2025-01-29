// const express = require('express');
// const router = express.Router();
// const FireCrawlApp = require('@mendable/firecrawl-js').default;
// const SolutionSet = require('../models/SolutionSet');
// const { z } = require('zod');

// // Reusable extraction function
// async function extractSolutionCode(url) {
//   const apiKeys = process.env.FIRECRAWL_API_KEYS ? process.env.FIRECRAWL_API_KEYS.split(',') : [];
//   if (apiKeys.length === 0) {
//     throw new Error('No API keys available for FireCrawl');
//   }

//   // Select a random API key for each request
//   const crawlapi = apiKeys[Math.floor(Math.random() * apiKeys.length)];
//   const firecrawl = new FireCrawlApp({ apiKey: crawlapi });

//   const schema = z.object({
//     solution: z.object({
//       language: z.string(),
//       approach: z.string().optional(),
//       code: z.string(),
//     }),
//   });

//   const extractResult = await firecrawl.extract([url], {
//     prompt: "Extract the programming language, approach description, and code from the solution page. The language and code fields are required.",
//     schema,
//   });

//   return extractResult.data[0]?.result?.solution;
// }

// // New route to process multiple URLs
// router.post('/process-solutions', async (req, res) => {
//   try {
//     const { slug, urls } = req.body;

//     // Validation
//     if (!slug || !urls || !Array.isArray(urls) || urls.length === 0) {
//       return res.status(400).json({ error: 'Invalid request format' });
//     }

//     // Process all URLs in parallel with fresh API keys
//     const extractionPromises = urls.map(url => 
//       extractSolutionCode(url)
//         .then(code => ({ url, code }))
//         .catch(error => {
//           console.error(`Error extracting ${url}:`, error);
//           return null;
//         })
//     );

//     const results = await Promise.all(extractionPromises);
    
//     // Filter out failed extractions and format data
//     const validSolutions = results
//       .filter(result => result?.code)
//       .map(({ url, code }) => ({
//         ...code,
//         sourceUrl: url
//       }));

//     // Save to MongoDB
//     const solutionSet = new SolutionSet({
//       slug,
//       solutions: validSolutions
//     });

//     await solutionSet.save();

//     res.json({
//       success: true,
//       data: solutionSet,
//       message: `Successfully stored ${validSolutions.length} solutions`
//     });

//   } catch (error) {
//     console.error('Error processing solutions:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to process solutions',
//       details: error.message
//     });
//   }
// });

// module.exports = router;

const express = require('express');
const { chromium } = require('playwright');
const router = express.Router();

async function scrapeLeetCodeSolutions(slug, websiteUrl) {
    const browser = await chromium.launch({ headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ] });
    const context = await browser.newContext({
        bypassCSP: true, // Bypass Content Security Policy
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        javaScriptEnabled: true,
    });

    // Block CSS and images globally in the context
    await context.route('**/*', (route) => {
        if (route.request().resourceType() === 'stylesheet' || route.request().resourceType() === 'image') {
            route.abort();
        } else {
            route.continue();
        }
    });

    const page = await context.newPage();

    try {
      await    page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(5000);
    // await page.waitForSelector('.group.flex.w-full.cursor-pointer.flex-col.gap-1.5.px-4.pt-3', { state: 'visible' });

        // Extract all solution links
        const links = await page.evaluate(() => 
            Array.from(document.querySelectorAll('a')).map(a => a.href)
        );

        // Filter links matching the required pattern
        const solutionLinks = links.filter(link => 
            new RegExp(`/leetcode.com/problems/${slug}/solutions/[^/\s]+`).test(link) &&
            !link.toLowerCase().includes('by-leetcode') &&
            !link.toLowerCase().includes('video') &&
            link.toLowerCase().includes('java') &&
            link.trim() !== ''
        ).slice(0, 5);

        if (solutionLinks.length === 0) {
            console.log('No valid solution links found.');
            await browser.close();
            return [];
        }

        // Open all solution links in parallel
        const solutionPages = await Promise.all(solutionLinks.map(async (link) => {
            const solutionPage = await context.newPage();

            // Block CSS and images for each new page
            await solutionPage.route('**/*', (route) => {
                if (route.request().resourceType() === 'stylesheet' || route.request().resourceType() === 'image') {
                    route.abort();
                } else {
                    route.continue();
                }
            });

            await solutionPage.goto(link, { waitUntil: 'domcontentloaded' });
            await solutionPage.waitForSelector('pre code', { state: 'visible' });

            // Extract Java-related code from the page
            const javaCode = await solutionPage.evaluate(() => {
                const preTags  = document.querySelectorAll('pre code');
                const firstCode = preTags.length > 0 ? preTags[0].innerText : '';  // Return the first code block or an empty string if none found
                return firstCode;
            });

            await solutionPage.close(); // Close tab after extraction

            return { url: link, javaCode };
        }));

        await browser.close();
        return solutionPages;

    } catch (error) {
        console.error('Error during scraping:', error);
        await browser.close();
        return [];
    }
}

router.get('/scrape/:slug', async (req, res) => {
    const { slug } = req.params;
    const websiteUrl = `https://leetcode.com/problems/${slug}/solutions/`;
    try {
        const solutions = await scrapeLeetCodeSolutions(slug, websiteUrl);
        res.json({ success: true, solutions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;


// Preinstallable dependencies: 
// npm install express playwright