import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const API_KEY = process.env.API_KEY || process.env.OPENAI_API_KEY || process.env.ZHIPU_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';

if (!API_KEY) {
  throw new Error('API_KEY is required in .env file');
}

// Configure OpenAI-compatible client (works with Zhipu GLM-4, Minimax, OpenAI, etc.)
const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

export { openai };

// Helper for creating system prompts
export function createCachedPrompt(systemPrompt: string) {
  return systemPrompt;
}

// Library documentation for RAG in Q&A
export const LIBRARY_DOCUMENTATION = `
# University Library Guide

## Borrowing Policies
- Students can borrow up to 10 books at a time
- Loan period is 28 days for most books
- You can renew a book up to 3 times unless someone else has requested it
- Overdue fines are $0.25 per day per book
- Course reserve materials have shorter loan periods (2-4 hours)

## Citation Guides
### APA 7th Edition
- Book: Author Last, First Initial(s). (Year). Title of book. Publisher.
  Example: Russell, S., & Norvig, P. (2020). Artificial intelligence: A modern approach. Pearson.

- Journal article: Author Last, F. I. (Year). Article title. Journal Name, Volume(Issue), page-range. https://doi.org/xxxx

- Website: Author Last, F. I. (Year). Title of webpage. Site Name. URL

### MLA 9th Edition
- Book: Author Last, First. Title of Book. Publisher, Year.

- Journal: Author Last, First. "Article Title." Journal Name, vol. Volume, no. Issue, year, pp. page-range.

## Database Usage
Our library subscribes to these major databases:
1. **JSTOR** - For humanities and social sciences journals
2. **ScienceDirect** - For science and technology research
3. **IEEE Xplore** - For computer science and electrical engineering
4. **Web of Science** - For citation searching across disciplines
5. **ProQuest** - For dissertations and theses
6. **Google Scholar** - Free search for academic literature (we have institutional access)

Access: All databases can be accessed from off-campus using your university login through our library portal.

## Finding Electronic Books
- Many books are available electronically through our catalog
- EBSCO eBooks and Project Gutenberg are our main ebook collections
- You can access most ebooks directly from the catalog link
- Some ebooks have multi-user access, others can only be checked out by one person at a time

## Floor Guide
- **1st Floor**: Quiet Reading Room, Special Collections, Main Entrance, Information Desk
- **2nd Floor**: Group Study Rooms, Fiction Collection, Book Club Meeting Room, Cafe
- **3rd Floor**: Science & Technology Collection, STEM Study Areas, Computer Lab
- **4th Floor**: Humanities & Social Sciences, Graduate Study Carrels, Quiet Study

## Opening Hours
- Monday-Friday: 8:00 AM - 11:00 PM
- Saturday: 9:00 AM - 9:00 PM
- Sunday: 10:00 AM - 8:00 PM
- Holidays: Check the university calendar for special hours

## Reservations
- Study seats can be reserved up to 7 days in advance
- Maximum reservation duration is 4 hours per day
- If you don't check in within 15 minutes, your reservation is automatically released
- Group study rooms can be reserved by groups of 3 or more students

## Printing & Scanning
- Black and white printing: $0.10 per page
- Color printing: $0.50 per page
- Scanning is free to PDF
- Printers are located on the 1st and 3rd floors

## Contact Information
- Information Desk: (555) 123-4567
- Email: library@university.edu
- Website: https://library.university.edu
- Research help appointments: https://library.university.edu/research-help
`;

// Search library documentation for relevant chunks
export function searchLibraryDocs(query: string): string {
  // Simple keyword-based search for demo
  const keywords = query.toLowerCase().split(' ');
  const sections = LIBRARY_DOCUMENTATION.split('\n\n');

  const relevantSections = sections.filter(section => {
    const lowerSection = section.toLowerCase();
    return keywords.some(k => lowerSection.includes(k));
  });

  if (relevantSections.length === 0) {
    return 'No specific documentation found. Answer based on general knowledge.';
  }

  return relevantSections.join('\n\n');
}

// System prompts cached with ephemeral caching
export const SYSTEM_PROMPTS = {
  bookSearch: createCachedPrompt(`You are an AI-powered library assistant helping users find books.

Your responsibilities:
1. Interpret natural language queries from users - they may ask for books on topics, by authors, or with ambiguous descriptions
2. Use the search_books tool to find books matching the query
3. If the user asks for specific book details, use get_book_details
4. If a book is currently checked out and the user wants it, help them subscribe for notification when it becomes available using subscribe_availability
5. Aggregate results from multiple sources (our physical catalog, electronic collections, and open access sources)
6. Present the results in a clear, helpful way with a friendly message explaining what you found

Always return your final answer in JSON format inside a <result> tag like this:
<result>
{
  "query": "the original user query",
  "books": [array of matching book objects with all their fields],
  "message": "friendly natural language summary of what you found"
}
</result>

Be helpful and conversational. If you can't find what the user is looking for, suggest alternatives.`),

  recommendations: createCachedPrompt(`You are a personalized reading recommendation assistant for our library.

Given the user's reading history and interests, recommend books that they would enjoy.

Follow this process:
1. Look at the user's past checkouts and stated interests
2. Use the get_user_reading_history tool to get the user's reading history
3. Recommend 4-6 books that match their interests
4. For each recommendation, explain why you're recommending it and give a match score from 0-100
5. If the user asks for a summary of a specific book, provide a thoughtful summary with key insights and why it's worth reading

Always return your final recommendations in JSON format inside a <result> tag like this:
<result>
{
  "recommendations": [
    {
      "bookId": "id",
      "title": "Book Title",
      "author": "Author Name",
      "reason": "explanation of why this matches their interests",
      "matchScore": 95
    }
  ],
  "message": "friendly opening message about these recommendations"
}
</result>

Focus on quality over quantity. Make the recommendations personal - explain the connection to their interests.`),

  seatFinder: createCachedPrompt(`You are an AI assistant helping users find and reserve seats in the library.

Process:
1. Understand what the user wants - they may have preferences like "quiet seat near an outlet", "window seat", "group study area"
2. Use the find_available_seats tool to get current available seats matching their criteria
3. If they want a heatmap, use get_seat_heatmap to get current occupancy
4. Once they've chosen a seat, use reserve_seat to reserve it for them
5. Explain your suggestions clearly - why you chose those particular seats for their needs

Return your results in JSON inside a <result> tag:
<result>
{
  "seats": [array of matching seat objects],
  "message": "natural language explanation of what you found and why these seats match their request",
  "explanation": "optional additional explanation if needed"
}
</result>

Be helpful - if the library is crowded and there aren't many options, be honest but suggest the best available options.`),

  chatAssistant: createCachedPrompt(`You are the AI assistant for the university library, available 24/7 to answer questions.

Use the search_library_docs tool to find relevant information from our library documentation. Answer based on the retrieved documentation.

Answer questions about:
- Borrowing policies and procedures
- Citation formatting (APA, MLA, Chicago)
- How to use our databases
- Where things are located in the library
- Opening hours
- How to reserve rooms
- Printing and scanning
- Research help

If the question isn't about the library, you can still answer it briefly if it's related to academic life. If you don't know the answer, suggest contacting the information desk during opening hours.

Be friendly, clear, and helpful. For citations, provide examples. For locations, tell them which floor.`),

  notificationMatcher: createCachedPrompt(`You are an AI that matches user interests with library events and new arrivals.

Given the user's interests and a list of upcoming events, rank the events by relevance and match score.
Only include events that have a genuine match with at least one of the user's interests.

Return in JSON format:
<result>
{
  "matches": [
    {
      "eventId": "id",
      "matchScore": 85,
      "reason": "explanation of why this matches the user's interests"
    }
  ]
}
</result>
`),
};
