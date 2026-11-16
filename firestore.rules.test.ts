/**
 * Phase 0 Payload-First Security TDD Test Suite for LifeOS Firestore Rules.
 * Verifies that all "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface DirtyPayloadCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyPayloadCase[] = [
  {
    id: 1,
    name: 'Unverified Email Spoof',
    collection: 'users',
    docId: 'user_1',
    operation: 'get',
    auth: { uid: 'user_1', email_verified: false },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Cross-Tenant Mission Creation',
    collection: 'missions',
    docId: 'mission_1',
    operation: 'create',
    auth: { uid: 'attacker_uid', email_verified: true },
    payload: { userId: 'victim_uid', title: 'Hijack mission' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Orphaned Goal Creation Without Parent User Document',
    collection: 'goals',
    docId: 'goal_orphan',
    operation: 'create',
    auth: { uid: 'non_existent_user', email_verified: true },
    payload: { userId: 'non_existent_user', title: 'Orphan Goal' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection on User Profile',
    collection: 'users',
    docId: 'user_1',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: { isAdmin: true, role: 'superadmin' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Terminal Mission Re-Opening After Completed Status',
    collection: 'missions',
    docId: 'completed_mission_1',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: { status: 'Started' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immutable createdAt Tampering on Update',
    collection: 'missions',
    docId: 'mission_1',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged Client Timestamp on Creation',
    collection: 'finance',
    docId: 'fin_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { createdAt: '2099-01-01T00:00:00Z', updatedAt: '2099-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Oversized String DoS Attack on Mission Title',
    collection: 'missions',
    docId: 'mission_dos',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { title: 'A'.repeat(5000) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Path ID Poisoning with Illegal Characters',
    collection: 'goals',
    docId: 'bad$id with spaces!',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { userId: 'user_1', title: 'Valid Title' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Negative Financial Amount Injection',
    collection: 'finance',
    docId: 'fin_neg',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { userId: 'user_1', amount: -50000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unscoped List Query Across All Users',
    collection: 'missions',
    docId: '*',
    operation: 'list',
    auth: { uid: 'attacker_uid', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Profile Cross-Read Attempt by Another Authenticated User',
    collection: 'users',
    docId: 'victim_uid',
    operation: 'get',
    auth: { uid: 'attacker_uid', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
