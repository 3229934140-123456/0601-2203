import { Activity, SignUpRecord } from '@/types';

export const mockActivityList: Activity[] = [
  {
    id: 'act-1',
    title: '校园文化节志愿者招募',
    description: '一年一度的校园文化节即将举办，现面向全体社员招募志愿者。活动当天需要协助布置场地、引导嘉宾、维护秩序等工作。表现优秀的志愿者将获得社团贡献积分奖励！',
    organizerId: 'user-0',
    organizerName: '张明',
    location: '学校大礼堂及周边',
    startTime: '2026-06-20T09:00:00',
    endTime: '2026-06-20T18:00:00',
    signUpDeadline: '2026-06-18T23:59:59',
    maxParticipants: 50,
    signedParticipants: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    positions: [
      { id: 'pos-1', name: '场地布置组', description: '负责活动前场地布置和活动后清理', requiredCount: 15, signedCount: 8, signedMembers: ['user-1', 'user-2'] },
      { id: 'pos-2', name: '嘉宾接待组', description: '负责迎接和引导嘉宾', requiredCount: 10, signedCount: 5, signedMembers: ['user-3', 'user-4'] },
      { id: 'pos-3', name: '摄影记录组', description: '负责活动摄影和视频记录', requiredCount: 5, signedCount: 3, signedMembers: ['user-5'] },
    ],
    status: 'upcoming',
    checkInCode: 'CULT2026',
    checkInStartTime: '2026-06-20T08:30:00',
    absentMembers: [],
    reminded: true,
    createdAt: '2026-06-10T10:00:00',
  },
  {
    id: 'act-2',
    title: '社团团建活动',
    description: '为增进社员之间的了解，特举办本次团建活动。活动包含破冰游戏、户外拓展、烧烤聚餐等环节，欢迎大家积极参与！',
    organizerId: 'user-0',
    organizerName: '张明',
    location: '城市公园烧烤区',
    startTime: '2026-06-25T10:00:00',
    endTime: '2026-06-25T18:00:00',
    signUpDeadline: '2026-06-23T23:59:59',
    maxParticipants: 30,
    signedParticipants: ['user-1', 'user-2', 'user-6', 'user-7'],
    positions: [
      { id: 'pos-4', name: '活动策划', description: '协助准备游戏道具和活动流程', requiredCount: 3, signedCount: 2, signedMembers: ['user-6', 'user-7'] },
      { id: 'pos-5', name: '食材采购', description: '负责采购烧烤食材和饮品', requiredCount: 4, signedCount: 1, signedMembers: ['user-1'] },
    ],
    status: 'upcoming',
    absentMembers: [],
    reminded: false,
    createdAt: '2026-06-12T14:30:00',
  },
  {
    id: 'act-3',
    title: '技术分享会：前端开发入门',
    description: '邀请了毕业学长分享前端开发经验，内容包括HTML/CSS基础、JavaScript入门、主流框架介绍等。适合对前端开发感兴趣的同学参加。',
    organizerId: 'user-3',
    organizerName: '王芳',
    location: '教学楼B302',
    startTime: '2026-06-15T19:00:00',
    endTime: '2026-06-15T21:00:00',
    signUpDeadline: '2026-06-15T12:00:00',
    maxParticipants: 40,
    signedParticipants: ['user-1', 'user-2', 'user-4', 'user-5', 'user-8', 'user-9'],
    positions: [],
    status: 'ended',
    absentMembers: ['user-2'],
    reminded: true,
    createdAt: '2026-06-08T09:00:00',
  },
  {
    id: 'act-4',
    title: '校园志愿献血活动',
    description: '联合校医院举办志愿献血活动，参与献血的同学可获得精美礼品和社团贡献积分。请提前了解献血注意事项，确保身体健康。',
    organizerId: 'user-2',
    organizerName: '李华',
    location: '校医院一楼大厅',
    startTime: '2026-06-18T09:00:00',
    endTime: '2026-06-18T16:00:00',
    signUpDeadline: '2026-06-17T23:59:59',
    maxParticipants: 100,
    signedParticipants: ['user-1', 'user-3', 'user-5', 'user-7'],
    positions: [
      { id: 'pos-6', name: '现场引导', description: '引导献血同学填写表格和排队', requiredCount: 8, signedCount: 4, signedMembers: ['user-1', 'user-3'] },
      { id: 'pos-7', name: '物资管理', description: '管理礼品和物资发放', requiredCount: 4, signedCount: 2, signedMembers: ['user-5', 'user-7'] },
    ],
    status: 'upcoming',
    reminded: false,
    absentMembers: [],
    createdAt: '2026-06-11T11:00:00',
  },
];

export const mockSignUpRecords: SignUpRecord[] = [
  { id: 'sr-1', userId: 'user-1', activityId: 'act-1', activityTitle: '校园文化节志愿者招募', positionId: 'pos-1', positionName: '场地布置组', signedAt: '2026-06-11T10:30:00', checkedIn: false },
  { id: 'sr-2', userId: 'user-1', activityId: 'act-2', activityTitle: '社团团建活动', positionId: 'pos-5', positionName: '食材采购', signedAt: '2026-06-13T09:15:00', checkedIn: false },
  { id: 'sr-3', userId: 'user-1', activityId: 'act-3', activityTitle: '技术分享会：前端开发入门', signedAt: '2026-06-14T14:20:00', checkedIn: true },
  { id: 'sr-4', userId: 'user-1', activityId: 'act-4', activityTitle: '校园志愿献血活动', positionId: 'pos-6', positionName: '现场引导', signedAt: '2026-06-12T16:45:00', checkedIn: false },
];

export const getActivityStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束',
    cancelled: '已取消',
  };
  return map[status] || status;
};

export const getActivityStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    upcoming: '#2563eb',
    ongoing: '#10b981',
    ended: '#64748b',
    cancelled: '#ef4444',
  };
  return map[status] || '#64748b';
};
