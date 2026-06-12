import { Member, ContributionRecord, ThankRecord, Department, Grade, Interest } from '@/types';

const getAvatar = (id: number) => `https://picsum.photos/id/${100 + id}/200/200`;

const departments: Department[] = ['主席团', '外联部', '宣传部', '活动部', '技术部', '财务部'];
const grades: Grade[] = ['大一', '大二', '大三', '大四', '研一', '研二', '研三'];
const interests: Interest[] = ['运动', '音乐', '摄影', '阅读', '旅行', '美食', '游戏', '电影'];
const positions = ['社长', '副社长', '部长', '副部长', '干事', '社员'];
const majors = ['计算机科学与技术', '软件工程', '电子信息工程', '通信工程', '机械工程', '工商管理', '市场营销', '金融学', '英语', '汉语言文学'];
const names = ['张明', '李华', '王芳', '刘洋', '陈静', '赵磊', '周雪', '吴涛', '郑雨', '孙阳', '黄佳', '林涛', '徐慧', '马超', '朱琳'];

export const mockMemberList: Member[] = Array.from({ length: 15 }, (_, i) => ({
  id: `user-${i}`,
  name: names[i],
  avatar: getAvatar(i),
  studentId: `202${21 + (i % 4)}${String(1000 + i).padStart(5, '0')}`,
  department: departments[i % departments.length],
  position: i === 0 ? '社长' : i < 3 ? '副社长' : i < 6 ? '部长' : positions[3 + (i % 3)],
  grade: grades[i % grades.length],
  major: majors[i % majors.length],
  phone: `138${String(10000000 + i).slice(-8)}`,
  email: `student${i}@university.edu.cn`,
  interests: [interests[i % interests.length], interests[(i + 2) % interests.length], interests[(i + 4) % interests.length]],
  creditScore: 90 + i % 15,
  contributionCount: 5 + i * 2,
  thankedCount: Math.floor(i / 2) + 1,
  joinDate: `202${21 + (i % 4)}-09-0${1 + (i % 9)}`,
  isPresident: i === 0,
}));

export const mockCurrentUser: Member = mockMemberList[0];

export const mockContributionRecords: ContributionRecord[] = [
  { id: 'cr-1', type: 'aid', title: '帮助同学借相机', description: '在互助广场认领了借相机请求并顺利完成', points: 10, createdAt: '2026-06-10T14:30:00' },
  { id: 'cr-2', type: 'activity', title: '文化节志愿者', description: '参与校园文化节场地布置工作', points: 15, createdAt: '2026-06-08T18:00:00' },
  { id: 'cr-3', type: 'aid', title: '提供复习资料', description: '分享了高数复习资料帮助同学备考', points: 8, createdAt: '2026-06-05T10:15:00' },
  { id: 'cr-4', type: 'activity', title: '技术分享会组织', description: '协助组织前端技术分享会', points: 12, createdAt: '2026-06-01T09:00:00' },
  { id: 'cr-5', type: 'other', title: '社团海报设计', description: '设计了社团招新海报', points: 10, createdAt: '2026-05-28T16:45:00' },
];

export const mockThankRecords: ThankRecord[] = [
  { id: 'tr-1', fromUserId: 'user-2', fromUserName: '李华', reason: '感谢借我相机，拍了很多好看的照片！', createdAt: '2026-06-11T09:30:00' },
  { id: 'tr-2', fromUserId: 'user-5', fromUserName: '陈静', reason: '复习资料太有用了，高数终于及格了！', createdAt: '2026-06-07T14:20:00' },
  { id: 'tr-3', fromUserId: 'user-3', fromUserName: '王芳', reason: '技术分享会组织得很好，学到很多', createdAt: '2026-06-02T11:15:00' },
];

export const DEPARTMENT_OPTIONS: Department[] = ['主席团', '外联部', '宣传部', '活动部', '技术部', '财务部'];
export const GRADE_OPTIONS: Grade[] = ['大一', '大二', '大三', '大四', '研一', '研二', '研三'];
export const INTEREST_OPTIONS: Interest[] = ['运动', '音乐', '摄影', '阅读', '旅行', '美食', '游戏', '电影'];
