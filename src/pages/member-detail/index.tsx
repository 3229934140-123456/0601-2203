import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockMemberList, mockContributionRecords, mockThankRecords } from '@/data/mockMember';
import { Member, ContributionRecord } from '@/types';
import { formatDate, formatRelativeTime } from '@/utils/format';
import { useUserStore } from '@/store/useUserStore';

const MemberDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const [member, setMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<'contribution' | 'thanks'>('contribution');

  useDidShow(() => {
    console.log('[MemberDetail] Page did show');
    const id = router.params.id;
    const foundMember = mockMemberList.find(m => m.id === id);
    if (foundMember) {
      setMember(foundMember);
    }
  });

  const handleCallPhone = () => {
    if (member?.phone) {
      Taro.makePhoneCall({
        phoneNumber: member.phone,
        fail: () => {
          Taro.setClipboardData({
            data: member.phone,
            success: () => Taro.showToast({ title: '手机号已复制', icon: 'success' }),
          });
        },
      });
    }
  };

  const handleCopyEmail = () => {
    if (member?.email) {
      Taro.setClipboardData({
        data: member.email,
        success: () => Taro.showToast({ title: '邮箱已复制', icon: 'success' }),
      });
    }
  };

  const handleSendThank = () => {
    if (member?.id === currentUser.id) {
      Taro.showToast({ title: '不能感谢自己', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '发送感谢',
      content: `确定要向 ${member?.name} 发送感谢吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[MemberDetail] Send thank to:', member?.id);
          Taro.showToast({ title: '感谢已发送', icon: 'success' });
        }
      },
    });
  };

  const handleSendMessage = () => {
    Taro.showToast({ title: '消息功能开发中', icon: 'none' });
  };

  const getPositionTagClass = () => {
    if (member?.isPresident) return 'tagPrimary';
    if (member?.position.includes('副')) return 'tagWarning';
    if (member?.position.includes('部长')) return 'tagSuccess';
    return 'tagInfo';
  };

  const getContributionTypeLabel = (type: ContributionRecord['type']) => {
    switch (type) {
      case 'aid': return '互助';
      case 'activity': return '活动';
      case 'other': return '其他';
      default: return '其他';
    }
  };

  const getContributionTypeClass = (type: ContributionRecord['type']) => {
    switch (type) {
      case 'aid': return 'tagSuccess';
      case 'activity': return 'tagPrimary';
      case 'other': return 'tagInfo';
      default: return 'tagInfo';
    }
  };

  if (!member) {
    return (
      <View className="pageContainer">
        <View className="emptyState">
          <Text className="emptyIcon">❓</Text>
          <Text className="emptyText">加载中...</Text>
        </View>
      </View>
    );
  }

  const contributions = mockContributionRecords.slice(0, 3);
  const thanks = mockThankRecords.slice(0, 3);

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.headerCard}>
        <View className={styles.avatarSection}>
          <Image className={styles.avatar} src={member.avatar} mode="aspectFill" />
          <View className={styles.basicInfo}>
            <View className={styles.nameRow}>
              <Text className={styles.name}>{member.name}</Text>
              <Text className={classnames('tag', getPositionTagClass())}>
                {member.position}
              </Text>
            </View>
            <Text className={styles.department}>{member.department} · {member.grade}</Text>
            <Text className={styles.major}>{member.major}</Text>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{member.creditScore}</Text>
            <Text className={styles.statLabel}>信用分</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{member.contributionCount}</Text>
            <Text className={styles.statLabel}>贡献次数</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{member.thankedCount}</Text>
            <Text className={styles.statLabel}>被感谢</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>基本信息</Text>
        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>🎓</Text>
            <Text className={styles.infoLabel}>学号</Text>
            <Text className={styles.infoValue}>{member.studentId}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>📅</Text>
            <Text className={styles.infoLabel}>加入时间</Text>
            <Text className={styles.infoValue}>{formatDate(member.joinDate)}</Text>
          </View>
          <View
            className={classnames(styles.infoItem, styles.infoItemClickable)}
            onClick={handleCallPhone}
          >
            <Text className={styles.infoIcon}>📱</Text>
            <Text className={styles.infoLabel}>电话</Text>
            <Text className={classnames(styles.infoValue, styles.infoLink)}>
              {member.phone}（点击拨打）
            </Text>
          </View>
          <View
            className={classnames(styles.infoItem, styles.infoItemClickable)}
            onClick={handleCopyEmail}
          >
            <Text className={styles.infoIcon}>📧</Text>
            <Text className={styles.infoLabel}>邮箱</Text>
            <Text className={classnames(styles.infoValue, styles.infoLink)}>
              {member.email}（点击复制）
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>兴趣爱好</Text>
        <View className={styles.interestTags}>
          {member.interests.map((interest, index) => (
            <Text key={index} className={classnames('tag', 'tagInfo')}>
              {interest}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.tabHeader}>
          <Text
            className={classnames(styles.tabItem, activeTab === 'contribution' && styles.tabActive)}
            onClick={() => setActiveTab('contribution')}
          >
            贡献记录
          </Text>
          <Text
            className={classnames(styles.tabItem, activeTab === 'thanks' && styles.tabActive)}
            onClick={() => setActiveTab('thanks')}
          >
            被感谢记录
          </Text>
        </View>

        {activeTab === 'contribution' ? (
          <View className={styles.recordList}>
            {contributions.map((record) => (
              <View key={record.id} className={styles.recordItem}>
                <View className={styles.recordHeader}>
                  <Text className={classnames('tag', getContributionTypeClass(record.type), styles.recordTag)}>
                    {getContributionTypeLabel(record.type)}
                  </Text>
                  <Text className={styles.recordPoints}>+{record.points}分</Text>
                </View>
                <Text className={styles.recordTitle}>{record.title}</Text>
                <Text className={styles.recordDesc}>{record.description}</Text>
                <Text className={styles.recordTime}>{formatRelativeTime(record.createdAt)}</Text>
              </View>
            ))}
            {contributions.length === 0 && (
              <View className="emptyState" style={{ padding: '60rpx 0' }}>
                <Text className="emptyIcon">📝</Text>
                <Text className="emptyText">暂无贡献记录</Text>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.recordList}>
            {thanks.map((record) => (
              <View key={record.id} className={styles.thankItem}>
                <View className={styles.thankHeader}>
                  <Text className={styles.thankFrom}>来自 {record.fromUserName}</Text>
                  <Text className={styles.thankTime}>{formatRelativeTime(record.createdAt)}</Text>
                </View>
                <Text className={styles.thankReason}>"{record.reason}"</Text>
              </View>
            ))}
            {thanks.length === 0 && (
              <View className="emptyState" style={{ padding: '60rpx 0' }}>
                <Text className="emptyIcon">💝</Text>
                <Text className="emptyText">暂无被感谢记录</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View className={styles.actionBar}>
        <View className={styles.actionBtn} onClick={handleSendMessage}>
          <Text className={styles.actionIcon}>💬</Text>
          <Text className={styles.actionText}>发消息</Text>
        </View>
        <View className={styles.actionBtn} onClick={handleCallPhone}>
          <Text className={styles.actionIcon}>📞</Text>
          <Text className={styles.actionText}>打电话</Text>
        </View>
        <View
          className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
          onClick={handleSendThank}
        >
          <Text className={styles.actionIcon}>💝</Text>
          <Text className={styles.actionText}>感谢TA</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default MemberDetailPage;
