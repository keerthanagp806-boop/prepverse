import bcrypt from 'bcryptjs';
import { User, Course, Assessment, CodingProblem, Company, AuditLog } from './types';

export const getSeedData = () => {
  const salt = bcrypt.genSaltSync(10);
  const studentPasswordHash = bcrypt.hashSync('Student@123', salt);
  const instructorPasswordHash = bcrypt.hashSync('Instructor@123', salt);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', salt);

  const users: User[] = [
    {
      id: 'usr-student-1',
      email: 'student@prepverse.edu',
      password: studentPasswordHash,
      name: 'Aditya Sharma',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      cgpa: 8.7,
      skills: ['Python', 'Data Structures', 'C++', 'SQL', 'DBMS', 'React'],
      createdAt: '2026-01-10T10:00:00.000Z',
    },
    {
      id: 'usr-instructor-1',
      email: 'instructor@prepverse.edu',
      password: instructorPasswordHash,
      name: 'Dr. Priya Varma',
      role: 'INSTRUCTOR',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      branch: 'Department of Computing',
      skills: ['Algorithms', 'System Design', 'AI & ML', 'Python'],
      createdAt: '2025-11-01T08:00:00.000Z',
    },
    {
      id: 'usr-admin-1',
      email: 'admin@prepverse.edu',
      password: adminPasswordHash,
      name: 'Platform Administrator',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      skills: ['Administration', 'Security', 'Compliance'],
      createdAt: '2025-08-01T09:00:00.000Z',
    }
  ];

  const courses: Course[] = [
    {
      id: 'crs-dsa-mastery',
      title: 'Complete Data Structures & Algorithms for Placements',
      description: 'Master time-complexity, trees, graphs, dynamic programming, and heaps with company-tested coding interview patterns.',
      instructorId: 'usr-instructor-1',
      instructorName: 'Dr. Priya Varma',
      category: 'DSA',
      difficulty: 'Intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc13c0d8f07?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      enrolledCount: 1420,
      status: 'published',
      createdAt: '2026-01-15T08:30:00.000Z',
      updatedAt: '2026-02-01T12:00:00.000Z',
      modules: [
        {
          id: 'mod-dsa-1',
          title: 'Module 1: Time & Space Complexity & Array Techniques',
          description: 'Big-O notation, Two Pointers, Sliding Window, and Prefix Sums.',
          lessons: [
            {
              id: 'les-dsa-101',
              title: 'Mastering Big-O Analysis & Amortized Complexity',
              durationMinutes: 25,
              content: `# Big-O Analysis & Complexity Essentials

In technical interviews at tier-1 product companies (Google, Microsoft, Amazon), every solution must be accompanied by accurate Big-O time and space complexity analysis.

### Key Complexity Classes (Fastest to Slowest):
1. **O(1)** — Constant time (e.g., Hash map lookup, Array indexing)
2. **O(log N)** — Logarithmic time (e.g., Binary search, Balanced BST lookup)
3. **O(N)** — Linear time (e.g., Single pass array traversal)
4. **O(N log N)** — Linearithmic time (e.g., Merge Sort, Quick Sort average case)
5. **O(N²)** — Quadratic time (e.g., Nested loops, Bubble sort)
6. **O(2ⁿ)** — Exponential time (e.g., Recursive Fibonacci without memoization)

### Interview Pro-Tip
Always identify:
- **Auxiliary Space vs. Total Space**: Does recursion stack space count? Yes, O(H) for call stack.
- **Corner Cases**: Empty array, negative values, integer overflow.`,
              resources: [
                {
                  id: 'res-dsa-1',
                  title: 'Big-O Cheat Sheet & Complexity Guide (PDF)',
                  type: 'pdf',
                  url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                  durationOrSize: '1.4 MB'
                },
                {
                  id: 'res-dsa-2',
                  title: 'Deep Dive into Two-Pointer Technique (Video)',
                  type: 'video',
                  url: 'https://www.youtube.com/watch?v=-gjxg6Pln50',
                  durationOrSize: '18 mins'
                }
              ]
            },
            {
              id: 'les-dsa-102',
              title: 'Sliding Window Pattern & Two Pointers in Action',
              durationMinutes: 35,
              content: `# Sliding Window & Two Pointers

The **Sliding Window** technique converts quadratic O(N^2) brute-force subarray problems into efficient linear O(N) solutions.

### Types of Sliding Windows:
- **Fixed Size Window**: Calculating maximum sum subarray of size K.
- **Dynamic Size Window**: Finding longest substring with at most K distinct characters.

### Pattern Template (Dynamic Window):
\`\`\`python
def sliding_window(s):
    left = 0
    window_state = {}
    best = 0
    for right in range(len(s)):
        window_state[s[right]] = window_state.get(s[right], 0) + 1
        while not is_valid(window_state):
            window_state[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
\`\`\``,
              resources: [
                {
                  id: 'res-dsa-3',
                  title: 'Sliding Window Practice Exercise (Interactive)',
                  type: 'code',
                  url: '/compiler?problem=longest-substring',
                  durationOrSize: '30 mins'
                }
              ]
            }
          ]
        },
        {
          id: 'mod-dsa-2',
          title: 'Module 2: Trees, Graphs & Dynamic Programming',
          description: 'DFS/BFS, Dijkstra, TopoSort, and 1D/2D DP memoization.',
          lessons: [
            {
              id: 'les-dsa-201',
              title: 'Binary Tree Traversals & Lowest Common Ancestor (LCA)',
              durationMinutes: 40,
              content: `# Trees & Lowest Common Ancestor

Trees are recursive data structures. A solid grasp of Pre-order, In-order, Post-order, and Level-order (BFS) is indispensable.

### Lowest Common Ancestor (LCA) in a Binary Tree:
Given root and two nodes P and Q, find the lowest node that has both P and Q as descendants.

\`\`\`python
def lowestCommonAncestor(root, p, q):
    if not root or root == p or root == q:
        return root
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    if left and right:
        return root
    return left if left else right
\`\`\``,
              resources: [
                {
                  id: 'res-dsa-4',
                  title: 'LCA & Tree Traversal Visual Notes',
                  type: 'note',
                  url: '#',
                  durationOrSize: '6 pages'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'crs-system-design',
      title: 'Full-Stack System Design, Distributed Caching & Microservices',
      description: 'Design scalable distributed systems, load balancers, Redis caching, Kafka message queues, and database sharding for high-concurrency interview rounds.',
      instructorId: 'usr-instructor-1',
      instructorName: 'Dr. Priya Varma',
      category: 'System Design',
      difficulty: 'Advanced',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      rating: 4.95,
      enrolledCount: 1120,
      status: 'published',
      createdAt: '2026-01-25T11:00:00.000Z',
      updatedAt: '2026-02-15T15:00:00.000Z',
      modules: [
        {
          id: 'mod-sd-1',
          title: 'Module 1: Scalability Fundamentals & Caching Architectures',
          description: 'Horizontal vs Vertical scaling, Consistent Hashing, and Redis/Memcached strategies.',
          lessons: [
            {
              id: 'les-sd-101',
              title: 'Consistent Hashing, Virtual Nodes & Distributed Caching',
              durationMinutes: 45,
              content: `# Consistent Hashing & Distributed Systems

### The Problem with Simple Modulo Hashing (hash(key) % N):
When cache servers are added or removed, almost every key is remapped, causing devastating cache stampedes.

### Consistent Hashing Mechanism:
1. Map both servers and keys onto a circular hash ring [0, 2^32 - 1].
2. A key is assigned to the first server whose position is >= key position in clockwise order.
3. Adding a node only redistributes $K/N$ keys on average.
4. **Virtual Nodes** prevent uneven load distribution across physical servers.`,
              resources: [
                {
                  id: 'res-sd-1',
                  title: 'System Design Architecture Diagrams (PDF)',
                  type: 'pdf',
                  url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                  durationOrSize: '3.2 MB'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'crs-core-cs',
      title: 'Core CS Foundations: OS, DBMS, Networks & OOP',
      description: 'Ace technical interview rounds with comprehensive coverage of Operating Systems, SQL, ACID properties, TCP/IP, and OOP design.',
      instructorId: 'usr-instructor-1',
      instructorName: 'Dr. Priya Varma',
      category: 'Core CS',
      difficulty: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      rating: 4.85,
      enrolledCount: 980,
      status: 'published',
      createdAt: '2026-01-20T10:00:00.000Z',
      updatedAt: '2026-02-05T14:30:00.000Z',
      modules: [
        {
          id: 'mod-cs-1',
          title: 'Module 1: Operating Systems & Concurrency',
          description: 'Processes, Threads, Deadlocks, Virtual Memory & Paging.',
          lessons: [
            {
              id: 'les-cs-101',
              title: 'Process Synchronization, Mutex, Semaphores & Deadlock Conditions',
              durationMinutes: 30,
              content: `# Operating Systems: Concurrency & Synchronization

### 4 Coffman Conditions for Deadlock:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process must hold at least one resource and wait to acquire others.
3. **No Preemption**: Resources cannot be forcibly confiscated from a process.
4. **Circular Wait**: A closed chain of processes exists such that each process holds resources needed by the next.

### Critical Section Problem & Semaphores:
A Semaphore is an integer variable accessed only through atomic operations \`wait()\` (or P) and \`signal()\` (or V).`,
              resources: [
                {
                  id: 'res-cs-1',
                  title: 'OS Interview Top 50 Questions (PDF)',
                  type: 'pdf',
                  url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                  durationOrSize: '2.1 MB'
                }
              ]
            }
          ]
        },
        {
          id: 'mod-cs-2',
          title: 'Module 2: Database Management & SQL Mastery',
          description: 'Normalization, ACID properties, Indexing (B+ Trees), and Complex SQL Joins.',
          lessons: [
            {
              id: 'les-cs-201',
              title: 'Transactions, Isolation Levels & Indexing Internals',
              durationMinutes: 45,
              content: `# DBMS: ACID & Transaction Isolation Levels

### ACID Properties:
- **Atomicity**: All changes committed or rolled back.
- **Consistency**: Database transitions between valid states.
- **Isolation**: Concurrent transactions execute serially.
- **Durability**: Committed data persists on disk.`,
              resources: [
                {
                  id: 'res-cs-2',
                  title: 'Database Schema Design & Normalization Worksheet',
                  type: 'note',
                  url: '#',
                  durationOrSize: '8 pages'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'crs-aptitude',
      title: 'Quantitative Aptitude, Logical Reasoning & Verbal Ability',
      description: 'Crack company first-round screening tests (TCS NQT, Infosys, Accenture, Cognizant, AMCAT, eLitmus).',
      instructorId: 'usr-instructor-1',
      instructorName: 'Dr. Priya Varma',
      category: 'Aptitude',
      difficulty: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
      rating: 4.8,
      enrolledCount: 1850,
      status: 'published',
      createdAt: '2026-01-05T09:00:00.000Z',
      updatedAt: '2026-02-10T11:00:00.000Z',
      modules: [
        {
          id: 'mod-apt-1',
          title: 'Module 1: Speed Math, Numbers, Percentages & Profit-Loss',
          description: 'Fast calculation shortcuts and high-frequency aptitude patterns.',
          lessons: [
            {
              id: 'les-apt-101',
              title: 'Time & Work, Pipes & Cisterns Shortcut Formulae',
              durationMinutes: 30,
              content: `# Time, Work & Efficiency Formulae

### Standard Rules:
1. Total Work = LCM of individual days (The Unit Work Method).
2. If A completes work in 10 days, B in 15 days, Total Work = 30 units. Combined efficiency = 5 units/day => 6 days.`,
              resources: [
                {
                  id: 'res-apt-1',
                  title: 'Aptitude Formula Formula Book (PDF)',
                  type: 'pdf',
                  url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                  durationOrSize: '3.8 MB'
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  const assessments: Assessment[] = [
    {
      id: 'asm-overall-dsa',
      title: 'Full-Length DSA & Algorithms Benchmark (Timed)',
      description: 'Comprehensive timed evaluation covering Trees, Dynamic Programming, Graphs, and Hash Tables. Features overall exam timer and tab-switch integrity monitoring.',
      category: 'DSA',
      difficulty: 'Medium',
      durationMinutes: 25,
      timerMode: 'OVERALL',
      passingScorePercentage: 70,
      maxAttempts: 3,
      tabSwitchLimit: 3,
      isPublished: true,
      createdBy: 'Dr. Priya Varma',
      createdAt: '2026-02-01T10:00:00.000Z',
      instructions: [
        'The assessment has a strict server-authoritative timer of 25 minutes.',
        'Answers are automatically saved whenever you select an option.',
        'Tab-switch detection is active: Leaving the window triggers warnings. At 3 violations, your assessment is automatically terminated and submitted.',
        'Do not refresh or close the browser tab. If temporarily disconnected, re-opening will resume from the remaining server time.',
        'Calculators and unauthorized IDE windows are strictly prohibited.'
      ],
      questions: [
        {
          id: 'q-dsa-1',
          questionText: 'What is the worst-case time complexity of inserting N elements into an initially empty Binary Search Tree (BST)?',
          options: ['O(N log N)', 'O(N)', 'O(N²)', 'O(log N)'],
          correctIndex: 2,
          marks: 4,
          explanation: 'In the worst case (when elements are inserted in already sorted order), the BST degenerates into a skewed linked list, yielding O(N²) total time for N insertions.',
          topic: 'Trees'
        },
        {
          id: 'q-dsa-2',
          questionText: 'Which graph algorithm is specifically designed to find Single-Source Shortest Paths in graphs with negative edge weights (and detect negative weight cycles)?',
          options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Prim's Algorithm", "Kruskal's Algorithm"],
          correctIndex: 1,
          marks: 4,
          explanation: "Bellman-Ford algorithm handles graphs with negative edge weights and relaxes edges (V-1) times, detecting negative cycles in O(V*E) time.",
          topic: 'Graphs'
        },
        {
          id: 'q-dsa-3',
          questionText: 'What is the minimum number of queues required to implement a standard Last-In-First-Out (LIFO) Stack?',
          options: ['1 queue', '2 queues', '3 queues', 'Cannot be implemented using queues'],
          correctIndex: 1,
          marks: 4,
          explanation: 'A stack can be implemented using 2 queues by making either the push operation or the pop operation costly.',
          topic: 'Stacks & Queues'
        },
        {
          id: 'q-dsa-4',
          questionText: 'Consider the recurrence relation T(N) = 2*T(N/2) + O(N). By the Master Theorem, what is the asymptotic time complexity?',
          options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(log N)'],
          correctIndex: 1,
          marks: 4,
          explanation: 'Here a=2, b=2, and f(N) = O(N^1). Since log_b(a) = log_2(2) = 1, this falls under Case 2 of Master Theorem, yielding O(N log N).',
          topic: 'Algorithms'
        },
        {
          id: 'q-dsa-5',
          questionText: 'In a Hash Table with collision resolution using Chaining, what is the worst-case search time complexity if all keys hash to the exact same slot?',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
          correctIndex: 2,
          marks: 4,
          explanation: 'If all keys collide in one bucket, the chain becomes a linked list of length N, resulting in O(N) search time.',
          topic: 'Hashing'
        }
      ]
    },
    {
      id: 'asm-question-timer-core',
      title: 'Core CS Speed Test (Question-Level Timer Mode)',
      description: 'Rapid-fire assessment where EACH question has its own dedicated 45-second timer. Tests high-speed recall of OS, DBMS, and Networking fundamentals.',
      category: 'Core CS',
      difficulty: 'Medium',
      durationMinutes: 10,
      timerMode: 'QUESTION',
      questionTimerSeconds: 45,
      passingScorePercentage: 75,
      maxAttempts: 2,
      tabSwitchLimit: 2,
      isPublished: true,
      createdBy: 'Dr. Priya Varma',
      createdAt: '2026-02-03T11:30:00.000Z',
      instructions: [
        'CRITICAL: Each question has an independent 45-second countdown timer.',
        'When the 45-second timer for a question expires, the system will automatically lock that question and advance to the next.',
        'You cannot return to previous questions once their time runs out.',
        'Tab-switch detection is active. Switching tabs will trigger immediate penalty logs.',
        'Select your answer and click Next before the timer expires.'
      ],
      questions: [
        {
          id: 'q-cs-1',
          questionText: 'Which of the following is NOT a necessary condition for a deadlock to occur in an Operating System?',
          options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption of Resources', 'Circular Wait'],
          correctIndex: 2,
          timeLimitSeconds: 45,
          marks: 5,
          explanation: 'The condition is NO PREEMPTION. If resources can be preempted, deadlock is prevented.',
          topic: 'Operating Systems'
        },
        {
          id: 'q-cs-2',
          questionText: 'In relational databases, which normal form eliminates Transitive Functional Dependencies (X -> Y and Y -> Z)?',
          options: ['1st Normal Form (1NF)', '2nd Normal Form (2NF)', '3rd Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
          correctIndex: 2,
          timeLimitSeconds: 45,
          marks: 5,
          explanation: '3NF requires that a relation is in 2NF and has no transitive dependencies for non-prime attributes.',
          topic: 'DBMS'
        },
        {
          id: 'q-cs-3',
          questionText: 'At which layer of the OSI model does the TCP Three-Way Handshake (SYN, SYN-ACK, ACK) take place?',
          options: ['Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)', 'Data Link Layer (Layer 2)'],
          correctIndex: 1,
          timeLimitSeconds: 45,
          marks: 5,
          explanation: 'TCP operates at the Transport Layer (Layer 4) of the OSI model.',
          topic: 'Computer Networks'
        },
        {
          id: 'q-cs-4',
          questionText: 'Which page replacement algorithm suffers from Belady’s Anomaly (where increasing the number of page frames causes more page faults)?',
          options: ['Least Recently Used (LRU)', 'Optimal Page Replacement (OPT)', 'First-In First-Out (FIFO)', 'Least Frequently Used (LFU)'],
          correctIndex: 2,
          timeLimitSeconds: 45,
          marks: 5,
          explanation: "Belady's Anomaly is a known phenomenon in FIFO page replacement, where allocating more physical frames can paradoxically increase the number of page faults.",
          topic: 'Operating Systems'
        }
      ]
    },
    {
      id: 'asm-faang-interview',
      title: 'Google & Amazon Mock Placement Assessment',
      description: 'Full 30-minute campus hiring mock simulation featuring high-yield algorithmic and technical questions.',
      category: 'Mock Placement',
      difficulty: 'Hard',
      durationMinutes: 30,
      timerMode: 'OVERALL',
      passingScorePercentage: 75,
      maxAttempts: 3,
      tabSwitchLimit: 3,
      isPublished: true,
      createdBy: 'Dr. Priya Varma',
      createdAt: '2026-02-10T14:00:00.000Z',
      instructions: [
        'Total Duration: 30 minutes.',
        'Strict tab-switch integrity active.',
        'Passing score benchmark: 75%+'
      ],
      questions: [
        {
          id: 'q-faang-1',
          questionText: 'What is the optimal time complexity to find the Kth largest element in an unsorted array of size N using a Min-Heap?',
          options: ['O(N log N)', 'O(N log K)', 'O(K log N)', 'O(N)'],
          correctIndex: 1,
          marks: 5,
          explanation: 'Maintaining a Min-Heap of size K while iterating over N elements takes O(N log K) time and O(K) auxiliary space.',
          topic: 'Heaps'
        },
        {
          id: 'q-faang-2',
          questionText: 'Which distributed database concept guarantees that all replicas eventually converge to the same data value in the absence of new updates?',
          options: ['Strict Serializability', 'Eventual Consistency', 'Strong Read-after-Write', 'Linearizability'],
          correctIndex: 1,
          marks: 5,
          explanation: 'Eventual Consistency is a consistency model used in distributed computing (e.g., DynamoDB, Cassandra) to achieve high availability.',
          topic: 'System Design'
        }
      ]
    },
    {
      id: 'asm-aptitude-general',
      title: 'TCS & Infosys National Placement Aptitude Test',
      description: 'Real placement screening format with Quantitative Ability, Logical Reasoning, and Data Interpretation.',
      category: 'Aptitude',
      difficulty: 'Easy',
      durationMinutes: 20,
      timerMode: 'OVERALL',
      passingScorePercentage: 60,
      maxAttempts: 5,
      tabSwitchLimit: 3,
      isPublished: true,
      createdBy: 'Dr. Priya Varma',
      createdAt: '2026-02-05T09:00:00.000Z',
      instructions: [
        'Total Duration: 20 minutes.',
        'Scientific calculators are not permitted.',
        'Negative marking is not applicable.',
        'Your test will auto-submit when the clock strikes zero.'
      ],
      questions: [
        {
          id: 'q-apt-1',
          questionText: 'A train 180 meters long is traveling at a speed of 54 km/h. How many seconds will it take to completely pass an electric pole?',
          options: ['10 seconds', '12 seconds', '15 seconds', '18 seconds'],
          correctIndex: 1,
          marks: 3,
          explanation: 'Speed in m/s = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 180 / 15 = 12 seconds.',
          topic: 'Time & Distance'
        },
        {
          id: 'q-apt-2',
          questionText: 'If 6 men or 8 women can reap a field in 86 days, how many days will 14 men and 10 women take to reap the same field?',
          options: ['24 days', '28 days', '32 days', '36 days'],
          correctIndex: 0,
          marks: 3,
          explanation: '6M = 8W => 1M = (4/3)W. 14M + 10W = 14*(4/3)W + 10W = (86/3)W. If 8W take 86 days, (86/3)W will take (8 * 86) / (86/3) = 24 days.',
          topic: 'Time & Work'
        },
        {
          id: 'q-apt-3',
          questionText: 'What is the angle between the hour hand and the minute hand of a clock at 3:40 PM?',
          options: ['120 degrees', '130 degrees', '140 degrees', '125 degrees'],
          correctIndex: 1,
          marks: 3,
          explanation: 'Angle = |30*H - (11/2)*M| = |30*3 - 5.5*40| = |90 - 220| = 130 degrees.',
          topic: 'Clocks & Calendars'
        }
      ]
    }
  ];

  const codingProblems: CodingProblem[] = [
    {
      id: 'prob-two-sum',
      title: 'Two Sum',
      slug: 'two-sum',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return the *indices of the two numbers* such that they add up to \`target\`.

You may assume that each input would have ***exactly one solution***, and you may not use the same element twice.

You can return the answer in any order.`,
      inputFormat: 'Line 1: Comma-separated integers representing nums\nLine 2: Single integer representing target',
      outputFormat: 'Comma-separated indices [i, j]',
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
      ],
      examples: [
        {
          input: '2,7,11,15\n9',
          output: '0,1',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        },
        {
          input: '3,2,4\n6',
          output: '1,2',
          explanation: 'nums[1] + nums[2] == 2 + 4 == 6, so indices are 1,2.'
        }
      ],
      difficulty: 'Easy',
      topic: 'Arrays',
      acceptanceRate: 84.5,
      status: 'published',
      starterCode: {
        python: `def twoSum(nums, target):
    # TODO: Implement Two Sum logic.
    # Return a string in the format "index1,index2"
    return ""

import sys
input_lines = sys.stdin.read().strip().split('\\\n')
if len(input_lines) >= 2:
    nums = list(map(int, input_lines[0].split(',')))
    target = int(input_lines[1])
    print(twoSum(nums, target))
`,
        cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <string>
using namespace std;

// TODO: Implement Two Sum logic and print "index1,index2"
int main() {
    string line1, line2;
    if (!getline(cin, line1)) return 0;
    getline(cin, line2);
    
    vector<int> nums;
    stringstream ss(line1);
    string temp;
    while (getline(ss, temp, ',')) {
        if (!temp.empty()) nums.push_back(stoi(temp));
    }
    int target = stoi(line2);
    
    // Write your code here
    
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().split(",");
        int target = Integer.parseInt(sc.nextLine().trim());
        
        // TODO: Implement Two Sum logic and print "index1,index2"
    }
}`,
        javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\\n');
if (input.length >= 2) {
    const nums = input[0].split(',').map(Number);
    const target = Number(input[1]);
    
    // TODO: Implement Two Sum logic and console.log("index1,index2")
}`
      },
      privateSolution: {
        python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return f"{seen[diff]},{i}"
        seen[num] = i
    return ""

import sys
input_lines = sys.stdin.read().strip().split('\\\n')
if len(input_lines) >= 2:
    nums = list(map(int, input_lines[0].split(',')))
    target = int(input_lines[1])
    print(twoSum(nums, target))
`,
        cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <unordered_map>
using namespace std;

int main() {
    string line1, line2;
    if (!getline(cin, line1)) return 0;
    getline(cin, line2);
    
    vector<int> nums;
    stringstream ss(line1);
    string temp;
    while (getline(ss, temp, ',')) {
        if (!temp.empty()) nums.push_back(stoi(temp));
    }
    int target = stoi(line2);
    
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (seen.find(diff) != seen.end()) {
            cout << seen[diff] << "," << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().split(",");
        int target = Integer.parseInt(sc.nextLine().trim());
        
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < parts.length; i++) {
            int num = Integer.parseInt(parts[i].trim());
            int diff = target - num;
            if (map.containsKey(diff)) {
                System.out.println(map.get(diff) + "," + i);
                return;
            }
            map.put(num, i);
        }
    }
}`,
        javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\\n');
if (input.length >= 2) {
    const nums = input[0].split(',').map(Number);
    const target = Number(input[1]);
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen.has(diff)) {
            console.log(\`\${seen.get(diff)},\${i}\`);
            break;
        }
        seen.set(nums[i], i);
    }
}`
      },
      testCases: [
        {
          id: 'tc-1',
          input: '2,7,11,15\n9',
          expectedOutput: '0,1',
          isHidden: false,
          explanation: 'Standard sample case.'
        },
        {
          id: 'tc-2',
          input: '3,2,4\n6',
          expectedOutput: '1,2',
          isHidden: false,
          explanation: 'Zero-index offset case.'
        },
        {
          id: 'tc-3',
          input: '3,3\n6',
          expectedOutput: '0,1',
          isHidden: true,
          explanation: 'Duplicate numbers check.'
        },
        {
          id: 'tc-4',
          input: '-1,-2,-3,-4,-5\n-8',
          expectedOutput: '2,4',
          isHidden: true,
          explanation: 'Negative integers case.'
        }
      ],
      createdAt: '2026-01-20T10:00:00.000Z'
    },
    {
      id: 'prob-valid-parentheses',
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      inputFormat: 'A single string s on one line',
      outputFormat: 'true or false',
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of parentheses only ()[]{}'
      ],
      examples: [
        {
          input: '()[]{}',
          output: 'true'
        },
        {
          input: '(]',
          output: 'false'
        }
      ],
      difficulty: 'Easy',
      topic: 'Strings',
      acceptanceRate: 78.2,
      status: 'published',
      starterCode: {
        python: `def isValid(s: str) -> bool:
    # TODO: Implement valid parentheses logic.
    # Return True or False
    return False

import sys
s = sys.stdin.read().strip()
print(str(isValid(s)).lower())
`,
        cpp: `#include <iostream>
#include <string>
using namespace std;

// TODO: Implement valid parentheses check and print "true" or "false"
int main() {
    string s;
    if (cin >> s) {
        // Write your code here
    }
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        
        // TODO: Implement valid parentheses check and print "true" or "false"
    }
}`,
        javascript: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();

// TODO: Implement valid parentheses check and console.log("true" or "false")
`
      },
      privateSolution: {
        python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

import sys
s = sys.stdin.read().strip()
print(str(isValid(s)).lower())
`,
        cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            if (c == ')' && st.top() != '(') return false;
            if (c == '}' && st.top() != '{') return false;
            if (c == ']' && st.top() != '[') return false;
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        Stack<Character> stack = new Stack<>();
        boolean valid = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) { valid = false; break; }
                char top = stack.pop();
                if (c == ')' && top != '(') { valid = false; break; }
                if (c == '}' && top != '{') { valid = false; break; }
                if (c == ']' && top != '[') { valid = false; break; }
            }
        }
        if (!stack.isEmpty()) valid = false;
        System.out.println(valid ? "true" : "false");
    }
}`,
        javascript: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();
const stack = [];
const map = { ')': '(', '}': '{', ']': '[' };
let valid = true;
for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
        stack.push(char);
    } else if (map[char]) {
        if (stack.length === 0 || stack.pop() !== map[char]) {
            valid = false;
            break;
        }
    }
}
if (stack.length > 0) valid = false;
console.log(valid ? 'true' : 'false');`
      },
      testCases: [
        {
          id: 'tc-vp-1',
          input: '()[]{}',
          expectedOutput: 'true',
          isHidden: false
        },
        {
          id: 'tc-vp-2',
          input: '(]',
          expectedOutput: 'false',
          isHidden: false
        },
        {
          id: 'tc-vp-3',
          input: '([{}])',
          expectedOutput: 'true',
          isHidden: true
        },
        {
          id: 'tc-vp-4',
          input: '(((((((',
          expectedOutput: 'false',
          isHidden: true
        }
      ],
      createdAt: '2026-01-22T12:00:00.000Z'
    },
    {
      id: 'prob-longest-substring',
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
      inputFormat: 'A string s on a single line',
      outputFormat: 'Single integer representing maximum length',
      constraints: [
        '0 <= s.length <= 5 * 10^4',
        's consists of English letters, digits, symbols and spaces.'
      ],
      examples: [
        {
          input: 'abcabcbb',
          output: '3',
          explanation: "The answer is 'abc', with the length of 3."
        },
        {
          input: 'bbbbb',
          output: '1',
          explanation: "The answer is 'b', with the length of 1."
        }
      ],
      difficulty: 'Medium',
      topic: 'Strings',
      acceptanceRate: 62.1,
      status: 'published',
      starterCode: {
        python: `def lengthOfLongestSubstring(s: str) -> int:
    # TODO: Implement logic and return maximum length
    return 0

import sys
s = sys.stdin.read().rstrip('\\\r\\\n')
print(lengthOfLongestSubstring(s))
`,
        cpp: `#include <iostream>
#include <string>
using namespace std;

// TODO: Implement logic to print maximum length
int main() {
    string s;
    getline(cin, s);
    
    // Write your code here
    
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        
        // TODO: Implement logic and print max length
    }
}`,
        javascript: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').replace(/\\\r?\\\n$/, '');

// TODO: Implement logic and console.log(max length)
`
      },
      privateSolution: {
        python: `def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len

import sys
s = sys.stdin.read().rstrip('\\\r\\\n')
print(lengthOfLongestSubstring(s))
`,
        cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    vector<int> last(256, -1);
    int left = 0, maxLen = 0;
    for (int right = 0; right < s.length(); ++right) {
        if (last[(unsigned char)s[right]] >= left) {
            left = last[(unsigned char)s[right]] + 1;
        }
        last[(unsigned char)s[right]] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    cout << maxLen << endl;
    return 0;
}`,
        java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length; right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        System.out.println(maxLen);
    }
}`,
        javascript: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').replace(/\\\r?\\\n$/, '');
const map = new Map();
let left = 0, maxLen = 0;
for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
        left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
}
console.log(maxLen);`
      },
      testCases: [
        {
          id: 'tc-ls-1',
          input: 'abcabcbb',
          expectedOutput: '3',
          isHidden: false
        },
        {
          id: 'tc-ls-2',
          input: 'bbbbb',
          expectedOutput: '1',
          isHidden: false
        },
        {
          id: 'tc-ls-3',
          input: 'pwwkew',
          expectedOutput: '3',
          isHidden: true
        },
        {
          id: 'tc-ls-4',
          input: 'tmmzuxt',
          expectedOutput: '5',
          isHidden: true
        }
      ],
      createdAt: '2026-01-25T14:00:00.000Z'
    }
  ];

  const companies: Company[] = [
    {
      id: 'cmp-google',
      name: 'Google',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      industry: 'Big Tech & Cloud',
      description: 'Global leader in search, AI, cloud computing, and software infrastructure.',
      salaryRange: '₹32 - ₹55 LPA',
      eligibility: {
        minCgpa: 8.0,
        allowedBranches: ['CSE', 'IT', 'ECE', 'EE'],
        maxBacklogs: 0,
        gradYears: [2025, 2026, 2027]
      },
      requiredSkills: ['Advanced DSA', 'System Design', 'C++', 'Python', 'Clean Coding', 'Concurrency'],
      assessmentAreas: ['Online Coding Challenge (2 Hard LeetCode style problems)', 'Technical Interview 1 (Trees & Graphs)', 'Technical Interview 2 (DP & System Design)', 'Googlyness & Leadership'],
      preparationModules: [
        {
          category: 'DSA Focus',
          summary: 'High-frequency Google topics include Graph Traversal, DP on Trees, Segment Trees, and Tries.',
          recommendedTopicIds: ['Trees', 'Graphs', 'Dynamic Programming']
        },
        {
          category: 'System Design',
          summary: 'Scalability, Load Balancers, Distributed Caching, and Consistent Hashing.',
          recommendedTopicIds: ['OS', 'DBMS', 'Networks']
        }
      ],
      curatedProblemIds: ['prob-two-sum', 'prob-longest-substring']
    },
    {
      id: 'cmp-microsoft',
      name: 'Microsoft',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
      industry: 'Enterprise Software & Cloud (Azure)',
      description: 'Empowering individuals and organizations through Azure cloud, Windows, Office 365, and AI.',
      salaryRange: '₹28 - ₹45 LPA',
      eligibility: {
        minCgpa: 7.5,
        allowedBranches: ['CSE', 'IT', 'ECE', 'EE', 'Mech', 'Civil'],
        maxBacklogs: 0,
        gradYears: [2025, 2026, 2027]
      },
      requiredSkills: ['DSA', 'OOP Concepts', 'C# / C++ / Java', 'Operating Systems', 'System Design'],
      assessmentAreas: ['Codility OA (3 questions, 90 mins)', 'Tech Round 1 (Data Structures)', 'Tech Round 2 (Low Level OOP Design)', 'AA (As Appropriate / Director Round)'],
      preparationModules: [
        {
          category: 'Core Coding',
          summary: 'Arrays, Strings, Linked Lists, Binary Trees, and DFS/BFS.',
          recommendedTopicIds: ['Arrays', 'Strings', 'Trees']
        }
      ],
      curatedProblemIds: ['prob-two-sum', 'prob-valid-parentheses']
    },
    {
      id: 'cmp-amazon',
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      industry: 'E-commerce & AWS Cloud',
      description: 'Customer-obsessed technology pioneer in e-commerce, cloud infrastructure, and logistics.',
      salaryRange: '₹28 - ₹44 LPA',
      eligibility: {
        minCgpa: 7.0,
        allowedBranches: ['CSE', 'IT', 'ECE', 'EE', 'Data Science', 'AI'],
        maxBacklogs: 0,
        gradYears: [2025, 2026, 2027]
      },
      requiredSkills: ['DSA', '16 Leadership Principles (LP)', 'System Design', 'Java / Python', 'DBMS'],
      assessmentAreas: ['Online OA (2 Coding + Work Simulation + LP Survey)', 'Technical Virtual Onsite 1 & 2', 'Bar Raiser Interview'],
      preparationModules: [
        {
          category: 'Leadership Principles',
          summary: 'STAR method responses for Customer Obsession, Ownership, and Bias for Action.',
          recommendedTopicIds: ['HR Interview', 'Behavioral']
        }
      ],
      curatedProblemIds: ['prob-two-sum', 'prob-longest-substring']
    },
    {
      id: 'cmp-tcs-digital',
      name: 'TCS Digital / Prime',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      industry: 'IT Services & Consulting',
      description: 'India’s premier IT services firm hiring high-end innovators through TCS NQT Digital & Prime track.',
      salaryRange: '₹7.5 - ₹11.5 LPA',
      eligibility: {
        minCgpa: 6.5,
        allowedBranches: ['All Engineering Branches'],
        maxBacklogs: 1,
        gradYears: [2026]
      },
      requiredSkills: ['Advanced Quantitative Aptitude', 'Python / Java Coding', 'SQL', 'SDLC'],
      assessmentAreas: ['TCS NQT Advanced (Advanced Aptitude + 2 Hands-on Coding Questions)', 'Technical & MR Round', 'HR Round'],
      preparationModules: [
        {
          category: 'Aptitude & Speed Math',
          summary: 'Master Numbers, Permutations, Probability, Work & Time, and Data Sufficiency.',
          recommendedTopicIds: ['Aptitude', 'Logical']
        }
      ],
      curatedProblemIds: ['prob-two-sum', 'prob-valid-parentheses']
    },
    {
      id: 'cmp-goldman',
      name: 'Goldman Sachs',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg',
      industry: 'Investment Banking & FinTech',
      description: 'Global investment banking, securities, and investment management firm.',
      salaryRange: '₹25 - ₹38 LPA',
      eligibility: {
        minCgpa: 7.5,
        allowedBranches: ['CSE', 'IT', 'ECE', 'EE', 'Maths'],
        maxBacklogs: 0,
        gradYears: [2025, 2026]
      },
      requiredSkills: ['Algorithms', 'Probability & Statistics', 'C++ / Java', 'Database Queries', 'Concurrency'],
      assessmentAreas: ['HackerRank Aptitude & Math (7 sections)', 'Advanced Coding OA', 'Technical Round 1 & 2'],
      preparationModules: [
        {
          category: 'Math & Quantitative Reasoning',
          summary: 'Conditional Probability, Bayes Theorem, Matrix Math, and DP.',
          recommendedTopicIds: ['Aptitude', 'DSA']
        }
      ],
      curatedProblemIds: ['prob-longest-substring']
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      userId: 'usr-admin-1',
      userName: 'Platform Administrator',
      role: 'ADMIN',
      action: 'COURSE_APPROVED',
      resourceType: 'Course',
      resourceId: 'crs-dsa-mastery',
      details: 'Approved course for student publication.',
      timestamp: '2026-01-16T12:00:00.000Z'
    },
    {
      id: 'log-2',
      userId: 'usr-instructor-1',
      userName: 'Dr. Priya Varma',
      role: 'INSTRUCTOR',
      action: 'ASSESSMENT_CREATED',
      resourceType: 'Assessment',
      resourceId: 'asm-overall-dsa',
      details: 'Created timed assessment with tab-switch limits.',
      timestamp: '2026-02-01T10:05:00.000Z'
    }
  ];

  return { users, courses, assessments, codingProblems, companies, auditLogs };
};
