export type AidType = 'borrow' | 'carpool' | 'material' | 'skill';

export type AidStatus = 'open' | 'claimed' | 'completed' | 'expired';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface MutualAid {
  id: string;
  type: AidType;
  title: string;
  description: string;
  publisherId: string;
  publisherName: string;
  publisherAvatar: string;
  location: string;
  contact: string;
  validUntil: string;
  status: AidStatus;
  claimantId?: string;
  claimantName?: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  isCollected: boolean;
  createdAt: string;
}

export interface AidTypeOption {
  value: AidType;
  label: string;
  tagClass: string;
}

export const AID_TYPE_OPTIONS: AidTypeOption[] = [
  { value: 'borrow', label: '借物', tagClass: 'tagBorrow' },
  { value: 'carpool', label: '拼车', tagClass: 'tagCarpool' },
  { value: 'material', label: '资料', tagClass: 'tagMaterial' },
  { value: 'skill', label: '技能', tagClass: 'tagSkill' },
];
