/**
 * db.ts — Simple in-memory JSON store with localStorage persistence
 * No WASM, no SQL, no network requests. Works instantly everywhere.
 */

const LS_KEY = 'opac_db_v3';
const SEEDED_KEY = 'opac_seeded_v3';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface DbBook {
  id: string; title: string; authors: string; subject: string;
  call_number: string; format: string; cover_url: string;
  description: string; published_year: number; isbn: string;
}
export interface DbLocation {
  book_id: string; library: string; floor: string; section: string;
  shelf_row: string; bay: string; grid_row: number; grid_col: number;
}
export interface DbUser {
  id: string; name: string; institute_id: string; role: string;
  email: string; password: string; avatar_url: string;
  bio?: string; department?: string; skills?: string[]; interests?: string[];
}
export interface DbLoan {
  id: string; user_id: string; book_id: string; issued_date: string;
  due_date: string; returned_date: string | null; status: string;
}
export interface DbHold {
  id: string; user_id: string; book_id: string; status: string;
  queue_position: number; created_at: string;
}
export interface DbCollection {
  id: string; owner_id: string; name: string; visibility: string; created_at: string;
}
export interface DbCollectionBook { collection_id: string; book_id: string; }
export interface DbRecommendation {
  id: string; source_type: string; source_user_id: string;
  subject: string; book_id: string; note: string;
}
export interface DbReview {
  id: string; user_id: string; book_id: string; rating: number;
  review_text: string; created_at: string;
}
export interface DbReadingHistory {
  id: string; user_id: string; book_id: string; opened_at: string;
}
export interface DbPost {
  id: string; author_id: string; content: string;
  link_url?: string; created_at: string; likes: number;
}
export interface DbComment {
  id: string; post_id: string; author_id: string; content: string; created_at: string;
}

export interface AppDB {
  books: DbBook[];
  locations: DbLocation[];
  users: DbUser[];
  loans: DbLoan[];
  holds: DbHold[];
  collections: DbCollection[];
  collection_books: DbCollectionBook[];
  recommendations: DbRecommendation[];
  reviews: DbReview[];
  reading_history: DbReadingHistory[];
  posts: DbPost[];
  comments: DbComment[];
}

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const SEED_DATA: AppDB = {
  books: [
    { id:'b1', title:'Introduction to Algorithms', authors:'["Thomas H. Cormen","Charles E. Leiserson","Ronald L. Rivest"]', subject:'Computer Science', call_number:'QA76.9.A43 C67 2022', format:'both', cover_url:'https://covers.openlibrary.org/b/id/8739161-L.jpg', description:'A comprehensive introduction to algorithms.', published_year:2022, isbn:'9780262046305' },
    { id:'b2', title:'Design Patterns: Elements of Reusable Object-Oriented Software', authors:'["Erich Gamma","Richard Helm","Ralph Johnson","John Vlissides"]', subject:'Computer Science', call_number:'QA76.64 .D47 1995', format:'physical', cover_url:'https://covers.openlibrary.org/b/id/8091016-L.jpg', description:'23 classic design patterns for object-oriented software.', published_year:1995, isbn:'9780201633610' },
    { id:'b3', title:'The Design of Everyday Things', authors:'["Don Norman"]', subject:'Design', call_number:'TS171.4 .N67 2013', format:'both', cover_url:'https://covers.openlibrary.org/b/id/8739735-L.jpg', description:'A powerful primer on how design serves as the interface between objects and users.', published_year:2013, isbn:'9780465050659' },
    { id:'b4', title:'Universal Principles of Design', authors:'["William Lidwell","Kritina Holden","Jill Butler"]', subject:'Design', call_number:'NK1510 .L53 2010', format:'physical', cover_url:'https://covers.openlibrary.org/b/id/8091374-L.jpg', description:'125 ways to enhance usability, influence perception, increase appeal.', published_year:2010, isbn:'9781592535873' },
    { id:'b5', title:'Thinking, Fast and Slow', authors:'["Daniel Kahneman"]', subject:'Psychology', call_number:'BF441 .K26 2011', format:'ebook', cover_url:'https://covers.openlibrary.org/b/id/7984916-L.jpg', description:'A groundbreaking tour of the mind.', published_year:2011, isbn:'9780374533557' },
    { id:'b6', title:'Atomic Habits', authors:'["James Clear"]', subject:'Self-Development', call_number:'BF335 .C54 2018', format:'both', cover_url:'https://covers.openlibrary.org/b/id/12547191-L.jpg', description:'An easy and proven way to build good habits and break bad ones.', published_year:2018, isbn:'9780735211292' },
    { id:'b7', title:'Clean Code: A Handbook of Agile Software Craftsmanship', authors:'["Robert C. Martin"]', subject:'Computer Science', call_number:'QA76.76.D47 M36 2009', format:'physical', cover_url:'https://covers.openlibrary.org/b/id/8091129-L.jpg', description:'Teaches the principles and patterns of writing clean code.', published_year:2009, isbn:'9780132350884' },
    { id:'b8', title:'Structural Analysis', authors:'["R.C. Hibbeler"]', subject:'Civil Engineering', call_number:'TA645 .H53 2018', format:'physical', cover_url:'https://covers.openlibrary.org/b/id/8091252-L.jpg', description:'Clear and thorough presentation of structural analysis theory.', published_year:2018, isbn:'9780134610672' },
    { id:'b9', title:'Engineering Mathematics', authors:'["K.A. Stroud","Dexter Booth"]', subject:'Mathematics', call_number:'QA401 .S77 2013', format:'both', cover_url:'https://covers.openlibrary.org/b/id/8091350-L.jpg', description:'The best-selling introductory mathematics textbook.', published_year:2013, isbn:'9781137031204' },
    { id:'b10', title:'Materials Science and Engineering: An Introduction', authors:'["William D. Callister Jr.","David G. Rethwisch"]', subject:'Materials Engineering', call_number:'TA403 .C23 2018', format:'physical', cover_url:'https://covers.openlibrary.org/b/id/8091287-L.jpg', description:'Promotes student understanding of metals, ceramics, and polymers.', published_year:2018, isbn:'9781119405498' },
    { id:'b11', title:'Human-Computer Interaction', authors:'["Alan Dix","Janet Finlay","Gregory Abowd","Russell Beale"]', subject:'Design', call_number:'QA76.9.H85 D59 2004', format:'physical', cover_url:'https://covers.openlibrary.org/b/id/8091178-L.jpg', description:'A comprehensive introduction to HCI.', published_year:2004, isbn:'9780130461094' },
    { id:'b12', title:'Interaction Design: Beyond Human-Computer Interaction', authors:'["Helen Sharp","Yvonne Rogers","Jenny Preece"]', subject:'Design', call_number:'QA76.9.H85 S53 2019', format:'both', cover_url:'https://covers.openlibrary.org/b/id/8091199-L.jpg', description:'An accessible introduction to the multidisciplinary field of interaction design.', published_year:2019, isbn:'9781119547259' },
    { id:'b13', title:'Probability and Statistics for Engineers and Scientists', authors:'["Ronald E. Walpole","Raymond H. Myers"]', subject:'Mathematics', call_number:'QA273 .W35 2017', format:'physical', cover_url:'https://covers.openlibrary.org/b/id/8091312-L.jpg', description:'A rigorous introduction to probability and statistics.', published_year:2017, isbn:'9780134115856' },
    { id:'b14', title:'The Lean Startup', authors:'["Eric Ries"]', subject:'Management', call_number:'HD62.5 .R54 2011', format:'both', cover_url:'https://covers.openlibrary.org/b/id/8091088-L.jpg', description:'A new approach for continuous innovation.', published_year:2011, isbn:'9780307887894' },
    { id:'b15', title:"Don't Make Me Think", authors:'["Steve Krug"]', subject:'Design', call_number:'QA76.9.H85 K78 2014', format:'physical', cover_url:'https://covers.openlibrary.org/b/id/8091219-L.jpg', description:'A common sense approach to web usability.', published_year:2014, isbn:'9780321965516' },
  ],
  locations: [
    { book_id:'b1', library:'IIITDM Central Library', floor:'2nd Floor', section:'Computer Science', shelf_row:'C1', bay:'B3', grid_row:2, grid_col:3 },
    { book_id:'b2', library:'IIITDM Central Library', floor:'2nd Floor', section:'Computer Science', shelf_row:'C1', bay:'B4', grid_row:2, grid_col:4 },
    { book_id:'b3', library:'IIITDM Central Library', floor:'1st Floor', section:'Design & Arts', shelf_row:'D2', bay:'B1', grid_row:4, grid_col:1 },
    { book_id:'b4', library:'IIITDM Central Library', floor:'1st Floor', section:'Design & Arts', shelf_row:'D2', bay:'B2', grid_row:4, grid_col:2 },
    { book_id:'b7', library:'IIITDM Central Library', floor:'2nd Floor', section:'Computer Science', shelf_row:'C2', bay:'B1', grid_row:3, grid_col:1 },
    { book_id:'b8', library:'IIITDM Central Library', floor:'3rd Floor', section:'Engineering', shelf_row:'E1', bay:'B2', grid_row:1, grid_col:2 },
    { book_id:'b9', library:'IIITDM Central Library', floor:'1st Floor', section:'Mathematics', shelf_row:'M1', bay:'B3', grid_row:6, grid_col:3 },
    { book_id:'b10', library:'IIITDM Central Library', floor:'3rd Floor', section:'Engineering', shelf_row:'E2', bay:'B1', grid_row:2, grid_col:1 },
    { book_id:'b11', library:'IIITDM Central Library', floor:'1st Floor', section:'Design & Arts', shelf_row:'D3', bay:'B1', grid_row:5, grid_col:1 },
    { book_id:'b12', library:'IIITDM Central Library', floor:'1st Floor', section:'Design & Arts', shelf_row:'D3', bay:'B2', grid_row:5, grid_col:2 },
    { book_id:'b13', library:'IIITDM Central Library', floor:'1st Floor', section:'Mathematics', shelf_row:'M2', bay:'B1', grid_row:7, grid_col:1 },
    { book_id:'b14', library:'IIITDM Central Library', floor:'3rd Floor', section:'Management', shelf_row:'G1', bay:'B2', grid_row:3, grid_col:2 },
    { book_id:'b15', library:'IIITDM Central Library', floor:'1st Floor', section:'Design & Arts', shelf_row:'D1', bay:'B3', grid_row:3, grid_col:3 },
  ],
  users: [
    { id:'u1', name:'Payal Priyadarshini', institute_id:'MDes2026001', role:'student', email:'payal@iiitdmj.ac.in', password:'12345', avatar_url:'', bio:'Design enthusiast and UI/UX learner. Passionate about making technology accessible.', department:'Computer Science and Design', skills:['Figma','React','User Research'], interests:['HCI','Typography','Psychology'] },
    { id:'u2', name:'Dr. Ashish Verma', institute_id:'FAC2020003', role:'faculty', email:'ashish@iiitdmj.ac.in', password:'12345', avatar_url:'', bio:'Professor of HCI. Focus on accessible interfaces.', department:'Computer Science and Engineering', skills:['HCI','Usability Testing','System Design'], interests:['Research','Teaching','Accessibility'] },
    { id:'u3', name:'Ravi Kumar', institute_id:'BTech2024015', role:'student', email:'ravi@iiitdmj.ac.in', password:'12345', avatar_url:'', bio:'Competitive programmer and aspiring software engineer.', department:'Computer Science and Engineering', skills:['C++','Python','Algorithms'], interests:['Open Source','Machine Learning'] },
  ],
  loans: [
    { id:'l1', user_id:'u1', book_id:'b1', issued_date:'2026-08-20', due_date:'2026-09-20', returned_date:null, status:'active' },
    { id:'l2', user_id:'u1', book_id:'b3', issued_date:'2026-08-10', due_date:'2026-09-10', returned_date:null, status:'overdue' },
    { id:'l3', user_id:'u1', book_id:'b7', issued_date:'2026-07-15', due_date:'2026-08-15', returned_date:'2026-08-14', status:'returned' },
    { id:'l4', user_id:'u1', book_id:'b9', issued_date:'2026-06-01', due_date:'2026-07-01', returned_date:'2026-06-28', status:'returned' },
  ],
  holds: [
    { id:'h1', user_id:'u1', book_id:'b2', status:'waiting', queue_position:2, created_at:'2026-08-01' },
    { id:'h2', user_id:'u1', book_id:'b5', status:'ready', queue_position:1, created_at:'2026-08-15' },
  ],
  collections: [
    { id:'c1', owner_id:'u1', name:'UX Essentials', visibility:'private', created_at:'2026-07-01' },
    { id:'c2', owner_id:'u1', name:'Algorithms Prep', visibility:'private', created_at:'2026-07-15' },
    { id:'c3', owner_id:'u3', name:'Must-Read CS Classics', visibility:'public', created_at:'2026-08-01' },
    { id:'c4', owner_id:'u2', name:'Design Reading List', visibility:'public', created_at:'2026-08-10' },
  ],
  collection_books: [
    { collection_id:'c1', book_id:'b3' }, { collection_id:'c1', book_id:'b4' },
    { collection_id:'c1', book_id:'b11' }, { collection_id:'c1', book_id:'b15' },
    { collection_id:'c2', book_id:'b1' }, { collection_id:'c2', book_id:'b7' },
    { collection_id:'c3', book_id:'b1' }, { collection_id:'c3', book_id:'b2' }, { collection_id:'c3', book_id:'b7' },
    { collection_id:'c4', book_id:'b3' }, { collection_id:'c4', book_id:'b11' }, { collection_id:'c4', book_id:'b12' },
  ],
  recommendations: [
    { id:'r1', source_type:'faculty', source_user_id:'u2', subject:'Design', book_id:'b3', note:"Essential reading for all design students. Norman's insights on affordances are foundational." },
    { id:'r2', source_type:'faculty', source_user_id:'u2', subject:'Design', book_id:'b11', note:'Best comprehensive resource on HCI theory and practice for your thesis work.' },
    { id:'r3', source_type:'peer', source_user_id:'u3', subject:'Computer Science', book_id:'b1', note:'Absolutely essential for interviews and competitive programming. Read it cover to cover.' },
    { id:'r4', source_type:'peer', source_user_id:'u3', subject:'Computer Science', book_id:'b7', note:'Changed how I write code. Every developer should read this.' },
    { id:'r5', source_type:'faculty', source_user_id:'u2', subject:'Psychology', book_id:'b5', note:'Understanding cognitive biases is critical for designing intuitive user experiences.' },
  ],
  reviews: [],
  reading_history: [
    { id:'rh1', user_id:'u1', book_id:'b1', opened_at:'2026-08-20T10:00:00' },
    { id:'rh2', user_id:'u1', book_id:'b3', opened_at:'2026-08-22T14:30:00' },
    { id:'rh3', user_id:'u1', book_id:'b7', opened_at:'2026-08-25T09:15:00' },
    { id:'rh4', user_id:'u1', book_id:'b9', opened_at:'2026-09-01T11:00:00' },
    { id:'rh5', user_id:'u1', book_id:'b6', opened_at:'2026-09-05T16:00:00' },
    { id:'rh6', user_id:'u1', book_id:'b14', opened_at:'2026-09-08T13:00:00' },
  ],
  posts: [
      { id:'p1', author_id:'u2', content:'Just added some excellent new books on Human-Computer Interaction to the library. Highly recommend checking out "Don\'t Make Me Think" for your upcoming projects!', link_url:'https://iiitdm.ac.in/library/new-arrivals', created_at:'2026-09-12T09:00:00', likes:14 },
    { id:'p2', author_id:'u3', content:'Created a new public collection for everyone preparing for software engineering interviews. Algorithms and System Design books are included.', link_url:'', created_at:'2026-09-10T14:30:00', likes:8 },
    { id:'p3', author_id:'u2', content:'Reminder: The deadline for submitting your research paper drafts is approaching. Make sure to properly cite your sources using the IEEE format.', link_url:'', created_at:'2026-09-05T11:15:00', likes:22 }
  ],
  comments: [
    { id:'cm1', post_id:'p1', author_id:'u1', content:'Thank you Professor! I just reserved it.', created_at:'2026-09-12T10:30:00' },
    { id:'cm2', post_id:'p1', author_id:'u3', content:'Great recommendation! Already in my reading list 📚', created_at:'2026-09-12T11:00:00' },
    { id:'cm3', post_id:'p3', author_id:'u1', content:'What citation tool would you recommend for IEEE format?', created_at:'2026-09-05T12:00:00' },
  ],
};

// ─── Store ─────────────────────────────────────────────────────────────────────

let _store: AppDB | null = null;

function getStore(): AppDB {
  if (_store) return _store;

  const saved = localStorage.getItem(LS_KEY);
  if (saved && localStorage.getItem(SEEDED_KEY)) {
    try {
      const parsed = JSON.parse(saved) as Partial<AppDB>;
      // Migration: Ensure posts exist
      if (!parsed.posts) {
        parsed.posts = SEED_DATA.posts;
      }
      // Migration: Ensure comments exist
      if (!parsed.comments) {
        parsed.comments = SEED_DATA.comments;
      }
      // Migration: Ensure users have social fields
      if (parsed.users) {
        parsed.users = parsed.users.map(u => ({
          ...u,
          bio: u.bio || '',
          department: u.department || '',
          skills: u.skills || [],
          interests: u.interests || []
        }));
      }
      _store = parsed as AppDB;
      return _store;
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }

  // First launch — use seed data
  _store = JSON.parse(JSON.stringify(SEED_DATA)) as AppDB;
  localStorage.setItem(SEEDED_KEY, '1');
  save();
  return _store;
}

function save(): void {
  if (_store) localStorage.setItem(LS_KEY, JSON.stringify(_store));
}

// ─── Public API ────────────────────────────────────────────────────────────────

/** Returns the in-memory store (sync, instant) */
export function getDB(): AppDB {
  return getStore();
}

/** Persist changes to localStorage */
export function persist(): void {
  save();
}

/** Generate a simple unique ID */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Reset the DB (for testing) */
export function resetDB(): void {
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(SEEDED_KEY);
  _store = null;
  window.location.reload();
}
