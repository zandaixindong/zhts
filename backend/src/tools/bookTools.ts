import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { SearchBooksSchema, GetBookDetailsSchema, SubscribeAvailabilitySchema } from '../types';

const prisma = new PrismaClient();

export const bookTools = [
  {
    name: 'search_books',
    description: 'Search for books in the library catalog by query, can filter by category, availability, format',
    input_schema: SearchBooksSchema.shape,
  },
  {
    name: 'get_book_details',
    description: 'Get detailed information about a specific book',
    input_schema: GetBookDetailsSchema.shape,
  },
  {
    name: 'subscribe_availability',
    description: 'Subscribe to notification when a checked-out book becomes available',
    input_schema: SubscribeAvailabilitySchema.shape,
  },
] as const;

// Tool handlers
export async function handleSearchBooks(input: z.infer<typeof SearchBooksSchema>) {
  const { query, filters } = input;

  // Build where clause
  const where: any = {
    OR: [
      { title: { contains: query } },
      { author: { contains: query } },
      { category: { contains: query } },
      { description: { contains: query } },
    ],
  };

  if (filters?.category) {
    where.category = { contains: filters.category };
  }
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.format) {
    where.format = filters.format;
  }

  const books = await prisma.book.findMany({
    where,
    take: 20,
    orderBy: { title: 'asc' },
  });

  // For demo: "aggregate" from multiple platforms by adding electronic versions
  // In a real app this would query external APIs
  const booksWithMultiSource = books.map(book => {
    // If we don't have electronic but it's a popular book, simulate finding it on Project Gutenberg or Google Books
    if (book.format === 'physical' && book.year && book.year < 1923) {
      return {
        ...book,
        foundOn: ['physical', 'project gutenberg'],
        electronicUrl: `https://www.gutenberg.org/search?q=${encodeURIComponent(book.title)}`,
      };
    }
    return {
      ...book,
      foundOn: book.format === 'electronic' ? ['electronic'] : book.format === 'both' ? ['physical', 'electronic'] : ['physical'],
    };
  });

  return {
    books: booksWithMultiSource,
    count: books.length,
  };
}

export async function handleGetBookDetails(input: z.infer<typeof GetBookDetailsSchema>) {
  const { bookId } = input;
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });
  return { book };
}

export async function handleSubscribeAvailability(input: z.infer<typeof SubscribeAvailabilitySchema>) {
  const { bookId, userId } = input;

  // Check if already subscribed
  const existing = await prisma.bookNotification.findFirst({
    where: { bookId, userId, notified: false },
  });

  if (existing) {
    return { success: true, message: 'You are already subscribed to notifications for this book.' };
  }

  // Check if actually available now
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return { success: false, message: 'Book not found.' };
  }

  if (book.status === 'available') {
    return { success: false, message: 'This book is already available. You can check it out now.' };
  }

  // Create subscription
  await prisma.bookNotification.create({
    data: { bookId, userId },
  });

  return {
    success: true,
    message: `You will be notified when "${book?.title}" becomes available.`,
  };
}

export async function handleBookToolCall(name: string, input: any) {
  switch (name) {
    case 'search_books':
      return await handleSearchBooks(SearchBooksSchema.parse(input));
    case 'get_book_details':
      return await handleGetBookDetails(GetBookDetailsSchema.parse(input));
    case 'subscribe_availability':
      return await handleSubscribeAvailability(SubscribeAvailabilitySchema.parse(input));
    default:
      throw new Error(`Unknown book tool: ${name}`);
  }
}
