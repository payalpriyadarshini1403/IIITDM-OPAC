/**
 * queries.ts — All typed query functions for OPAC
 * Uses the in-memory JSON store (no WASM, no SQL, instant).
 */

import { getDB, persist, uid } from './db';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Book {
  id: string;
  title: string;
  authors: string[];
  subject: string;
  call_number: string;
  format: 'physical' | 'ebook' | 'both';
  cover_url: string;
  description: string;
  published_year: number;
  isbn: string;
}

export interface Location {
  book_id: string;
  library: string;
  floor: string;
  section: string;
  shelf_row: string;
  bay: string;
  grid_row: number;
  grid_col: number;
}

export interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  issued_date: string;
  due_date: string;
  returned_date: string | null;
  status: 'active' | 'returned' | 'overdue';
}

export interface Hold {
  id: string;
  user_id: string;
  book_id: string;
  status: string;
  queue_position: number;
  created_at: string;
}

export interface Collection {
  id: string;
  owner_id: string;
  name: string;
  visibility: 'private' | 'public';
  created_at: string;
  book_ids: string[];
}

export interface Recommendation {
  id: string;
  source_type: 'peer' | 'faculty';
  source_user_id: string;
  subject: string;
  book_id: string;
  note: string;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user_name?: string;
}

export interface User {
  id: string;
  name: string;
  institute_id: string;
  role: 'student' | 'faculty' | 'guest';
  email: string;
  avatar_url: string;
  bio?: string;
  department?: string;
  skills?: string[];
  interests?: string[];
}

export interface Post {
  id: string;
  author_id: string;
  author_name?: string;
  author_role?: string;
  author_avatar?: string;
  content: string;
  link_url?: string;
  created_at: string;
  likes: number;
  comment_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name?: string;
  author_role?: string;
  content: string;
  created_at: string;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  book_id: string;
  opened_at: string;
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function dbBookToBook(b: ReturnType<typeof getDB>['books'][0]): Book {
  let parsedAuthors: string[] = [];
  if (Array.isArray(b.authors)) {
    parsedAuthors = b.authors;
  } else if (typeof b.authors === 'string') {
    try {
      parsedAuthors = b.authors.startsWith('[') ? JSON.parse(b.authors) : [b.authors];
    } catch {
      parsedAuthors = [b.authors];
    }
  }

  return {
    id: b.id,
    title: b.title,
    authors: parsedAuthors,
    subject: b.subject,
    call_number: b.call_number,
    format: b.format as Book['format'],
    cover_url: b.cover_url,
    description: b.description,
    published_year: b.published_year,
    isbn: b.isbn || '',
  };
}

// ─── Books ─────────────────────────────────────────────────────────────────────

export async function getAllBooks(): Promise<Book[]> {
  const db = getDB();
  return [...db.books].sort((a, b) => a.title.localeCompare(b.title)).map(dbBookToBook);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const db = getDB();
  const b = db.books.find(b => b.id === id);
  return b ? dbBookToBook(b) : undefined;
}

export async function searchBooks(query: string, filters?: {
  subject?: string;
  format?: string;
  yearFrom?: number;
  yearTo?: number;
  title?: string;
  author?: string;
  sortBy?: 'relevance' | 'year_desc' | 'year_asc' | 'title';
}): Promise<Book[]> {
  const db = getDB();
  const q = query.trim().toLowerCase();

  let results = db.books.filter(b => {
    if (q && !(
      b.title.toLowerCase().includes(q) ||
      b.authors.toLowerCase().includes(q) ||
      b.subject.toLowerCase().includes(q) ||
      b.call_number.toLowerCase().includes(q)
    )) return false;
    if (filters?.title && !b.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
    if (filters?.author && !b.authors.toLowerCase().includes(filters.author.toLowerCase())) return false;
    if (filters?.subject && b.subject !== filters.subject) return false;
    if (filters?.format) {
      if (filters.format === 'ebook' && !['ebook','both'].includes(b.format)) return false;
      if (filters.format === 'physical' && !['physical','both'].includes(b.format)) return false;
    }
    if (filters?.yearFrom && b.published_year < filters.yearFrom) return false;
    if (filters?.yearTo && b.published_year > filters.yearTo) return false;
    return true;
  });

  const sortBy = filters?.sortBy || 'relevance';
  if (sortBy === 'year_desc') results.sort((a, b) => b.published_year - a.published_year);
  else if (sortBy === 'year_asc') results.sort((a, b) => a.published_year - b.published_year);
  else results.sort((a, b) => a.title.localeCompare(b.title));

  return results.map(dbBookToBook);
}

export async function getRelatedBooks(bookId: string): Promise<Book[]> {
  const db = getDB();
  const src = db.books.find(b => b.id === bookId);
  if (!src) return [];
  return db.books
    .filter(b => b.id !== bookId && b.subject === src.subject)
    .slice(0, 5)
    .map(dbBookToBook);
}

export async function getBooksBySubject(subject: string): Promise<Book[]> {
  const db = getDB();
  return db.books
    .filter(b => b.subject === subject)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(dbBookToBook);
}

export async function getAvailabilityStatus(bookId: string): Promise<'available' | 'limited' | 'unavailable'> {
  const db = getDB();
  const count = db.loans.filter(l => l.book_id === bookId && ['active','overdue'].includes(l.status)).length;
  if (count === 0) return 'available';
  if (count < 2) return 'limited';
  return 'unavailable';
}

export async function getLocationByBookId(bookId: string): Promise<Location | undefined> {
  const db = getDB();
  return db.locations.find(l => l.book_id === bookId);
}

// ─── Loans ─────────────────────────────────────────────────────────────────────

export async function getLoansByUser(userId: string): Promise<Loan[]> {
  const db = getDB();
  return db.loans
    .filter(l => l.user_id === userId)
    .sort((a, b) => b.issued_date.localeCompare(a.issued_date)) as Loan[];
}

export async function createLoan(userId: string, bookId: string): Promise<Loan> {
  const db = getDB();
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 30);
  const loan: Loan = {
    id: uid(), user_id: userId, book_id: bookId,
    issued_date: now.toISOString().split('T')[0],
    due_date: due.toISOString().split('T')[0],
    returned_date: null, status: 'active',
  };
  db.loans.push(loan as any);
  persist();
  return loan;
}

export async function returnLoan(loanId: string): Promise<void> {
  const db = getDB();
  const loan = db.loans.find(l => l.id === loanId);
  if (loan) {
    loan.status = 'returned';
    loan.returned_date = new Date().toISOString().split('T')[0];
    persist();
  }
}

export async function hasActiveLoan(userId: string, bookId: string): Promise<boolean> {
  const db = getDB();
  return db.loans.some(l => l.user_id === userId && l.book_id === bookId && ['active','overdue'].includes(l.status));
}

export function getOverdueFine(loan: Loan): number {
  if (loan.status !== 'overdue') return 0;
  const due = new Date(loan.due_date);
  const today = new Date();
  const days = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
  return days * 2;
}

// ─── Holds ─────────────────────────────────────────────────────────────────────

export async function getHoldsByUser(userId: string): Promise<Hold[]> {
  const db = getDB();
  return db.holds
    .filter(h => h.user_id === userId && h.status !== 'cancelled')
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createHold(userId: string, bookId: string): Promise<Hold> {
  const db = getDB();
  const pos = db.holds.filter(h => h.book_id === bookId && ['waiting','ready'].includes(h.status)).length + 1;
  const hold: Hold = {
    id: uid(), user_id: userId, book_id: bookId,
    status: 'waiting', queue_position: pos,
    created_at: new Date().toISOString().split('T')[0],
  };
  db.holds.push(hold);
  persist();
  return hold;
}

export async function cancelHold(holdId: string): Promise<void> {
  const db = getDB();
  const hold = db.holds.find(h => h.id === holdId);
  if (hold) { hold.status = 'cancelled'; persist(); }
}

export async function hasActiveHold(userId: string, bookId: string): Promise<boolean> {
  const db = getDB();
  return db.holds.some(h => h.user_id === userId && h.book_id === bookId && ['waiting','ready'].includes(h.status));
}

// ─── Collections ───────────────────────────────────────────────────────────────

function colWithBooks(col: ReturnType<typeof getDB>['collections'][0]): Collection {
  const db = getDB();
  const book_ids = db.collection_books
    .filter(cb => cb.collection_id === col.id)
    .map(cb => cb.book_id);
  return { id: col.id, owner_id: col.owner_id, name: col.name,
    visibility: col.visibility as Collection['visibility'],
    created_at: col.created_at, book_ids };
}

export async function getCollectionsByUser(userId: string): Promise<Collection[]> {
  const db = getDB();
  return db.collections
    .filter(c => c.owner_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(colWithBooks);
}

export async function getAllCollections(): Promise<Collection[]> {
  const db = getDB();
  return [...db.collections]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(colWithBooks);
}

export async function getPublicCollections(): Promise<Collection[]> {
  const db = getDB();
  return db.collections
    .filter(c => c.visibility === 'public')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(colWithBooks);
}

export async function createCollection(ownerId: string, name: string, visibility: 'private' | 'public'): Promise<Collection> {
  const db = getDB();
  const col = { id: uid(), owner_id: ownerId, name, visibility, created_at: new Date().toISOString().split('T')[0] };
  db.collections.push(col);
  persist();
  return { ...col, book_ids: [] };
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const db = getDB();
  db.collection_books = db.collection_books.filter(cb => cb.collection_id !== collectionId);
  const idx = db.collections.findIndex(c => c.id === collectionId);
  if (idx !== -1) db.collections.splice(idx, 1);
  persist();
}

export async function addBookToCollection(collectionId: string, bookId: string): Promise<void> {
  const db = getDB();
  if (!db.collection_books.some(cb => cb.collection_id === collectionId && cb.book_id === bookId)) {
    db.collection_books.push({ collection_id: collectionId, book_id: bookId });
    persist();
  }
}

export async function removeBookFromCollection(collectionId: string, bookId: string): Promise<void> {
  const db = getDB();
  db.collection_books = db.collection_books.filter(
    cb => !(cb.collection_id === collectionId && cb.book_id === bookId)
  );
  persist();
}

export async function toggleCollectionVisibility(collectionId: string, current: 'private' | 'public'): Promise<void> {
  const db = getDB();
  const col = db.collections.find(c => c.id === collectionId);
  if (col) { col.visibility = current === 'private' ? 'public' : 'private'; persist(); }
}

export async function isBookInCollection(collectionId: string, bookId: string): Promise<boolean> {
  const db = getDB();
  return db.collection_books.some(cb => cb.collection_id === collectionId && cb.book_id === bookId);
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviews(bookId: string): Promise<Review[]> {
  const db = getDB();
  return db.reviews
    .filter(r => r.book_id === bookId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(r => {
      const user = db.users.find(u => u.id === r.user_id);
      return { ...r, user_name: user?.name };
    });
}

export async function addReview(userId: string, bookId: string, rating: number, text: string): Promise<void> {
  const db = getDB();
  const existing = db.reviews.find(r => r.user_id === userId && r.book_id === bookId);
  if (existing) {
    existing.rating = rating; existing.review_text = text; existing.created_at = new Date().toISOString();
  } else {
    db.reviews.push({ id: uid(), user_id: userId, book_id: bookId, rating, review_text: text, created_at: new Date().toISOString() });
  }
  persist();
}

export async function getUserReview(userId: string, bookId: string): Promise<Review | undefined> {
  const db = getDB();
  return db.reviews.find(r => r.user_id === userId && r.book_id === bookId);
}

export async function getAverageRating(bookId: string): Promise<{ avg: number; count: number }> {
  const db = getDB();
  const reviews = db.reviews.filter(r => r.book_id === bookId);
  if (!reviews.length) return { avg: 0, count: 0 };
  const avg = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
  return { avg, count: reviews.length };
}

// ─── Reading History ────────────────────────────────────────────────────────────

export async function logReading(userId: string, bookId: string): Promise<void> {
  const db = getDB();
  db.reading_history.push({ id: uid(), user_id: userId, book_id: bookId, opened_at: new Date().toISOString() });
  persist();
}

export async function getReadingStats(userId: string): Promise<{
  totalBooks: number;
  subjectBreakdown: { subject: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
  streak: number;
}> {
  const db = getDB();
  const history = db.reading_history.filter(h => h.user_id === userId);

  const totalBooks = new Set(history.map(h => h.book_id)).size;

  // Subject breakdown
  const subjectMap: Record<string, number> = {};
  history.forEach(h => {
    const book = db.books.find(b => b.id === h.book_id);
    if (book) subjectMap[book.subject] = (subjectMap[book.subject] || 0) + 1;
  });
  const subjectBreakdown = Object.entries(subjectMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([subject, count]) => ({ subject, count }));

  // Monthly activity
  const monthMap: Record<string, number> = {};
  history.forEach(h => {
    const month = h.opened_at.slice(0, 7);
    monthMap[month] = (monthMap[month] || 0) + 1;
  });
  const monthlyActivity = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0])).slice(-6)
    .map(([month, count]) => ({ month, count }));

  // Streak
  const days = [...new Set(history.map(h => h.opened_at.split('T')[0]))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (days[i] === expected.toISOString().split('T')[0]) streak++;
    else break;
  }

  return { totalBooks, subjectBreakdown, monthlyActivity, streak };
}

// ─── Recommendations ───────────────────────────────────────────────────────────

export async function getRecommendations(): Promise<Recommendation[]> {
  const db = getDB();
  return db.recommendations.map(r => ({
    id: r.id,
    source_type: r.source_type as Recommendation['source_type'],
    source_user_id: r.source_user_id,
    subject: r.subject,
    book_id: r.book_id,
    note: r.note,
  }));
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export async function getUserByCredentials(instituteId: string, _password: string): Promise<User | null> {
  const db = getDB();
  const u = db.users.find(u => u.institute_id === instituteId);
  if (!u) return null;
  return { id: u.id, name: u.name, institute_id: u.institute_id, role: u.role as User['role'], email: u.email, avatar_url: u.avatar_url };
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = getDB();
  const u = db.users.find(u => u.id === id);
  if (!u) return undefined;
  return { id: u.id, name: u.name, institute_id: u.institute_id, role: u.role as User['role'], email: u.email, avatar_url: u.avatar_url, bio: u.bio, department: u.department, skills: u.skills, interests: u.interests };
}

export async function updateUserProfile(id: string, updates: Partial<User>): Promise<void> {
  const db = getDB();
  const u = db.users.find(u => u.id === id);
  if (u) {
    if (updates.bio !== undefined) u.bio = updates.bio;
    if (updates.department !== undefined) u.department = updates.department;
    if (updates.skills !== undefined) u.skills = updates.skills;
    if (updates.interests !== undefined) u.interests = updates.interests;
    if (updates.avatar_url !== undefined) u.avatar_url = updates.avatar_url;
    persist();
  }
}

// ─── Posts (Social Feed) ────────────────────────────────────────────────────────
export async function getFeedPosts(): Promise<Post[]> {
  const db = getDB();
  return db.posts.sort((a, b) => b.created_at.localeCompare(a.created_at)).map(p => {
    const author = db.users.find(u => u.id === p.author_id);
    const comment_count = db.comments.filter(c => c.post_id === p.id).length;
    return {
      id: p.id,
      author_id: p.author_id,
      author_name: author?.name,
      author_role: author?.role,
      author_avatar: author?.avatar_url,
      content: p.content,
      link_url: p.link_url,
      created_at: p.created_at,
      likes: p.likes,
      comment_count,
    };
  });
}

export async function createPost(authorId: string, content: string, linkUrl?: string): Promise<void> {
  const db = getDB();
  db.posts.push({
    id: uid(),
    author_id: authorId,
    content,
    link_url: linkUrl || '',
    created_at: new Date().toISOString(),
    likes: 0
  });
  persist();
}

export async function likePost(postId: string): Promise<void> {
  const db = getDB();
  const post = db.posts.find(p => p.id === postId);
  if (post) {
    post.likes += 1;
    persist();
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  const db = getDB();
  return db.comments
    .filter(c => c.post_id === postId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map(c => {
      const author = db.users.find(u => u.id === c.author_id);
      return {
        id: c.id,
        post_id: c.post_id,
        author_id: c.author_id,
        author_name: author?.name,
        author_role: author?.role,
        content: c.content,
        created_at: c.created_at,
      };
    });
}

export async function addComment(postId: string, authorId: string, content: string): Promise<void> {
  const db = getDB();
  db.comments.push({
    id: uid(),
    post_id: postId,
    author_id: authorId,
    content,
    created_at: new Date().toISOString(),
  });
  persist();
}

export async function getAllSubjects(): Promise<string[]> {
  const db = getDB();
  return [...new Set(db.books.map(b => b.subject))].sort();
}
