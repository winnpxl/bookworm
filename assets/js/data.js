/* Bookworm — demo dataset.
   Everything the "AI" says here is pre-written sample analysis for the prototype. */

const BOOKS = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    year: 2018,
    pages: 320,
    category: 'Self-Development',
    tags: ['Behaviour', 'Systems', 'Practical'],
    status: 'read',
    progress: 100,
    rating: 5,
    score: 91,
    verdict: 'read',
    verdictLine: 'Read it — then actually run the four laws for a month.',
    hours: 5.5,
    art: { pattern: 'orbit', bg: '#e8f1ff', accent: '#3b82f6', ink: '#08304c' },
    summary: 'Clear argues that outcomes are lagging indicators of systems, so the useful unit of change is the 1% habit rather than the goal. The engine of the book is a four-part loop — make it obvious, attractive, easy and satisfying — applied to building good habits and inverted to break bad ones.',
    takeaways: [
      'Identity comes before behaviour: decide who you are, and the habits follow.',
      'Environment design beats willpower — reduce friction by two steps, not two percent.',
      'Never miss twice; the second miss is what starts a new habit.'
    ],
    signals: { depth: 62, pace: 88, practicality: 96, originality: 58 },
    whyForYou: 'You finished Deep Work and Range and rated both five stars. This sits in the same behavioural-systems lane but is far lighter on theory — closer to a manual you keep on the desk.',
    bestFor: 'Anyone who has read three productivity books and changed nothing.',
    skipIf: 'You already know the habit loop from Duhigg — the first 80 pages will feel like revision.',
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    similar: ['deep-work', 'psychology-money', 'range']
  },
  {
    id: 'project-hail-mary',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    year: 2021,
    pages: 496,
    category: 'Science Fiction',
    tags: ['Hard SF', 'Survival', 'Friendship'],
    status: 'reading',
    progress: 64,
    rating: 0,
    score: 95,
    verdict: 'read',
    verdictLine: 'Read it — and clear the weekend before you start chapter one.',
    hours: 9,
    art: { pattern: 'horizon', bg: '#08304c', accent: '#ffc837', ink: '#ffffff' },
    summary: 'A lone amnesiac wakes on a spacecraft with two dead crewmates and no memory of why he is there, rebuilding both his past and a plan to save the Sun through improvised science. The middle turn introduces a companion that reframes the whole book from a survival puzzle into a story about friendship across an impossible gap.',
    takeaways: [
      'Problem-solving is the plot — every chapter is a hypothesis and a test.',
      'The dual timeline pays off; the flashbacks are not filler.',
      'Warmer and funnier than The Martian, with real emotional stakes.'
    ],
    signals: { depth: 54, pace: 94, practicality: 12, originality: 88 },
    whyForYou: 'You read The Three-Body Problem in nine days — your fastest of the year. This has the same science-forward spine but a much kinder heart, so expect a similar pace.',
    bestFor: 'Readers who want engineering thinking wrapped in genuine warmth.',
    skipIf: 'Technical exposition tires you — there is a lot of it, and it is the point.',
    quote: 'I penetrated the outer cell membrane with a nanosyringe.',
    similar: ['three-body', 'klara', 'piranesi']
  },
  {
    id: 'thinking-fast-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    year: 2011,
    pages: 499,
    category: 'Psychology',
    tags: ['Cognition', 'Dense', 'Landmark'],
    status: 'want',
    progress: 0,
    rating: 0,
    score: 71,
    verdict: 'skim',
    verdictLine: 'Skim it — parts I, III and V carry almost all the value.',
    hours: 14,
    art: { pattern: 'prism', bg: '#f0e9ff', accent: '#8e51ff', ink: '#08304c' },
    summary: 'Kahneman splits thought into System 1, fast and intuitive, and System 2, slow and effortful, then catalogues the biases that follow from letting the first one drive. The later sections on prospect theory and the difference between the experiencing and remembering self are the most original, and the least summarised elsewhere.',
    takeaways: [
      'Anchoring, availability and loss aversion explain most bad everyday judgement.',
      'The remembering self, not the experiencing self, makes your decisions.',
      'Several priming studies here did not survive replication — read part II critically.'
    ],
    signals: { depth: 96, pace: 34, practicality: 61, originality: 84 },
    whyForYou: 'Your last four non-fiction finishes averaged 280 pages. At 499 dense pages this is twice your usual commitment, which is why the verdict is skim rather than read.',
    bestFor: 'Readers who want the primary source rather than the summaries of it.',
    skipIf: 'You want tactics. This is a description of the machinery, not a manual.',
    quote: 'Nothing in life is as important as you think it is while you are thinking about it.',
    similar: ['psychology-money', 'sapiens', 'never-split']
  },
  {
    id: 'midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    year: 2020,
    pages: 304,
    category: 'Literary Fiction',
    tags: ['Speculative', 'Gentle', 'Grief'],
    status: 'read',
    progress: 100,
    rating: 3,
    score: 58,
    verdict: 'skim',
    verdictLine: 'A comforting read, but the premise resolves early.',
    hours: 5,
    art: { pattern: 'arcs', bg: '#d7ffe2', accent: '#00cc3d', ink: '#08304c' },
    summary: 'Between life and death sits a library of every life its heroine could have lived, and she tries them one by one looking for the one worth staying in. The concept is generous and the prose is easy, though the moral arrives well before the final chapter and then repeats.',
    takeaways: [
      'A clean, kind premise executed with real emotional intelligence.',
      'The regret framework is the memorable part; the plot is secondary.',
      'Around the halfway mark the parallel lives start to rhyme with each other.'
    ],
    signals: { depth: 44, pace: 82, practicality: 20, originality: 55 },
    whyForYou: 'You rate quiet, character-led fiction highly, but you tend to abandon books whose central idea resolves early. This one does, which is why it lands at 58.',
    bestFor: 'A single-sitting comfort read during a hard week.',
    skipIf: 'You want ambiguity. Every question here gets an answer.',
    quote: 'The only way to learn is to live.',
    similar: ['klara', 'circe', 'song-achilles']
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    year: 2011,
    pages: 443,
    category: 'History',
    tags: ['Big Ideas', 'Sweeping', 'Debated'],
    status: 'read',
    progress: 100,
    rating: 4,
    score: 83,
    verdict: 'read',
    verdictLine: 'Read it for the framing, verify the specifics elsewhere.',
    hours: 11,
    art: { pattern: 'strata', bg: '#ffebd6', accent: '#ffa130', ink: '#08304c' },
    summary: 'Harari runs seventy thousand years of human history through one idea: our species dominates because it can coordinate in large numbers around shared fictions such as money, nations and law. It is a synthesis rather than original research, and its confidence occasionally outruns the evidence.',
    takeaways: [
      'Shared imagined orders are the technology behind every large society.',
      'The agricultural revolution improved the species and worsened the individual.',
      'Specialists dispute several claims — treat it as a lens, not a reference.'
    ],
    signals: { depth: 78, pace: 66, practicality: 30, originality: 79 },
    whyForYou: 'History is your third-largest category by finished books, and you finish sweeping-synthesis titles at 92% versus 61% for narrow monographs.',
    bestFor: 'Building a scaffold you can hang later history on.',
    skipIf: 'You want rigour over readability — this trades the first for the second.',
    quote: 'Large numbers of strangers can cooperate successfully by believing in common myths.',
    similar: ['thinking-fast-slow', 'educated', 'range']
  },
  {
    id: 'klara',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    year: 2021,
    pages: 303,
    category: 'Literary Fiction',
    tags: ['Quiet SF', 'Restrained', 'Devastating'],
    status: 'want',
    progress: 0,
    rating: 0,
    score: 88,
    verdict: 'read',
    verdictLine: 'Read it slowly — the restraint is doing the work.',
    hours: 6,
    art: { pattern: 'eclipse', bg: '#ffebd6', accent: '#ff4940', ink: '#08304c' },
    summary: 'An artificial friend narrates her time with the child she was bought for, understanding almost everything and quite a lot wrongly. Ishiguro withholds nearly all exposition, so the reader assembles a bleak world out of what Klara does not know she is telling us.',
    takeaways: [
      'An unreliable narrator used for tenderness rather than for a twist.',
      'The sparse prose is deliberate — very little is explained outright.',
      'The last twenty pages recontextualise the entire book.'
    ],
    signals: { depth: 86, pace: 48, practicality: 8, originality: 82 },
    whyForYou: 'You gave Never Let Me Go five stars and finished it in four days. Same author, same withheld-information technique, similar length.',
    bestFor: 'Readers who prefer implication to explanation.',
    skipIf: 'You need plot momentum — very little happens on the surface.',
    quote: 'There was something very special, but it wasn’t inside her.',
    similar: ['piranesi', 'midnight-library', 'project-hail-mary']
  },
  {
    id: 'psychology-money',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    year: 2020,
    pages: 256,
    category: 'Finance',
    tags: ['Behaviour', 'Short Essays', 'Calm'],
    status: 'read',
    progress: 100,
    rating: 5,
    score: 89,
    verdict: 'read',
    verdictLine: 'Read it — nineteen short essays, none of them wasted.',
    hours: 4.5,
    art: { pattern: 'grid', bg: '#d7ffe2', accent: '#00cc3d', ink: '#08304c' },
    summary: 'Housel argues that doing well with money is a behavioural skill rather than a technical one, and that reasonable beats rational because you have to be able to sleep. Each chapter is a self-contained essay, which makes the book unusually easy to finish and easy to return to.',
    takeaways: [
      'Wealth is the money you do not spend — it is invisible by definition.',
      'Room for error is the only reliable protection against being wrong.',
      'Nobody is crazy; everyone is optimising for a different set of experiences.'
    ],
    signals: { depth: 58, pace: 90, practicality: 84, originality: 72 },
    whyForYou: 'Short-chapter non-fiction is your highest completion format at 94%. This is nineteen chapters averaging thirteen pages.',
    bestFor: 'Anyone whose money problem is behavioural, not mathematical.',
    skipIf: 'You want portfolio mechanics — there are almost no numbers here.',
    quote: 'Doing well with money has little to do with how smart you are.',
    similar: ['atomic-habits', 'thinking-fast-slow', 'never-split']
  },
  {
    id: 'piranesi',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    year: 2020,
    pages: 245,
    category: 'Fantasy',
    tags: ['Strange', 'Puzzle', 'Beautiful'],
    status: 'read',
    progress: 100,
    rating: 5,
    score: 93,
    verdict: 'read',
    verdictLine: 'Read it — and go in knowing as little as possible.',
    hours: 4,
    art: { pattern: 'columns', bg: '#e8f1ff', accent: '#26c0ff', ink: '#08304c' },
    summary: 'A man lives in an endless house of statues and tides, keeping meticulous journals of a world he believes contains only fifteen people. The mystery unfolds entirely through what he notices, and the pleasure is watching a gentle narrator slowly out-read his own diary.',
    takeaways: [
      'Structurally perfect — nothing in 245 pages is decorative.',
      'The journal form does the plotting, the atmosphere and the reveal at once.',
      'Its warmth is unusual for a book this eerie.'
    ],
    signals: { depth: 88, pace: 74, practicality: 6, originality: 97 },
    whyForYou: 'Your highest-rated books share one trait: an unreliable narrator with a limited view. This is the purest example on your shelf.',
    bestFor: 'Readers who want to be disoriented on purpose.',
    skipIf: 'You want the world explained on page one. It is not.',
    quote: 'The Beauty of the House is immeasurable; its Kindness infinite.',
    similar: ['klara', 'babel', 'circe']
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    year: 2016,
    pages: 296,
    category: 'Productivity',
    tags: ['Focus', 'Opinionated', 'Practical'],
    status: 'read',
    progress: 100,
    rating: 4,
    score: 79,
    verdict: 'read',
    verdictLine: 'Read part one, then use part two as a menu.',
    hours: 5.5,
    art: { pattern: 'stripes', bg: '#08304c', accent: '#26c0ff', ink: '#ffffff' },
    summary: 'Newport claims that the ability to concentrate without distraction is becoming both rarer and more valuable, then prescribes four disciplines for protecting it. The argument in the first half is stronger than the tactics in the second, some of which assume a great deal of control over your own calendar.',
    takeaways: [
      'Schedule depth explicitly; it will not survive as a default.',
      'Boredom tolerance is trainable and is upstream of focus.',
      'The advice suits academics more comfortably than it suits managers.'
    ],
    signals: { depth: 70, pace: 72, practicality: 80, originality: 64 },
    whyForYou: 'It pairs directly with Atomic Habits, which you rated five — Newport supplies the why, Clear supplies the how.',
    bestFor: 'Knowledge workers whose calendar is currently deciding their priorities.',
    skipIf: 'Your job is fundamentally reactive — half the tactics will not survive contact.',
    quote: 'Clarity about what matters provides clarity about what does not.',
    similar: ['atomic-habits', 'range', 'thinking-fast-slow']
  },
  {
    id: 'circe',
    title: 'Circe',
    author: 'Madeline Miller',
    year: 2018,
    pages: 393,
    category: 'Mythology',
    tags: ['Retelling', 'Lyrical', 'Slow Burn'],
    status: 'want',
    progress: 0,
    rating: 0,
    score: 86,
    verdict: 'read',
    verdictLine: 'Read it — the middle third is the best writing of the year.',
    hours: 8,
    art: { pattern: 'wave', bg: '#ffebd6', accent: '#e600c2', ink: '#08304c' },
    summary: 'Miller retells the life of the witch of Aiaia from the inside, turning a footnote in the Odyssey into a long study of exile, motherhood and the cost of choosing mortality. The pace is deliberately unhurried and the prose does most of the carrying.',
    takeaways: [
      'A minor mythological figure given a full interior life.',
      'The exile sections are quiet by design — this is not an adventure.',
      'No knowledge of Greek myth is required.'
    ],
    signals: { depth: 76, pace: 56, practicality: 5, originality: 74 },
    whyForYou: 'You finished The Song of Achilles in six days and rated it five. Same author, longer, quieter, and stronger on character.',
    bestFor: 'Readers who want sentences to slow down for.',
    skipIf: 'You are looking for plot per page — this trades it for interiority.',
    quote: 'I thought: I cannot bear this world a moment longer.',
    similar: ['song-achilles', 'piranesi', 'babel']
  },
  {
    id: 'three-body',
    title: 'The Three-Body Problem',
    author: 'Cixin Liu',
    year: 2008,
    pages: 400,
    category: 'Science Fiction',
    tags: ['Hard SF', 'Cosmic', 'Cold'],
    status: 'read',
    progress: 100,
    rating: 4,
    score: 81,
    verdict: 'read',
    verdictLine: 'Read it for the ideas; forgive the characters.',
    hours: 9,
    art: { pattern: 'orbit', bg: '#08304c', accent: '#ad46ff', ink: '#ffffff' },
    summary: 'A physicist investigating a wave of scientist suicides finds a virtual-reality game that turns out to be a recruitment tool for a civilisation on a world with three suns. The scale of the ideas is enormous; the characterisation is functional and deliberately so.',
    takeaways: [
      'The Cultural Revolution opening reframes everything that follows.',
      'The physics is the point, and it goes further than most SF dares.',
      'Book one is setup — the payoff is largely in the sequel.'
    ],
    signals: { depth: 84, pace: 58, practicality: 10, originality: 93 },
    whyForYou: 'Cosmic-scale SF is your fastest-finishing genre, but you have marked two of three sequels as unfinished, so treat the trilogy as optional.',
    bestFor: 'Readers who want the idea to be the protagonist.',
    skipIf: 'You need to care about the people. You mostly will not.',
    quote: 'In the sea of stars, we are the ones who are dark.',
    similar: ['project-hail-mary', 'klara', 'sapiens']
  },
  {
    id: 'educated',
    title: 'Educated',
    author: 'Tara Westover',
    year: 2018,
    pages: 334,
    category: 'Memoir',
    tags: ['True Story', 'Intense', 'Family'],
    status: 'reading',
    progress: 27,
    rating: 0,
    score: 87,
    verdict: 'read',
    verdictLine: 'Read it — but pace yourself, it is heavier than it looks.',
    hours: 7,
    art: { pattern: 'strata', bg: '#f0e9ff', accent: '#8e51ff', ink: '#08304c' },
    summary: 'Westover grows up in a survivalist family with no birth certificate and no schooling, and ends up with a Cambridge doctorate. The book is less about education than about what it costs to revise the story your family tells about you.',
    takeaways: [
      'The self-doubt is the real subject; the escape is the frame.',
      'Westover repeatedly marks where her memory and her family’s diverge.',
      'Contains sustained descriptions of physical harm and coercion.'
    ],
    signals: { depth: 82, pace: 76, practicality: 24, originality: 70 },
    whyForYou: 'Memoir is only 6% of your shelf, but you rated both you finished five stars — a small, reliable category worth feeding.',
    bestFor: 'Readers drawn to the mechanics of leaving a belief system.',
    skipIf: 'You are looking for something light. It is not.',
    quote: 'You can love someone and still choose to say goodbye to them.',
    similar: ['sapiens', 'range', 'midnight-library']
  },
  {
    id: 'never-split',
    title: 'Never Split the Difference',
    author: 'Chris Voss',
    year: 2016,
    pages: 274,
    category: 'Negotiation',
    tags: ['Tactical', 'Anecdotal', 'Punchy'],
    status: 'want',
    progress: 0,
    rating: 0,
    score: 74,
    verdict: 'skim',
    verdictLine: 'Skim it — the tactics are excellent, the war stories are padding.',
    hours: 5,
    art: { pattern: 'prism', bg: '#e8f1ff', accent: '#ff4940', ink: '#08304c' },
    summary: 'A former FBI hostage negotiator reframes negotiation as applied empathy rather than compromise, built on tactical mirroring, labelling and calibrated questions. The techniques are genuinely usable; the hostage anecdotes that frame each one take up more room than they need.',
    takeaways: [
      'Labelling an emotion out loud defuses it faster than arguing with it.',
      '"No" is the start of the conversation, not the end.',
      'Calibrated "how" questions move the work onto the other side.'
    ],
    signals: { depth: 48, pace: 86, practicality: 92, originality: 66 },
    whyForYou: 'You have three practical-skills books in progress. This one is short enough to finish, but the chapter summaries carry most of the value.',
    bestFor: 'Anyone who negotiates weekly and has no framework for it.',
    skipIf: 'You dislike advice delivered through anecdote — that is the whole structure.',
    quote: 'He who has learned to disagree without being disagreeable has discovered the most valuable secret.',
    similar: ['psychology-money', 'thinking-fast-slow', 'atomic-habits']
  },
  {
    id: 'babel',
    title: 'Babel',
    author: 'R. F. Kuang',
    year: 2022,
    pages: 545,
    category: 'Fantasy',
    tags: ['Dark Academia', 'Angry', 'Long'],
    status: 'want',
    progress: 0,
    rating: 0,
    score: 68,
    verdict: 'skim',
    verdictLine: 'Brilliant premise, heavy delivery — start it when you have a clear week.',
    hours: 12,
    art: { pattern: 'columns', bg: '#08304c', accent: '#ffa130', ink: '#ffffff' },
    summary: 'In an alternate Oxford, translation is literal magic and the empire runs on the meanings lost between languages. The central conceit is superb, though the novel states its argument in the text as often as it dramatises it, and 545 pages is a long time to be told.',
    takeaways: [
      'The silver-working magic system is one of the best in recent fantasy.',
      'The footnotes are worth reading and slow the pace considerably.',
      'The politics are explicit rather than implied — by design.'
    ],
    signals: { depth: 90, pace: 42, practicality: 8, originality: 89 },
    whyForYou: 'Your average finished book this year is 318 pages. You have abandoned four of five books over 500. That length risk is the whole reason this is a skim.',
    bestFor: 'Readers who love etymology as much as plot.',
    skipIf: 'You want subtext. The text says it out loud.',
    quote: 'Translation means doing violence upon the original.',
    similar: ['piranesi', 'circe', 'three-body']
  },
  {
    id: 'song-achilles',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    year: 2011,
    pages: 378,
    category: 'Mythology',
    tags: ['Retelling', 'Romance', 'Tragic'],
    status: 'read',
    progress: 100,
    rating: 5,
    score: 90,
    verdict: 'read',
    verdictLine: 'Read it — you already know how it ends and it will still land.',
    hours: 7,
    art: { pattern: 'wave', bg: '#d7ffe2', accent: '#ffc837', ink: '#08304c' },
    summary: 'The Iliad retold from Patroclus’s point of view, so that the war arrives as a slow inevitability behind a love story. Miller’s achievement is making a famous ending feel like a surprise.',
    takeaways: [
      'Patroclus as narrator turns an epic into an intimate story.',
      'The first half is pastoral and gentle; the second is not.',
      'Reads like literary fiction that happens to contain gods.'
    ],
    signals: { depth: 72, pace: 80, practicality: 4, originality: 68 },
    whyForYou: 'One of your five-star reads — kept here because Circe is scored against it.',
    bestFor: 'Readers who want myth at human scale.',
    skipIf: 'Tragedy is not what you are looking for right now.',
    quote: 'I could recognise him by touch alone, by smell.',
    similar: ['circe', 'piranesi', 'midnight-library']
  },
  {
    id: 'range',
    title: 'Range',
    author: 'David Epstein',
    year: 2019,
    pages: 352,
    category: 'Self-Development',
    tags: ['Generalists', 'Research', 'Reassuring'],
    status: 'read',
    progress: 100,
    rating: 5,
    score: 84,
    verdict: 'read',
    verdictLine: 'Read it if you have ever been told to specialise.',
    hours: 7,
    art: { pattern: 'grid', bg: '#ffebd6', accent: '#00cc3d', ink: '#08304c' },
    summary: 'Epstein makes the case that in "wicked" learning environments, breadth of experience beats a ten-thousand-hour head start, using sport, science and music as evidence. It reads as a direct rebuttal to early-specialisation orthodoxy.',
    takeaways: [
      'Match strategy to environment: kind domains reward practice, wicked ones reward breadth.',
      'A late start with more sampling often outperforms an early narrow one.',
      'Analogical thinking is the transferable skill generalists actually have.'
    ],
    signals: { depth: 74, pace: 78, practicality: 62, originality: 76 },
    whyForYou: 'Rated five stars in March. Its argument runs directly against Deep Work — reading them together is why your notes on both are your longest.',
    bestFor: 'Career changers and anyone with an unruly CV.',
    skipIf: 'You want a plan. This is an argument, not a programme.',
    quote: 'Compare yourself to yourself yesterday, not to younger people who are not you.',
    similar: ['deep-work', 'atomic-habits', 'sapiens']
  }
];

const CATEGORIES = ['All', ...Array.from(new Set(BOOKS.map(b => b.category))).sort()];

const STATUS_LABEL = { read: 'Read', reading: 'Reading', want: 'Want to read', none: 'Add to shelf' };

const TESTIMONIALS = [
  {
    name: 'Amara Okonkwo',
    role: 'Product designer, Lagos',
    art: { bg: '#e8f1ff', accent: '#3b82f6' },
    quote: 'It told me to skip a 600-page bestseller everyone was posting about. Three friends later confirmed it. That one call paid for the year.'
  },
  {
    name: 'Daniel Reyes',
    role: 'PhD student, Madrid',
    art: { bg: '#ffebd6', accent: '#ff4940' },
    quote: 'The pre-read summary is the feature. I know the shape of the argument before page one, so I read faster and remember more.'
  },
  {
    name: 'Mei Lin Tan',
    role: 'Founder, Singapore',
    art: { bg: '#d7ffe2', accent: '#00cc3d' },
    quote: 'My shelf finally reflects reality. Forty-one finished, nine abandoned, and Bookworm knows exactly why I abandoned each one.'
  }
];

const FAQS = [
  {
    q: 'How does Bookworm decide whether I should read a book?',
    a: 'It weighs the book itself — density, length, structure, subject — against your own history: what you finish, what you abandon, how fast you read each genre, and what you have rated highly. The score you see is that comparison, not a public average. Two people can get 91 and 44 for the same title.'
  },
  {
    q: 'Does the summary spoil the book?',
    a: 'No. Every pre-read summary is spoiler-bounded: it describes structure, argument and tone, and stops at the point where knowing more would change the experience. Fiction gets a stricter boundary than non-fiction. You can unlock a full summary after you mark a book as read.'
  },
  {
    q: 'Where do the books come from?',
    a: 'Search a title, scan a cover, paste a link, or import an existing shelf. Bookworm matches editions, so the 1996 paperback and the audiobook you started last month become one entry with one reading history.'
  },
  {
    q: 'What happens to my reading data?',
    a: 'It stays yours. Your shelf is private by default, nothing is sold or used to train public models, and you can export the whole history — books, notes, ratings, verdicts — as JSON at any time.'
  },
  {
    q: 'Can I disagree with the verdict?',
    a: 'Please do. Every verdict has a thumbs up and down, and overriding one retrains your profile immediately. Readers who correct Bookworm ten times in their first month get noticeably sharper recommendations afterwards.'
  }
];

const STEPS = [
  {
    n: '01',
    title: 'Add the book',
    body: 'Search a title, scan a cover with your camera, or paste any store link. Bookworm resolves the edition and pulls in the structure of the book.',
    wash: 'wash-sky'
  },
  {
    n: '02',
    title: 'Read the verdict',
    body: 'A spoiler-safe summary, the category it really belongs to, an honest time estimate, and a straight answer: read, skim, or skip.',
    wash: 'wash-peach'
  },
  {
    n: '03',
    title: 'Track and get more',
    body: 'Mark it reading, read or abandoned. Every signal sharpens the next recommendation, so the shelf gets more accurate the more you use it.',
    wash: 'wash-mint'
  }
];

const FEATURES = [
  {
    eyebrow: 'Pre-read summary',
    title: 'Know the shape of a book before page one.',
    body: 'Bookworm reads the whole thing and hands back the argument, the structure and the tone in ninety seconds — without spoiling the parts that are worth arriving at yourself.',
    points: ['Spoiler-bounded by default', 'Chapter-level map for non-fiction', 'Honest hours-to-finish, not page count'],
    wash: 'wash-sky'
  },
  {
    eyebrow: 'The verdict',
    title: 'A straight answer: read, skim, or skip.',
    body: 'Every book is scored against your reading history rather than a crowd average. If a 545-page novel is a bad bet for the way you actually read, Bookworm will say so instead of flattering it.',
    points: ['Scored for you, not for everyone', 'Says why, in one sentence', 'Disagree once and it adapts'],
    wash: 'wash-peach'
  },
  {
    eyebrow: 'Recommendations',
    title: 'Next books chosen from evidence, not vibes.',
    body: 'The engine watches what you finish, what you abandon and how quickly, then reaches for books that match the reader you are rather than the reader you follow.',
    points: ['Reasons attached to every pick', 'Learns from abandonment too', 'Adjustable — ask for shorter, lighter, harder'],
    wash: 'wash-mint'
  }
];

const STATS = [
  { n: '2.4M', l: 'Books analysed' },
  { n: '92%', l: 'Verdicts readers agreed with' },
  { n: '9 hrs', l: 'Saved per reader, per month' },
  { n: '41', l: 'Average books finished a year' }
];
