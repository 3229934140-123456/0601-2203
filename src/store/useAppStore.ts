import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Member, MutualAid, Activity, SignUpRecord, Comment, AidStatus } from '@/types';
import { mockMemberList, mockCurrentUser, mockContributionRecords, mockThankRecords } from '@/data/mockMember';
import { mockMutualAidList } from '@/data/mockMutualAid';
import { mockActivityList, mockSignUpRecords } from '@/data/mockActivity';

const STORAGE_KEY = 'club_app_store_v2';

interface PersistedState {
  mutualAidList: MutualAid[];
  activityList: Activity[];
  signUpRecords: SignUpRecord[];
  memberList: Member[];
}

const loadFromStorage = (): PersistedState | null => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.log('[Store] Load from storage failed:', e);
  }
  return null;
};

const saveToStorage = (state: PersistedState) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify({
      mutualAidList: state.mutualAidList,
      activityList: state.activityList,
      signUpRecords: state.signUpRecords,
      memberList: state.memberList,
    }));
  } catch (e) {
    console.log('[Store] Save to storage failed:', e);
  }
};

const getInitialState = (): PersistedState => {
  const saved = loadFromStorage();
  if (saved) {
    return saved;
  }
  return {
    mutualAidList: mockMutualAidList,
    activityList: mockActivityList,
    signUpRecords: mockSignUpRecords,
    memberList: mockMemberList,
  };
};

interface AppState {
  currentUser: Member;
  mutualAidList: MutualAid[];
  activityList: Activity[];
  signUpRecords: SignUpRecord[];
  memberList: Member[];
  contributionRecords: typeof mockContributionRecords;
  thankRecords: typeof mockThankRecords;

  addMutualAid: (aid: Omit<MutualAid, 'id' | 'createdAt' | 'status' | 'likes' | 'comments' | 'isLiked' | 'isCollected' | 'publisherId' | 'publisherName' | 'publisherAvatar'>) => MutualAid;
  claimAid: (aidId: string, claimantId: string, claimantName: string) => boolean;
  completeAid: (aidId: string) => boolean;
  addComment: (aidId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => boolean;
  toggleLike: (aidId: string, userId: string) => boolean;
  toggleCollect: (aidId: string, userId: string) => boolean;
  getAidById: (aidId: string) => MutualAid | undefined;

  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'status' | 'signedParticipants' | 'absentMembers' | 'reminded' | 'organizerId' | 'organizerName'>) => Activity;
  signUpActivity: (activityId: string, positionId: string | null, userId: string, userName: string) => { success: boolean; message: string };
  cancelSignUp: (activityId: string, userId: string) => boolean;
  checkIn: (activityId: string, userId: string, code: string) => { success: boolean; message: string };
  hasCheckedIn: (activityId: string, userId: string) => boolean;
  sendReminder: (activityId: string) => boolean;
  getActivityById: (activityId: string) => Activity | undefined;
  getAbsentMembers: (activityId: string) => Member[];
  getUserSignUpRecords: (userId: string) => SignUpRecord[];
  getUserSignUpCount: (userId: string) => number;

  setCurrentUser: (user: Member) => void;
  resetStore: () => void;
}

const initialState = getInitialState();

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockCurrentUser,
  mutualAidList: initialState.mutualAidList,
  activityList: initialState.activityList,
  signUpRecords: initialState.signUpRecords,
  memberList: initialState.memberList,
  contributionRecords: mockContributionRecords,
  thankRecords: mockThankRecords,

  addMutualAid: (aidData) => {
    const { currentUser, mutualAidList } = get();
    const newAid: MutualAid = {
      ...aidData,
      id: `aid-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'open' as AidStatus,
      likes: 0,
      comments: [],
      isLiked: false,
      isCollected: false,
      publisherId: currentUser.id,
      publisherName: currentUser.name,
      publisherAvatar: currentUser.avatar,
    };
    const newList = [newAid, ...mutualAidList];
    set({ mutualAidList: newList });
    saveToStorage({ ...get(), mutualAidList: newList });
    console.log('[Store] Add mutual aid:', newAid.id);
    return newAid;
  },

  claimAid: (aidId, claimantId, claimantName) => {
    const { mutualAidList } = get();
    const index = mutualAidList.findIndex(a => a.id === aidId);
    if (index === -1 || mutualAidList[index].status !== 'open') {
      return false;
    }
    const newList = [...mutualAidList];
    newList[index] = {
      ...newList[index],
      status: 'claimed' as AidStatus,
      claimantId,
      claimantName,
    };
    set({ mutualAidList: newList });
    saveToStorage({ ...get(), mutualAidList: newList });
    console.log('[Store] Claim aid:', aidId);
    return true;
  },

  completeAid: (aidId) => {
    const { mutualAidList } = get();
    const index = mutualAidList.findIndex(a => a.id === aidId);
    if (index === -1 || mutualAidList[index].status !== 'claimed') {
      return false;
    }
    const newList = [...mutualAidList];
    newList[index] = { ...newList[index], status: 'completed' as AidStatus };
    set({ mutualAidList: newList });
    saveToStorage({ ...get(), mutualAidList: newList });
    console.log('[Store] Complete aid:', aidId);
    return true;
  },

  addComment: (aidId, commentData) => {
    const { mutualAidList } = get();
    const index = mutualAidList.findIndex(a => a.id === aidId);
    if (index === -1) return false;
    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const newList = [...mutualAidList];
    newList[index] = {
      ...newList[index],
      comments: [...newList[index].comments, newComment],
    };
    set({ mutualAidList: newList });
    saveToStorage({ ...get(), mutualAidList: newList });
    console.log('[Store] Add comment to aid:', aidId);
    return true;
  },

  toggleLike: (aidId, _userId) => {
    const { mutualAidList } = get();
    const index = mutualAidList.findIndex(a => a.id === aidId);
    if (index === -1) return false;
    const aid = mutualAidList[index];
    const newList = [...mutualAidList];
    newList[index] = {
      ...aid,
      isLiked: !aid.isLiked,
      likes: aid.isLiked ? aid.likes - 1 : aid.likes + 1,
    };
    set({ mutualAidList: newList });
    saveToStorage({ ...get(), mutualAidList: newList });
    console.log('[Store] Toggle like:', aidId, !aid.isLiked);
    return !aid.isLiked;
  },

  toggleCollect: (aidId, _userId) => {
    const { mutualAidList } = get();
    const index = mutualAidList.findIndex(a => a.id === aidId);
    if (index === -1) return false;
    const aid = mutualAidList[index];
    const newList = [...mutualAidList];
    newList[index] = { ...aid, isCollected: !aid.isCollected };
    set({ mutualAidList: newList });
    saveToStorage({ ...get(), mutualAidList: newList });
    console.log('[Store] Toggle collect:', aidId, !aid.isCollected);
    return !aid.isCollected;
  },

  getAidById: (aidId) => {
    return get().mutualAidList.find(a => a.id === aidId);
  },

  addActivity: (activityData) => {
    const { currentUser, activityList } = get();
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'upcoming',
      signedParticipants: [],
      absentMembers: [],
      reminded: false,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
    };
    const newList = [newActivity, ...activityList];
    set({ activityList: newList });
    saveToStorage({ ...get(), activityList: newList });
    console.log('[Store] Add activity:', newActivity.id);
    return newActivity;
  },

  signUpActivity: (activityId, positionId, userId, userName) => {
    const { activityList, signUpRecords } = get();
    const actIndex = activityList.findIndex(a => a.id === activityId);
    if (actIndex === -1) return { success: false, message: '活动不存在' };
    const activity = activityList[actIndex];

    if (activity.signedParticipants.includes(userId)) {
      return { success: false, message: '您已报名此活动' };
    }
    if (activity.signedParticipants.length >= activity.maxParticipants) {
      return { success: false, message: '活动人数已满' };
    }

    let targetPosition: typeof activity.positions[number] | undefined;
    if (positionId) {
      targetPosition = activity.positions.find(p => p.id === positionId);
      if (!targetPosition) {
        return { success: false, message: '岗位不存在' };
      }
      if (targetPosition.signedCount >= targetPosition.requiredCount) {
        return { success: false, message: `岗位「${targetPosition.name}」人数已满` };
      }
    }

    const newActivityList = [...activityList];
    const updatedPositions = activity.positions.map(p => {
      if (positionId && p.id === positionId) {
        return {
          ...p,
          signedCount: p.signedCount + 1,
          signedMembers: [...p.signedMembers, userId],
        };
      }
      return p;
    });
    newActivityList[actIndex] = {
      ...activity,
      signedParticipants: [...activity.signedParticipants, userId],
      positions: updatedPositions,
    };

    const newRecord: SignUpRecord = {
      id: `sr-${Date.now()}-${userId}`,
      userId,
      activityId,
      activityTitle: activity.title,
      positionId: positionId || undefined,
      positionName: targetPosition?.name,
      signedAt: new Date().toISOString(),
      checkedIn: false,
    };
    const newRecords = [newRecord, ...signUpRecords];

    set({ activityList: newActivityList, signUpRecords: newRecords });
    saveToStorage({ ...get(), activityList: newActivityList, signUpRecords: newRecords });
    console.log('[Store] Sign up activity:', activityId, 'user:', userName, 'position:', positionId);
    return { success: true, message: '报名成功' };
  },

  cancelSignUp: (activityId, userId) => {
    const { activityList, signUpRecords } = get();
    const actIndex = activityList.findIndex(a => a.id === activityId);
    if (actIndex === -1) return false;
    const activity = activityList[actIndex];
    if (!activity.signedParticipants.includes(userId)) return false;

    const myRecord = signUpRecords.find(r => r.activityId === activityId && r.userId === userId);
    const myPositionId = myRecord?.positionId;

    const newActivityList = [...activityList];
    const updatedPositions = activity.positions.map(p => {
      if (myPositionId && p.id === myPositionId && p.signedMembers.includes(userId)) {
        return {
          ...p,
          signedCount: Math.max(0, p.signedCount - 1),
          signedMembers: p.signedMembers.filter(id => id !== userId),
        };
      }
      return p;
    });
    newActivityList[actIndex] = {
      ...activity,
      signedParticipants: activity.signedParticipants.filter(id => id !== userId),
      positions: updatedPositions,
    };

    const newRecords = signUpRecords.filter(r => !(r.activityId === activityId && r.userId === userId));

    set({ activityList: newActivityList, signUpRecords: newRecords });
    saveToStorage({ ...get(), activityList: newActivityList, signUpRecords: newRecords });
    console.log('[Store] Cancel sign up:', activityId, 'user:', userId);
    return true;
  },

  checkIn: (activityId, userId, code) => {
    const { activityList, signUpRecords } = get();
    const actIndex = activityList.findIndex(a => a.id === activityId);
    if (actIndex === -1) return { success: false, message: '活动不存在' };
    const activity = activityList[actIndex];
    if (!activity.checkInCode) return { success: false, message: '活动未开启签到' };
    if (activity.checkInCode !== code) return { success: false, message: '签到码错误' };
    if (!activity.signedParticipants.includes(userId)) return { success: false, message: '您未报名此活动' };

    const alreadyChecked = signUpRecords.some(
      r => r.activityId === activityId && r.userId === userId && r.checkedIn
    );
    if (alreadyChecked) {
      return { success: false, message: '您已签到，请勿重复签到' };
    }

    const newActivityList = [...activityList];
    newActivityList[actIndex] = {
      ...activity,
      absentMembers: activity.absentMembers.filter(id => id !== userId),
    };

    const newRecords = signUpRecords.map(r => {
      if (r.activityId === activityId && r.userId === userId) {
        return { ...r, checkedIn: true };
      }
      return r;
    });

    set({ activityList: newActivityList, signUpRecords: newRecords });
    saveToStorage({ ...get(), activityList: newActivityList, signUpRecords: newRecords });
    console.log('[Store] Check in success:', activityId, 'user:', userId);
    return { success: true, message: '签到成功' };
  },

  hasCheckedIn: (activityId, userId) => {
    return get().signUpRecords.some(
      r => r.activityId === activityId && r.userId === userId && r.checkedIn
    );
  },

  sendReminder: (activityId) => {
    const { activityList } = get();
    const actIndex = activityList.findIndex(a => a.id === activityId);
    if (actIndex === -1) return false;
    const newActivityList = [...activityList];
    newActivityList[actIndex] = { ...activityList[actIndex], reminded: true };
    set({ activityList: newActivityList });
    saveToStorage({ ...get(), activityList: newActivityList });
    console.log('[Store] Send reminder:', activityId);
    return true;
  },

  getActivityById: (activityId) => {
    return get().activityList.find(a => a.id === activityId);
  },

  getAbsentMembers: (activityId) => {
    const { activityList, memberList, signUpRecords } = get();
    const activity = activityList.find(a => a.id === activityId);
    if (!activity) return [];

    const checkedInUserIds = new Set(
      signUpRecords
        .filter(r => r.activityId === activityId && r.checkedIn)
        .map(r => r.userId)
    );

    const absentIds = activity.signedParticipants.filter(uid => !checkedInUserIds.has(uid));

    return memberList.filter(m => absentIds.includes(m.id));
  },

  getUserSignUpRecords: (userId) => {
    return get().signUpRecords.filter(r => r.userId === userId);
  },

  getUserSignUpCount: (userId) => {
    return get().signUpRecords.filter(r => r.userId === userId).length;
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  resetStore: () => {
    Taro.removeStorageSync(STORAGE_KEY);
    set({
      mutualAidList: mockMutualAidList,
      activityList: mockActivityList,
      signUpRecords: mockSignUpRecords,
      memberList: mockMemberList,
    });
  },
}));
