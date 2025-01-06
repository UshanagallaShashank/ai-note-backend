// const fetch = require('node-fetch');

// // GraphQL Query Definition
// const query = `#graphql
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
//             freqBar
//             questionFrontendId
//             isFavor
//             isPaidOnly
//             status
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

// const fetchProblems = async (options, formatData, query) => {
//   try {
//     const limit = options.skip !== undefined && options.limit === undefined ? 1 : options.limit || 20;
//     const skip = options.skip || 0;
//     const tags = options.tags ? options.tags.split(' ') : [];
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
//       throw new Error(`Error fetching data: ${JSON.stringify(result.errors)}`);
//     }
// console.log(result.data.problemsetQuestionList.questions.length)
//     return result.data; // return data instead of sending to res
//   } catch (err) {
//     console.error('Error:', err);
//     throw new Error('Internal server error');
//   }
// };

// // Simulating a formatData function (you can implement the actual formatting here)
// const formatData = (data) => {
//   const questions = data.problemsetQuestionList.questions;
//   return questions.map((q) => ({
//     id: q.questionFrontendId,
//     title: q.title,
//     titleSlug: q.titleSlug,
//     difficulty: q.difficulty,
//     acRate: q.acRate,
//     tags: q.topicTags.map((tag) => tag.name),
//   }));
// };

// // Fetching the values using the fetchProblems function
// const fetchValues = async () => {
//   const options = {
//     limit: 3415, 
//     skip: 3414, 
//     tags: '',   
//   };

//   try {
//     const data = await fetchProblems(options, formatData, query);
//     console.log(data.length)
//     return formatData(data); // Format the fetched data
//   } catch (err) {
//     console.error('Error fetching values:', err);
//     return null;
//   }
// };


// // fetchValues().then((data) => {
// //   console.log('Fetched Data:', data);  // This will output the formatted data
// // }).catch((err) => {
// //   console.error('Error:', err);
// // });

// module.exports=fetchValues;



const fetch = require('node-fetch');

// GraphQL Query Definition
const query = `#graphql
query getProblems($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
    ) {
        total: totalNum
        questions: data {
            acRate
            difficulty
            freqBar
            questionFrontendId
            isFavor
            isPaidOnly
            status
            title
            titleSlug
            topicTags {
                name
                id
                slug
            }
            hasSolution
            hasVideoSolution
        }
    }
}`;

const fetchProblems = async (options, query) => {
  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
      },
      body: JSON.stringify({
        query: query,
        variables: {
          categorySlug: '',
          skip: options.skip,
          limit: options.limit,
          filters: {},
        },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(`Error fetching data: ${JSON.stringify(result.errors)}`);
    }

    return result.data.problemsetQuestionList.questions;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Internal server error');
  }
};

const fetchRandom20Questions = async () => {
  try {
    const totalQuestions = 3415; // Total number of available questions
    const limit = 20; // Number of questions to fetch
    const randomSkip = Math.floor(Math.random() * (totalQuestions - limit)); // Random start index (0 to total - limit)

    // console.log(`Fetching 20 questions starting from index: ${randomSkip}`);

    const options = {
      limit: limit, // Fetch 20 questions
      skip: randomSkip, // Start from the random index
    };

    const questions = await fetchProblems(options, query);
    // console.log('Fetched Questions:', questions);
    return questions;
  } catch (err) {
    console.error('Error fetching random questions:', err);
    return [];
  }
};

// Example usage
// fetchRandom20Questions().then((questions) => {
//   console.log('Random 20 Questions:', questions); // Logs the 20 randomly fetched questions
// }).catch((err) => {
//   console.error('Error:', err);
// });

module.exports=fetchRandom20Questions;