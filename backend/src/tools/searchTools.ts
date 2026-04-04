import { z } from 'zod';
import { SearchLibraryDocsSchema } from '../types';
import { searchLibraryDocs } from '../services/claude';

export const searchTools = [
  {
    name: 'search_library_docs',
    description: 'Search the library documentation for answers about policies, citations, services, etc.',
    input_schema: SearchLibraryDocsSchema.shape,
  },
] as const;

export async function handleSearchLibraryDocs(input: z.infer<typeof SearchLibraryDocsSchema>) {
  const { query } = input;
  const results = searchLibraryDocs(query);
  return { results };
}

export async function handleSearchToolCall(name: string, input: any) {
  switch (name) {
    case 'search_library_docs':
      return await handleSearchLibraryDocs(input);
    default:
      throw new Error(`Unknown search tool: ${name}`);
  }
}
