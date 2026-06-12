import { MutualAid, AidType } from '@/types';

const getAvatar = (id: number) => `https://picsum.photos/id/${100 + id}/200/200`;

const aidTypes: AidType[] = ['borrow', 'carpool', 'material', 'skill'];
const titles: Record<AidType, string[]> = {
  borrow: ['求借相机一周', '急需充电宝', '借一下笔记本电脑', '求借投影仪', '借羽毛球拍'],
  carpool: ['周末拼车去高铁站', '求拼车去机场', '周一早上拼车去市区', '拼车去招聘会'],
  material: ['求高数复习资料', '求Python学习笔记', '借往年期末试卷', '求英语四级资料'],
  skill: ['求PS修图教学', '求吉他入门指导', '求英语口语陪练', '求羽毛球教学'],
};
const locations = ['图书馆门口', '宿舍楼下', '教学楼A座', '食堂门口', '体育馆'];
const names = ['张明', '李华', '王芳', '刘洋', '陈静', '赵磊', '周雪', '吴涛', '郑雨', '孙阳'];

export const mockMutualAidList: MutualAid[] = Array.from({ length: 15 }, (_, i) => {
  const type = aidTypes[i % aidTypes.length];
  const titleList = titles[type];
  const createdAt = new Date(Date.now() - i * 3600000 * 2).toISOString();
  const validUntil = new Date(Date.now() + (7 - i % 7) * 86400000).toISOString();

  return {
    id: `aid-${i}`,
    type,
    title: titleList[i % titleList.length],
    description: `这是一条${type === 'borrow' ? '借物' : type === 'carpool' ? '拼车' : type === 'material' ? '资料求助' : '技能交换'}的求助信息，希望有同学能够帮忙。我会非常感谢你的帮助！`,
    publisherId: `user-${i % 10}`,
    publisherName: names[i % names.length],
    publisherAvatar: getAvatar(i % 10),
    location: locations[i % locations.length],
    contact: `138${String(10000000 + i).slice(-8)}`,
    validUntil,
    status: i % 5 === 0 ? 'claimed' : i % 7 === 0 ? 'completed' : 'open',
    claimantId: i % 5 === 0 ? `user-${(i + 3) % 10}` : undefined,
    claimantName: i % 5 === 0 ? names[(i + 3) % names.length] : undefined,
    likes: Math.floor(Math.random() * 50) + 5,
    comments: Array.from({ length: i % 3 }, (_, j) => ({
      id: `comment-${i}-${j}`,
      userId: `user-${(i + j) % 10}`,
      userName: names[(i + j) % names.length],
      userAvatar: getAvatar((i + j) % 10),
      content: j % 2 === 0 ? '我可以帮你！' : '请问还需要吗？',
      createdAt: new Date(Date.now() - j * 3600000).toISOString(),
    })),
    isLiked: i % 3 === 0,
    isCollected: i % 4 === 0,
    createdAt,
  };
});

export const getAidTypeLabel = (type: AidType): string => {
  const map: Record<AidType, string> = {
    borrow: '借物',
    carpool: '拼车',
    material: '资料',
    skill: '技能',
  };
  return map[type];
};

export const getAidStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    open: '待认领',
    claimed: '已认领',
    completed: '已完成',
    expired: '已过期',
  };
  return map[status] || status;
};
