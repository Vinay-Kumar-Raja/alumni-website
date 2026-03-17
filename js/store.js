/* =====================================================
   STORE — In-memory data store with localStorage
===================================================== */
'use strict';

const Store = (() => {
  const KEY = 'alumniConnect';

  const defaults = {
    users: [
      {
        id: 'u001', name: 'Admin User', email: 'admin@alumni.com',
        password: '$a1d2m3in', // hashed equivalent placeholder
        role: 'admin', batch: '2010', department: 'CS',
        bio: 'Platform administrator and alumni coordinator.',
        avatar: null, initials: 'AU',
        company: 'Alumni Foundation', location: 'New York, USA',
        approved: true, locked: false, lockUntil: null, loginAttempts: 0,
        followers: ['u002','u003'], following: ['u002'],
        joinedAt: '2024-01-01T00:00:00Z', lastSeen: new Date().toISOString()
      },
      {
        id: 'u002', name: 'Priya Sharma', email: 'priya@alumni.com',
        password: '$a1lumni2025',
        role: 'alumni', batch: '2015', department: 'ECE',
        bio: 'Software Engineer at Google. Passionate about AI/ML.',
        avatar: null, initials: 'PS',
        company: 'Google', location: 'San Francisco, USA',
        approved: true, locked: false, lockUntil: null, loginAttempts: 0,
        followers: ['u001','u003'], following: ['u001','u003'],
        joinedAt: '2024-03-15T00:00:00Z', lastSeen: new Date().toISOString()
      },
      {
        id: 'u003', name: 'Rahul Verma', email: 'rahul@alumni.com',
        password: '$a1lumni2025',
        role: 'alumni', batch: '2018', department: 'ME',
        bio: 'Entrepreneur & Founder at StartupX. IIT alumnus.',
        avatar: null, initials: 'RV',
        company: 'StartupX', location: 'Bangalore, India',
        approved: true, locked: false, lockUntil: null, loginAttempts: 0,
        followers: ['u001','u002'], following: ['u001','u002'],
        joinedAt: '2024-06-10T00:00:00Z', lastSeen: new Date().toISOString()
      },
      {
        id: 'u004', name: 'Anjali Patel', email: 'anjali@alumni.com',
        password: '$a1lumni2025',
        role: 'moderator', batch: '2013', department: 'Civil',
        bio: 'Urban planner and sustainability advocate.',
        avatar: null, initials: 'AP',
        company: 'City Corp', location: 'Mumbai, India',
        approved: true, locked: false, lockUntil: null, loginAttempts: 0,
        followers: [], following: [],
        joinedAt: '2024-08-01T00:00:00Z', lastSeen: new Date().toISOString()
      },
      {
        id: 'u005', name: 'Karan Mehta', email: 'karan@alumni.com',
        password: '$a1lumni2025',
        role: 'alumni', batch: '2020', department: 'CS',
        bio: 'Full-stack developer. Open source contributor.',
        avatar: null, initials: 'KM',
        company: 'InnovateTech', location: 'Hyderabad, India',
        approved: false, locked: false, lockUntil: null, loginAttempts: 0,
        followers: [], following: [],
        joinedAt: '2025-01-15T00:00:00Z', lastSeen: null
      }
    ],
    posts: [
      {
        id: 'p001', authorId: 'u002',
        content: '🎉 Excited to share that I just got promoted to Senior Engineer at Google! Grateful for this amazing journey. Thank you to all my mentors from our college days. #Alumni #Google #CareerMilestone',
        image: null, tags: ['Alumni','Google','CareerMilestone'],
        likes: ['u001','u003'], comments: [
          { id: 'c001', authorId: 'u001', text: 'Congratulations Priya! Well deserved! 🎊', likes: 2, createdAt: '2025-03-15T10:05:00Z' },
          { id: 'c002', authorId: 'u003', text: 'Amazing news! Proud of you 🚀', likes: 1, createdAt: '2025-03-15T10:30:00Z' }
        ],
        createdAt: '2025-03-15T09:00:00Z'
      },
      {
        id: 'p002', authorId: 'u003',
        content: '🚀 StartupX just closed our Series A funding round — $12M! We\'re building the future of EdTech for Tier 2 cities. Looking for passionate engineers who want to make a real impact. DM me! #Startup #EdTech #Hiring',
        image: null, tags: ['Startup','EdTech','Hiring'],
        likes: ['u001','u002','u004'], comments: [
          { id: 'c003', authorId: 'u004', text: 'This is incredible!! Series A at 25 is insane. Proud of you!', likes: 3, createdAt: '2025-03-16T14:20:00Z' }
        ],
        createdAt: '2025-03-16T12:00:00Z'
      },
      {
        id: 'p003', authorId: 'u004',
        content: 'Attended the Alumni Annual Gala last weekend — such a wonderful reunion! Reconnecting with old friends, sharing stories, building new bridges. This community is truly special. 💙 #AlumniGala #Reunion #Community',
        image: null, tags: ['AlumniGala','Reunion','Community'],
        likes: ['u001','u002'], comments: [],
        createdAt: '2025-03-17T08:00:00Z'
      }
    ],
    events: [
      {
        id: 'e001', title: 'Annual Alumni Gala 2025', emoji: '🎪',
        date: '2025-04-20', time: '7:00 PM', endDate: '2025-04-20', endTime: '11:00 PM',
        location: 'Grand Ballroom, Taj Hotel, Mumbai',
        description: 'Join us for the most awaited alumni event of the year! An evening of networking, entertainment, and celebration of our shared journey.',
        category: 'Social', attendees: ['u001','u002','u003'], maxCapacity: 300,
        host: 'u001', createdAt: '2025-02-01T00:00:00Z', status: 'upcoming'
      },
      {
        id: 'e002', title: 'Tech Talk: AI & The Future of Work', emoji: '🤖',
        date: '2025-03-28', time: '6:00 PM', endDate: '2025-03-28', endTime: '8:00 PM',
        location: 'Virtual (Zoom)',
        description: 'Industry leaders from our alumni network share their insights on how AI is reshaping industries and what skills you need to thrive.',
        category: 'Professional', attendees: ['u001','u002','u004','u005'], maxCapacity: 500,
        host: 'u002', createdAt: '2025-03-01T00:00:00Z', status: 'upcoming'
      },
      {
        id: 'e003', title: 'Startup Bootcamp Weekend', emoji: '💡',
        date: '2025-05-10', time: '9:00 AM', endDate: '2025-05-11', endTime: '6:00 PM',
        location: 'Innovation Hub, Bangalore',
        description: 'A 2-day intensive bootcamp for alumni entrepreneurs. Mentorship sessions, pitch competitions, and networking with VCs.',
        category: 'Workshop', attendees: ['u003'], maxCapacity: 50,
        host: 'u003', createdAt: '2025-03-10T00:00:00Z', status: 'upcoming'
      },
      {
        id: 'e004', title: 'Campus Homecoming 2025', emoji: '🏫',
        date: '2025-06-15', time: '10:00 AM', endDate: '2025-06-15', endTime: '5:00 PM',
        location: 'Main Campus, Delhi',
        description: 'Come back to where it all began! Campus tours, faculty meetings, and a special lunch with the Dean.',
        category: 'Social', attendees: ['u001','u004'], maxCapacity: 200,
        host: 'u001', createdAt: '2025-03-05T00:00:00Z', status: 'upcoming'
      }
    ],
    channels: [
      { id: 'ch001', name: 'General', icon: '💬', description: 'General alumni discussions', isGroup: true, members: ['u001','u002','u003','u004','u005'] },
      { id: 'ch002', name: 'Events & Meetups', icon: '🎉', description: 'Discuss upcoming events', isGroup: true, members: ['u001','u002','u003','u004','u005'] },
      { id: 'ch003', name: 'Career Corner', icon: '💼', description: 'Jobs, referrals, career advice', isGroup: true, members: ['u001','u002','u003','u004','u005'] },
      { id: 'ch004', name: 'Tech Talk', icon: '🤖', description: 'Technology discussions', isGroup: true, members: ['u001','u002','u003','u005'] }
    ],
    messages: {
      ch001: [
        { id: 'm001', senderId: 'u002', text: 'Hey everyone! Welcome to the new Alumni Connect platform! 🎉', createdAt: '2025-03-15T09:00:00Z', reactions: { '👍': ['u001'], '🎉': ['u003','u004'] } },
        { id: 'm002', senderId: 'u001', text: 'Thanks for all being here. This is going to be amazing!', createdAt: '2025-03-15T09:05:00Z', reactions: {} },
        { id: 'm003', senderId: 'u003', text: 'Super excited to reconnect with everyone here 🚀', createdAt: '2025-03-15T09:10:00Z', reactions: { '❤️': ['u002'] } }
      ],
      ch002: [
        { id: 'm004', senderId: 'u004', text: 'Don\'t forget — Annual Gala is on April 20! Register now before seats fill up.', createdAt: '2025-03-16T14:00:00Z', reactions: {} },
        { id: 'm005', senderId: 'u001', text: 'Great reminder! Link to register is in the Events section.', createdAt: '2025-03-16T14:15:00Z', reactions: { '👍': ['u002','u003'] } }
      ],
      ch003: [
        { id: 'm006', senderId: 'u003', text: 'StartupX is hiring full-stack engineers! Message me for referrals 🚀', createdAt: '2025-03-17T10:00:00Z', reactions: { '🔥': ['u001','u002'] } }
      ],
      ch004: [
        { id: 'm007', senderId: 'u002', text: 'Just deployed my first ML model to production. The future is here!', createdAt: '2025-03-17T11:00:00Z', reactions: { '🤖': ['u003'] } }
      ]
    },
    directMessages: {},
    notifications: {
      u001: [
        { id: 'n001', type: 'like', fromId: 'u002', postId: 'p001', text: 'Priya liked your comment', read: false, createdAt: '2025-03-15T10:10:00Z' },
        { id: 'n002', type: 'system', text: '5 new members joined this week', read: false, createdAt: '2025-03-17T08:00:00Z' }
      ]
    },
    passwordResets: {},
    auditLog: [
      { id: 'a001', userId: 'u001', action: 'LOGIN', detail: 'Admin logged in', createdAt: '2025-03-17T08:00:00Z' }
    ],
    settings: {
      siteName: 'Alumni Connect',
      allowRegistration: true,
      requireApproval: true,
      maintenanceMode: false
    }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { console.warn('Storage save failed', e); }
  }

  let _data = load() || JSON.parse(JSON.stringify(defaults));

  return {
    get(collection) { return _data[collection]; },
    set(collection, value) { _data[collection] = value; save(_data); },
    findById(col, id) { return _data[col]?.find(i => i.id === id) || null; },
    findAll(col, pred) { return (_data[col] || []).filter(pred); },
    add(col, item) {
      if (!_data[col]) _data[col] = [];
      _data[col].push(item);
      save(_data);
    },
    update(col, id, updates) {
      const idx = (_data[col] || []).findIndex(i => i.id === id);
      if (idx >= 0) {
        _data[col][idx] = { ..._data[col][idx], ...updates };
        save(_data);
        return _data[col][idx];
      }
      return null;
    },
    delete(col, id) {
      if (!_data[col]) return;
      _data[col] = _data[col].filter(i => i.id !== id);
      save(_data);
    },
    reset() { _data = JSON.parse(JSON.stringify(defaults)); save(_data); },
    genId(prefix) {
      return prefix + '_' + Math.random().toString(36).slice(2,9) + Date.now().toString(36);
    }
  };
})();
