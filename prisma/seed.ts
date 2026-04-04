import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('Starting seed...');

  // Create demo user
  const demoPasswordHashed = await bcrypt.hash('demo', SALT_ROUNDS);
  const adminPasswordHashed = await bcrypt.hash('admin123', SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: 'demo@university.edu' },
    update: { password: demoPasswordHashed },
    create: {
      email: 'demo@university.edu',
      name: '演示用户',
      password: demoPasswordHashed,
      role: 'user',
      interests: JSON.stringify(['computer science', 'artificial intelligence', 'data science', 'fiction']),
    },
  });

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: { password: adminPasswordHashed },
    create: {
      email: 'admin@university.edu',
      name: '管理员',
      password: adminPasswordHashed,
      role: 'admin',
      interests: JSON.stringify([]),
    },
  });

  console.log('Created demo user:', user.id);
  console.log('Created admin user:', admin.id);

  // Sample books
  const sampleBooks = [
    {
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell & Peter Norvig',
      isbn: '9780134610993',
      publisher: 'Pearson',
      year: 2020,
      category: 'computer science',
      location: '3rd Floor, QA76.A67',
      status: 'checked_out',
      format: 'physical',
      description: 'The most comprehensive textbook on artificial intelligence, covering all major topics from search to machine learning.',
      content: 'Artificial Intelligence: A Modern Approach is the leading textbook in AI. It covers the full breadth of the field, from game theory and constraint satisfaction to machine learning, computer vision, robotics, and natural language processing.',
    },
    {
      title: 'Deep Learning',
      author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      isbn: '9780262035613',
      publisher: 'MIT Press',
      year: 2016,
      category: 'computer science',
      location: '3rd Floor, QA76.G66',
      status: 'available',
      format: 'both',
      electronicUrl: 'https://library.university.edu/books/deep-learning',
      description: 'The definitive textbook on deep learning from three leading researchers.',
      content: 'Deep learning is a branch of machine learning that has enabled many breakthroughs in speech recognition, computer vision, natural language processing, and other fields. This book provides a comprehensive introduction to the field.',
    },
    {
      title: 'Pattern Recognition and Machine Learning',
      author: 'Christopher M. Bishop',
      isbn: '9780387310732',
      publisher: 'Springer',
      year: 2006,
      category: 'computer science',
      location: '3rd Floor, QA274.B5',
      status: 'available',
      format: 'physical',
      description: 'A comprehensive textbook on pattern recognition and machine learning.',
      content: 'This book covers all the main topics in pattern recognition and machine learning, including Bayesian networks, kernel methods, neural networks, and graphical models.',
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '9780441013590',
      publisher: 'Penguin',
      year: 1965,
      category: 'fiction',
      location: '2nd Floor, PS3558.E67 D8',
      status: 'available',
      format: 'both',
      electronicUrl: 'https://library.university.edu/books/dune',
      description: 'A science fiction masterpiece set on the desert planet Arrakis.',
      content: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange, a drug capable of extending life and enhancing cognition.',
    },
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      isbn: '9780756404745',
      publisher: 'DAW Books',
      year: 2007,
      category: 'fiction',
      location: '2nd Floor, PS3618.O88 N36',
      status: 'checked_out',
      format: 'physical',
      description: 'The first book in the Kingkiller Chronicle, telling the story of Kvothe.',
      content: 'I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to gods, loved women, and written songs that make the minstrels weep.',
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      publisher: 'Prentice Hall',
      year: 2008,
      category: 'computer science',
      location: '4th Floor, QA76.76.C672 M37',
      status: 'available',
      format: 'physical',
      description: 'A handbook of agile software craftsmanship.',
      content: 'Clean Code teaches you principles of clean coding and how to write better code that is easy to read, maintain, and extend.',
    },
    {
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt & David Thomas',
      isbn: '9780201616224',
      publisher: 'Addison-Wesley',
      year: 1999,
      category: 'computer science',
      location: '4th Floor, QA76.76.P75 H95',
      status: 'available',
      format: 'both',
      electronicUrl: 'https://library.university.edu/books/pragmatic-programmer',
      description: 'From journeyman to master.',
      content: 'The Pragmatic Programmer is a collection of practical tips and advice for programmers to improve their craft and productivity.',
    },
    {
      title: 'The Selfish Gene',
      author: 'Richard Dawkins',
      isbn: '9780198576369',
      publisher: 'Oxford University Press',
      year: 1976,
      category: 'biology',
      location: '1st Floor, QH437.D39',
      status: 'available',
      format: 'physical',
      description: 'An eye-opening look at evolution from the gene\'s perspective.',
      content: 'In this book, Richard Dawkins argues that evolution occurs at the level of genes, not individuals or species. The gene is the unit of selection, and organisms are just survival machines - vehicles for genes to replicate themselves.',
    },
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '9780062316097',
      publisher: 'Harper',
      year: 2014,
      category: 'history',
      location: '1st Floor, GN53.H37',
      status: 'available',
      format: 'both',
      electronicUrl: 'https://library.university.edu/books/sapiens',
      description: 'A brief history of human evolution and civilization.',
      content: 'Sapiens explores the history of humankind, from the emergence of Homo sapiens in the Stone Age to the twenty-first century, examining how biology and history have shaped us.',
    },
    {
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      isbn: '9780857197685',
      publisher: 'Harriman House',
      year: 2020,
      category: 'economics',
      location: '2nd Floor, HG179.H68',
      status: 'available',
      format: 'physical',
      description: 'Timeless lessons on wealth, greed, and happiness.',
      content: 'Money plays an important role in our lives, but it\'s not just about math. This book explores the psychological factors that influence our financial decisions.',
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '9780374275631',
      publisher: 'Farrar, Straus and Giroux',
      year: 2011,
      category: 'psychology',
      location: '1st Floor, BF121.K34',
      status: 'checked_out',
      format: 'physical',
      description: 'Explores the two systems of thinking that drive our judgments.',
      content: 'System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical. Kahneman explains how both systems shape our thinking and decision-making.',
    },
    {
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      isbn: '9780134494166',
      publisher: 'Prentice Hall',
      year: 2017,
      category: 'computer science',
      location: '4th Floor, QA76.76.A65 M37',
      status: 'available',
      format: 'physical',
      description: 'A guide to software architecture and design principles.',
      content: 'Clean Architecture teaches how to structure software systems that are maintainable, testable, and scalable. It covers design principles, patterns, and best practices.',
    },
    {
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      isbn: '9780262033848',
      publisher: 'MIT Press',
      year: 2009,
      category: 'computer science',
      location: '3rd Floor, QA76.6.C63',
      status: 'available',
      format: 'physical',
      description: 'The classic comprehensive algorithms textbook.',
      content: 'This book provides a comprehensive introduction to the modern study of computer algorithms. It covers a wide range of algorithms, presents them in accessible language, and maintains a focus on the engineering aspect of algorithm design and analysis.',
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '9780743273568',
      publisher: 'Scribner',
      year: 1925,
      category: 'fiction',
      location: '2nd Floor, PS3511.I9 G7',
      status: 'available',
      format: 'both',
      electronicUrl: 'https://library.university.edu/books/great-gatsby',
      description: 'A classic novel of the Jazz Age.',
      content: 'The story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan, set on the prosperous Long Island of the 1920s.',
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '9780451524939',
      publisher: 'Penguin',
      year: 1949,
      category: 'fiction',
      location: '2nd Floor, PR6029.R8 N63',
      status: 'available',
      format: 'both',
      electronicUrl: 'https://library.university.edu/books/1984',
      description: 'A dystopian social science fiction novel.',
      content: 'The story takes place in the year 1984, where most of the world is trapped in a totalitarian superstate. The book follows Winston Smith, a low-ranking member of the Party who becomes disillusioned with the regime.',
    },
  ];

  for (const book of sampleBooks) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: book,
      create: book,
    });
  }

  console.log(`Created ${sampleBooks.length} sample books`);

  // Create floors and seats
  const floors = [
    { number: 1, name: '一楼 - 安静阅读区' },
    { number: 2, name: '二楼 - 小组学习区' },
    { number: 3, name: '三楼 - 科技区' },
    { number: 4, name: '四楼 - 人文区' },
  ];

  for (const floorData of floors) {
    const floor = await prisma.floor.create({
      data: floorData,
    });

    // Generate seats in a grid pattern
    const seatsPerRow = 8;
    const rows = 6;
    let seatCount = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < seatsPerRow; col++) {
        const x = col * 10 + 5;
        const y = row * 10 + 5;
        const hasOutlet = Math.random() > 0.3;
        const isWindow = col === 0 || col === seatsPerRow - 1;
        const zone = floorData.number === 1 || floorData.number === 3 ? 'quiet' : floorData.number === 2 ? 'group' : 'standard';

        // Randomly occupy some seats for demo
        const status = Math.random() > 0.4 ? 'available' : 'occupied';

        await prisma.seat.create({
          data: {
            floorId: floor.id,
            seatNumber: `${floorData.number}-${row + 1}-${col + 1}`,
            x,
            y,
            hasOutlet,
            zone,
            window: isWindow,
            status,
          },
        });
        seatCount++;
      }
    }
    console.log(`Created ${seatCount} seats for floor ${floorData.number}`);
  }

  // Create sample library events
  const events = [
    {
      title: 'Introduction to AI Research Workshop',
      description: 'Learn how to use the library\'s AI research databases and find the latest papers. This workshop covers arXiv, Google Scholar, and our subscription databases.',
      category: 'workshop',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      location: '3rd Floor Conference Room',
      interests: JSON.stringify(['computer science', 'artificial intelligence', 'data science']),
    },
    {
      title: 'Book Club: Modern Fiction Discussion',
      description: 'Join us for a discussion of contemporary fiction. New members welcome!',
      category: 'book_club',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      location: '2nd Floor Reading Room',
      interests: JSON.stringify(['fiction', 'literature']),
    },
    {
      title: 'Citation Management with Zotero',
      description: 'Learn how to organize your research papers and generate citations automatically with Zotero.',
      category: 'workshop',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      location: 'Library Training Lab',
      interests: JSON.stringify(['research', 'computer science', 'all']),
    },
    {
      title: 'Special Exhibition: Ancient History Manuscripts',
      description: 'A rare exhibition of ancient manuscripts from our special collections.',
      category: 'exhibition',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      location: 'Main Entrance Gallery',
      interests: JSON.stringify(['history', 'humanities']),
    },
  ];

  for (const event of events) {
    await prisma.libraryEvent.create({
      data: event,
    });
  }

  console.log(`Created ${events.length} sample events`);

  // Create some sample notifications for the demo user
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Deep Learning is now available',
      content: 'The book "Deep Learning" by Goodfellow, Bengio, and Courville you were waiting for has been returned and is available for checkout.',
      type: 'book_available',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'New arrival: AI Literacy',
      content: 'A new book "AI Literacy: How to Think About Artificial Intelligence" has arrived in the library. Based on your interests in AI, you might want to check it out.',
      type: 'new_arrival',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Workshop: Introduction to AI Research',
      content: 'This event matches your interest in artificial intelligence. It will be held next Monday.',
      type: 'event',
      read: false,
    },
  });

  console.log('Created sample notifications');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
