import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Member, MutualAid, Activity, SignUpRecord, Comment, AidStatus } from '@/types';
import { mockMemberList, mockCurrentUser, mockContributionRecords, mockThankRecords } from '@/data/mockMember';
import { mockMutualAidList } from '@/data/mockMutualAid';
import { mockActivityList, mockSignUpRecords } from '@/data/mockActivity';

const STORAGE_KEY = 'club_app_store_v3';

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

const normalizeData = (state: PersistedState): PersistedState => {
  const { activityList, signUpRecords, memberList } = state;
  const newRecords = [...signUpRecords];
  const newActivityList = activityList.map(activity => ({ ...activity }));
  let changed = false;

  activityList.forEach((activity, actIdx) => {
    const activityAbsentSet = new Set(activity.absentMembers);

    activity.signedParticipants.forEach(userId => {
      const existingRecord = newRecords.find(
        r => r.activityId === activity.id && r.userId === userId
      );

      if (!existingRecord) {
        let positionId: string | undefined;
        let positionName: string | undefined;
        activity.positions.forEach(pos => {
          if (pos.signedMembers.includes(userId)) {
            positionId = pos.id;
            positionName = pos.name;
          }
        });

        const isAbsent = activityAbsentSet.has(userId);
        const newRecord: SignUpRecord = {
          id: `sr-${activity.id}-${userId}`,
          userId,
          activityId: activity.id,
          activityTitle: activity.title,
          positionId,
          positionName,
          signedAt: activity.createdAt,
          checkedIn: activity.status === 'ended' && !isAbsent,
          checkInTime: activity.status === 'ended' && !isAbsent ? activity.startTime : undefined,
        };
        newRecords.push(newRecord);
        changed = true;
        console.log('[Store] Auto-create missing signUp record:', userId, activity.title);
      } else {
        if (!existingRecord.userId) {
          (existingRecord as any).userId = userId;
          changed = true;
        }
        if (existingRecord.checkedIn && activityAbsentSet.has(userId)) {
          existingRecord.checkedIn = false;
          existingRecord.checkInTime = undefined;
          changed = true;
        }
        if (!existingRecord.checkedIn && activity.status === 'ended' && !activityAbsentSet.has(userId)) {
          existingRecord.checkedIn = true;
          if (!existingRecord.checkInTime) {
            existingRecord.checkInTime = activity.startTime;
          }
          changed = true;
        }
        if (existingRecord.checkedIn && !existingRecord.checkInTime) {
          existingRecord.checkInTime = activity.startTime;
          changed = true;
        }
      }
    });

    const updatedPositions = newActivityList[actIdx].positions.map(position => {
      const actualCount = position.signedMembers.length;
      if (position.signedCount !== actualCount) {
        changed = true;
        return { ...position, signedCount: actualCount };
      }
      return position;
    });
    newActivityList[actIdx] = { ...newActivityList[actIdx], positions: updatedPositions };
  });

  newRecords.forEach(record => {
    if (!record.userId) {
      const member = memberList.find(m =>
        newRecords.filter(r => r.activityId === record.activityId && r.userId).length === 0
      );
      if (member) {
        (record as any).userId = member.id;
        changed = true;
      }
    }
  });

  newRecords.forEach(record => {
    const activity = newActivityList.find(a => a.id === record.activityId);
    if (!activity) return;

    if (record.positionId && !record.positionName) {
      const pos = activity.positions.find(p => p.id === record.positionId);
      if (pos) {
        record.positionName = pos.name;
        changed = true;
      }
    }

    if (!record.positionId && !record.positionName) {
      const pos = activity.positions.find(p => p.signedMembers.includes(record.userId));
      if (pos) {
        record.positionId = pos.id;
        record.positionName = pos.name;
        changed = true;
      }
    }

    if (record.positionId) {
      const pos = activity.positions.find(p => p.id === record.positionId);
      if (pos && !pos.signedMembers.includes(record.userId)) {
        const updatedMembers = [...pos.signedMembers, record.userId];
        const posIdx = activity.positions.indexOf(pos);
        newActivityList[activityList.indexOf(activity)] = {
          ...activity,
          positions: activity.positions.map((p, i) =>
            i === posIdx ? { ...p, signedMembers: updatedMembers, signedCount: updatedMembers.length } : p
          ),
        };
        changed = true;
      }
    }
  });

  if (changed) {
    console.log('[Store] Data normalized, saving to storage');
    saveToStorage({ ...state, activityList: newActivityList, signUpRecords: newRecords });
  }

  return {
    ...state,
    activityList: newActivityList,
    signUpRecords: newRecords,
  };
};

const getInitialState = (): PersistedState => {
  const saved = loadFromStorage();
  const rawState = saved || {
    mutualAidList: mockMutualAidList,
    activityList: mockActivityList,
    signUpRecords: mockSignUpRecords,
    memberList: mockMemberList,
  };
  return normalizeData(rawState);
};

export interface RosterMember {
  userId: string;
  name: string;
  avatar: string;
  department: string;
  position: string;
  positionId?: string;
  positionName?: string;
  checkedIn: boolean;
  checkInTime?: string;
  signedAt: string;
}

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
  sendReminder: (activityId: string) => { success: boolean; absentCount: number };
  getActivityById: (activityId: string) => Activity | undefined;
  getAbsentMembers: (activityId: string) => Member[];
  getRoster: (activityId: string) => RosterMember[];
  getCheckInRecords: (activityId: string) => RosterMember[];
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
      absentMembers: activity.absentMembers.filter(id => id !== userId),
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

    const now = new Date().toISOString();

    const newActivityList = [...activityList];
    newActivityList[actIndex] = {
      ...activity,
      absentMembers: activity.absentMembers.filter(id => id !== userId),
    };

    const newRecords = signUpRecords.map(r => {
      if (r.activityId === activityId && r.userId === userId) {
        return { ...r, checkedIn: true, checkInTime: now };
      }
      return r;
    });

    set({ activityList: newActivityList, signUpRecords: newRecords });
    saveToStorage({ ...get(), activityList: newActivityList, signUpRecords: newRecords });
    console.log('[Store] Check in success:', activityId, 'user:', userId, 'time:', now);
    return { success: true, message: '签到成功' };
  },

  hasCheckedIn: (activityId, userId) => {
    return get().signUpRecords.some(
      r => r.activityId === activityId && r.userId === userId && r.checkedIn
    );
  },

  sendReminder: (activityId) => {
    const { activityList, signUpRecords } = get();
    const actIndex = activityList.findIndex(a => a.id === activityId);
    if (actIndex === -1) return { success: false, absentCount: 0 };
    const activity = activityList[actIndex];

    const checkedInIds = new Set(
      signUpRecords.filter(r => r.activityId === activityId && r.checkedIn).map(r => r.userId)
    );
    const absentCount = activity.signedParticipants.filter(id => !checkedInIds.has(id)).length;

    const newActivityList = [...activityList];
    newActivityList[actIndex] = { ...activityList[actIndex], reminded: true };
    set({ activityList: newActivityList });
    saveToStorage({ ...get(), activityList: newActivityList });
    console.log('[Store] Send reminder:', activityId, 'absent:', absentCount);
    return { success: true, absentCount };
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

  getRoster: (activityId) => {
    const { activityList, signUpRecords, memberList } = get();
    const activity = activityList.find(a => a.id === activityId);
    if (!activity) return [];

    return activity.signedParticipants.map(userId => {
      const member = memberList.find(m => m.id === userId);
      const record = signUpRecords.find(r => r.activityId === activityId && r.userId === userId);
      return {
        userId,
        name: member?.name || '未知成员',
        avatar: member?.avatar || '',
        department: member?.department || '',
        position: member?.position || '',
        positionId: record?.positionId,
        positionName: record?.positionName,
        checkedIn: record?.checkedIn || false,
        checkInTime: record?.checkInTime,
        signedAt: record?.signedAt || activity.createdAt,
      };
    });
  },

  getCheckInRecords: (activityId) => {
    const roster = get().getRoster(activityId);
    return roster.filter(m => m.checkedIn);
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
