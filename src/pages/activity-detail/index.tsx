import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockActivityList } from '@/data/mockActivity';
import { mockMemberList } from '@/data/mockMember';
import { Activity, VolunteerPosition } from '@/types';
import { formatDateTime, formatTimeRange } from '@/utils/format';
import { useUserStore } from '@/store/useUserStore';

const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useDidShow(() => {
    console.log('[ActivityDetail] Page did show');
    const id = router.params.id;
    const found = mockActivityList.find(a => a.id === id);
    if (found) {
      setActivity(found);
    }
  });

  const getStatusClass = () => {
    switch (activity?.status) {
      case 'upcoming': return styles.statusUpcoming;
      case 'ongoing': return styles.statusOngoing;
      case 'ended': return styles.statusEnded;
      default: return styles.statusUpcoming;
    }
  };

  const getStatusLabel = () => {
    switch (activity?.status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中';
      case 'ended': return '已结束';
      default: return '即将开始';
    }
  };

  const isSignedUp = activity?.signedParticipants.includes(currentUser.id);

  const handleSignUp = () => {
    if (!activity) return;

    if (activity.status !== 'upcoming') {
      Taro.showToast({ title: '该活动已结束或正在进行', icon: 'none' });
      return;
    }

    if (isSignedUp) {
      Taro.showModal({
        title: '取消报名',
        content: '确定要取消报名吗？',
        success: (res) => {
          if (res.confirm) {
            console.log('[ActivityDetail] Cancel sign up:', activity.id);
            setActivity({
              ...activity,
              signedParticipants: activity.signedParticipants.filter(id => id !== currentUser.id),
            });
            setSelectedPosition(null);
            Taro.showToast({ title: '已取消报名', icon: 'success' });
          }
        },
      });
      return;
    }

    if (activity.positions.length > 0 && !selectedPosition) {
      Taro.showToast({ title: '请先选择志愿岗位', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认报名',
      content: selectedPosition
        ? `确定要报名"${activity.positions.find(p => p.id === selectedPosition)?.name}"岗位吗？`
        : '确定要报名参加这个活动吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('[ActivityDetail] Sign up:', activity.id, 'position:', selectedPosition);
          setActivity({
            ...activity,
            signedParticipants: [...activity.signedParticipants, currentUser.id],
            positions: activity.positions.map(p =>
              p.id === selectedPosition
                ? { ...p, signedCount: p.signedCount + 1, signedMembers: [...p.signedMembers, currentUser.id] }
                : p
            ),
          });
          Taro.showToast({ title: '报名成功', icon: 'success' });
        }
      },
    });
  };

  const handleCheckIn = () => {
    Taro.showToast({ title: '签到功能开发中', icon: 'none' });
  };

  const handleRemind = () => {
    if (!currentUser.isPresident) {
      Taro.showToast({ title: '仅社长可发送提醒', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '发送提醒',
      content: `确定要向${activity?.signedParticipants.length}位已报名成员发送活动提醒吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[ActivityDetail] Send reminder');
          Taro.showToast({ title: '提醒已发送', icon: 'success' });
        }
      },
    });
  };

  const handleViewAbsent = () => {
    if (!currentUser.isPresident) {
      Taro.showToast({ title: '仅社长可查看缺席名单', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '缺席名单功能开发中', icon: 'none' });
  };

  const getAbsentMembers = () => {
    if (!activity) return [];
    return mockMemberList.filter(m => activity.absentMembers.includes(m.id));
  };

  if (!activity) {
    return (
      <View className="pageContainer">
        <View className="emptyState">
          <Text className="emptyIcon">❓</Text>
          <Text className="emptyText">加载中...</Text>
        </View>
      </View>
    );
  }

  const progressPercent = Math.round((activity.signedParticipants.length / activity.maxParticipants) * 100);
  const absentMembers = getAbsentMembers();

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.detailCard}>
        <View className={styles.header}>
          <Text className={styles.title}>{activity.title}</Text>
          <View className={styles.statusRow}>
            <Text className={classnames(styles.statusBadge, getStatusClass())}>
              {getStatusLabel()}
            </Text>
          </View>
        </View>

        <View className={styles.metaList}>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>⏰</Text>
            <Text className={styles.metaLabel}>活动时间</Text>
            <Text className={styles.metaValue}>
              {formatTimeRange(activity.startTime, activity.endTime)}
            </Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text className={styles.metaLabel}>活动地点</Text>
            <Text className={styles.metaValue}>{activity.location}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>⏳</Text>
            <Text className={styles.metaLabel}>报名截止</Text>
            <Text className={styles.metaValue}>{formatDateTime(activity.signUpDeadline)}</Text>
          </View>
        </View>

        <Text className={styles.description}>{activity.description}</Text>

        <View className={styles.progress}>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </View>
          <Text className={styles.progressText}>
            已报名 {activity.signedParticipants.length}/{activity.maxParticipants} 人
          </Text>
        </View>

        <View className={styles.organizer}>
          <Image
            className={styles.organizerAvatar}
            src={`https://picsum.photos/id/100/200/200`}
            mode="aspectFill"
          />
          <View className={styles.organizerInfo}>
            <Text className={styles.organizerName}>{activity.organizerName}</Text>
            <Text className={styles.organizerRole}>活动组织者</Text>
          </View>
        </View>
      </View>

      {activity.checkInCode && activity.status === 'upcoming' && (
        <View className={styles.checkInCard}>
          <Text className={styles.checkInTitle}>活动签到码</Text>
          <Text className={styles.checkInCode}>{activity.checkInCode}</Text>
          <Text className={styles.checkInTime}>
            签到开始时间：{formatDateTime(activity.checkInStartTime || activity.startTime)}
          </Text>
        </View>
      )}

      {activity.positions.length > 0 && activity.status === 'upcoming' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>志愿岗位</Text>
          {activity.positions.map((position: VolunteerPosition) => {
            const isFull = position.signedCount >= position.requiredCount;
            const posPercent = Math.round((position.signedCount / position.requiredCount) * 100);
            return (
              <View
                key={position.id}
                className={classnames(
                  styles.positionCard,
                  selectedPosition === position.id && styles.positionActive
                )}
                onClick={() => !isSignedUp && !isFull && setSelectedPosition(position.id)}
              >
                <View className={styles.positionHeader}>
                  <Text className={styles.positionName}>{position.name}</Text>
                  <Text className={styles.positionProgress}>
                    {position.signedCount}/{position.requiredCount}
                  </Text>
                </View>
                <Text className={styles.positionDesc}>{position.description}</Text>
                <View className={styles.positionProgressBar}>
                  <View className={styles.positionProgressFill} style={{ width: `${posPercent}%` }} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {absentMembers.length > 0 && currentUser.isPresident && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            缺席名单
            <Text style={{ fontSize: 24, color: '#ef4444', fontWeight: 'normal' }}>
              {absentMembers.length}人
            </Text>
          </Text>
          <View className={styles.absentList}>
            {absentMembers.map((member) => (
              <View key={member.id} className={styles.absentItem}>
                <Image className={styles.absentAvatar} src={member.avatar} mode="aspectFill" />
                <Text className={styles.absentName}>{member.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.footer}>
        {activity.status === 'upcoming' && (
          <>
            {currentUser.isPresident && (
              <Text className={classnames(styles.footerBtn, styles.btnOutline)} onClick={handleRemind}>
                发送提醒
              </Text>
            )}
            <Text
              className={classnames(
                styles.footerBtn,
                isSignedUp ? styles.btnOutline : styles.btnPrimary
              )}
              onClick={handleSignUp}
            >
              {isSignedUp ? '取消报名' : '立即报名'}
            </Text>
          </>
        )}
        {activity.status === 'ongoing' && (
          <>
            {currentUser.isPresident && (
              <Text className={classnames(styles.footerBtn, styles.btnOutline)} onClick={handleViewAbsent}>
                查看缺席
              </Text>
            )}
            <Text className={classnames(styles.footerBtn, styles.btnPrimary)} onClick={handleCheckIn}>
              立即签到
            </Text>
          </>
        )}
        {activity.status === 'ended' && (
          <Text className={classnames(styles.footerBtn, styles.btnDisabled)}>
            活动已结束
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ActivityDetailPage;
