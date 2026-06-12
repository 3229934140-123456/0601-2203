export type Department = '主席团' | '外联部' | '宣传部' | '活动部' | '技术部' | '财务部';
export type Grade = '大一' | '大二' | '大三' | '大四' | '研一' | '研二' | '研三';
export type Interest = '运动' | '音乐' | '摄影' | '阅读' | '旅行' | '美食' | '游戏' | '电影';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  studentId: string;
  department: Department;
  position: string;
  grade: Grade;
  major: string;
  phone: string;
  email: string;
  interests: Interest[];
  creditScore: number;
  contributionCount: number;
  thankedCount: number;
  joinDate: string;
  isPresident: boolean;
}

export interface ContributionRecord {
  id: string;
  type: 'aid' | 'activity' | 'other';
  title: string;
  description: string;
  points: number;
  createdAt: string;
}

export interface ThankRecord {
  id: string;
  fromUserId: string;
  fromUserName: string;
  reason: string;
  createdAt: string;
}
