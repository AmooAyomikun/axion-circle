// Mock data for Admin Reward Management

export const MOCK_CREDIT_RULES = [
  {
    id: '1',
    title: 'Submit Report',
    description: 'Awarded the moment a resident submits a report with a valid photo and GPS location.',
    trigger: 'Report.submitted',
    appliesTo: 'All categories',
    award: 10,
    multiplier: 1,
    dailyCap: 50,
    monthlyCap: 600,
    monthlyCapUsage: 100,
    updatedAt: '2026-06-01',
    updatedBy: 'Adaeze Okonkwo',
    enabled: true
  },
  {
    id: '2',
    title: 'Report Acknowledged',
    description: 'Awarded when the operations team validates the report as genuine.',
    trigger: 'report.acknowledged',
    appliesTo: 'All categories',
    award: 5,
    multiplier: 1,
    dailyCap: 25,
    monthlyCap: 300,
    monthlyCapUsage: 100,
    updatedAt: '2026-05-22',
    updatedBy: 'Grace Etim',
    enabled: true
  },
  {
    id: '3',
    title: 'Report Resolved',
    description: 'Awarded once the sanitation issue has been cleared and after-photo evidence is uploaded.',
    trigger: 'report.resolved',
    appliesTo: 'All categories',
    award: 5,
    multiplier: 2,
    dailyCap: 30,
    monthlyCap: 400,
    monthlyCapUsage: 100,
    updatedAt: '2026-06-12',
    updatedBy: 'Grace Etim',
    enabled: true
  },
  {
    id: '4',
    title: 'First Report Bonus',
    description: 'One-time welcome bonus for a resident\'s very first accepted report.',
    trigger: 'user.first_report',
    appliesTo: 'All categories',
    award: 20,
    multiplier: 1,
    dailyCap: 20,
    monthlyCap: 20,
    monthlyCapUsage: 100,
    updatedAt: '2026-04-08',
    updatedBy: 'Adaeze Okonkwo',
    enabled: true
  },
  {
    id: '5',
    title: 'Blocked Drain Priority',
    description: 'Bonus credits for flood-risk drain reports during the rainy season.',
    trigger: 'report.submitted',
    appliesTo: 'Blocked Drain',
    award: 15,
    multiplier: 1.5,
    dailyCap: 45,
    monthlyCap: 450,
    monthlyCapUsage: 100,
    updatedAt: '2026-06-05',
    updatedBy: 'Ibrahim Musa',
    enabled: true
  }
];

export const MOCK_PARTNER_STORES = [
  { id: '1', name: 'Shoprite', category: 'Supermarket', location: 'Multiple Locations', redemptionLimit: '5 per user/month', status: 'Active' },
  { id: '2', name: 'KFC', category: 'Fast Food', location: 'Lagos, Abuja', redemptionLimit: 'Unlimited', status: 'Active' },
  { id: '3', name: 'Filmhouse Cinemas', category: 'Entertainment', location: 'Nationwide', redemptionLimit: '2 per user/month', status: 'Suspended' },
  { id: '4', name: 'MTN', category: 'Telecommunications', location: 'Online', redemptionLimit: '10 per user/month', status: 'Active' },
  { id: '5', name: 'Chicken Republic', category: 'Fast Food', location: 'Nationwide', redemptionLimit: 'Unlimited', status: 'Active' }
];

export const MOCK_REDEMPTION_REQUESTS = [
  { id: 'REQ-001', userName: 'John Doe', storeName: 'Shoprite', category: 'Groceries', credits: 500, date: '2023-10-25T14:30:00Z', status: 'Pending' },
  { id: 'REQ-002', userName: 'Jane Smith', storeName: 'MTN', category: 'Airtime', credits: 100, date: '2023-10-24T09:15:00Z', status: 'Approved' },
  { id: 'REQ-003', userName: 'Michael Johnson', storeName: 'KFC', category: 'Food', credits: 300, date: '2023-10-23T18:45:00Z', status: 'Rejected' },
  { id: 'REQ-004', userName: 'Sarah Williams', storeName: 'Filmhouse', category: 'Movie Ticket', credits: 1500, date: '2023-10-22T20:00:00Z', status: 'Collected' },
  { id: 'REQ-005', userName: 'David Brown', storeName: 'Shoprite', category: 'Groceries', credits: 500, date: '2023-10-21T11:20:00Z', status: 'Pending' }
];

export const MOCK_REWARD_CATALOG = [
  { id: 'REW-001', name: '₦500 Shopping Voucher', credits: 500, store: 'Shoprite', limit: '5 per user', status: 'Active', isDiscounted: false },
  { id: 'REW-002', name: '₦1000 Shopping Voucher', credits: 1000, store: 'Shoprite', limit: '2 per user', status: 'Active', isDiscounted: false },
  { id: 'REW-003', name: 'Free Zinger Burger', credits: 800, store: 'KFC', limit: '1 per user', status: 'Active', isDiscounted: true },
  { id: 'REW-004', name: '₦200 Airtime', credits: 200, store: 'MTN', limit: 'Unlimited', status: 'Active', isDiscounted: false },
  { id: 'REW-005', name: 'Standard Movie Ticket', credits: 1500, store: 'Filmhouse', limit: '2 per user', status: 'Draft', isDiscounted: false }
];
