import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { Activity, VolunteerPosition } from '@/types';
import { formatDateTime, formatTimeRange } from '@/utils/format';

const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const activityId = router.params.id;
  const currentUser = useAppStore(s => s.currentUser);
  const activityList = useAppStore(s => s.activityList);
  const memberList = useAppStore(s => s.memberList);
  const signUpRecords = useAppStore(s => s.signUpRecords);
  const signUpActivity = useAppStore(s => s.signUpActivity);
  const cancelSignUp = useAppStore(s => s.cancelSignUp);
  const checkIn = useAppStore(s => s.checkIn);
  const sendReminder = useAppStore(s => s.sendReminder);

  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [checkInInput, setCheckInInput] = useState('');

  const activity = useMemo<Activity | undefined>(() => {
    return activityList.find(a => a.id === activityId);
  }, [activityList, activityId]);

  useDidShow(() => {
    console.log('[ActivityDetail] Page did show, activityId:', activityId);
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

  const isSignedUp = activity?.signedParticipants.includes(currentUser.id) || false;
  const isCheckedIn = useMemo(() => {
    return signUpRecords.some(r => r.activityId === activityId && r.checkedIn && activity?.signedParticipants.includes(currentUser.id));
  }, [signUpRecords, activityId, activity, currentUser.id]);

  const absentMembers = useMemo(() => {
    if (!activity) return [];
    const checkedInUserIds = signUpRecords
      .filter(r => r.activityId === activityId && r.checkedIn)
      .map(r => {
        const act = activityList.find(a => a.id === r.activityId);
        return act?.signedParticipants || [];
      })
      .flat();
    const checkedSet = new Set(checkedInUserIds);
    const absentIds = activity.signedParticipants.filter(uid => !checkedSet.has(uid));
    return memberList.filter(m => absentIds.includes(m.id));
  }, [activity, activityId, signUpRecords, activityList, memberList]);

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
          if (res.confirm && activity) {
            const ok = cancelSignUp(activity.id, currentUser.id);
            if (ok) {
              setSelectedPosition(null);
              Taro.showToast({ title: '已取消报名', icon: 'success' });
            } else {
              Taro.showToast({ title: '取消失败', icon: 'none' });
            }
          }
        },
      });
      return;
    }

    if (activity.positions.length > 0 && !selectedPosition) {
      Taro.showToast({ title: '请先选择志愿岗位', icon: 'none' });
      return;
    }

    if (activity.signedParticipants.length >= activity.maxParticipants) {
      Taro.showToast({ title: '活动人数已满', icon: 'none' });
      return;
    }

    const position = selectedPosition ? activity.positions.find(p => p.id === selectedPosition) : null;
    if (position && position.signedCount >= position.requiredCount) {
      Taro.showToast({ title: '该岗位人数已满', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认报名',
      content: position
        ? `确定要报名"${position.name}"岗位吗？`
        : '确定要报名参加这个活动吗？',
      success: (res) => {
        if (res.confirm && activity) {
          const ok = signUpActivity(activity.id, selectedPosition, currentUser.id, currentUser.name);
          if (ok) {
            Taro.showToast({ title: '报名成功', icon: 'success' });
          } else {
            Taro.showToast({ title: '报名失败', icon: 'none' });
          }
        }
      },
    });
  };

  const handleCheckIn = () => {
    if (!activity) return;
    if (!activity.checkInCode) {
      Taro.showToast({ title: '活动未开启签到', icon: 'none' });
      return;
    }
    if (!checkInInput.trim()) {
      Taro.showToast({ title: '请输入签到码', icon: 'none' });
      return;
    }
    const result = checkIn(activity.id, currentUser.id, checkInInput.trim());
    Taro.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
    if (result.success) {
      setCheckInInput('');
    }
  };

  const handleRemind = () => {
    if (!currentUser.isPresident) {
      Taro.showToast({ title: '仅社长可发送提醒', icon: 'none' });
      return;
    }
    if (!activity) return;
    if (activity.reminded) {
      Taro.showToast({ title: '提醒已发送，请勿重复', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '发送提醒',
      content: `确定要向${activity.signedParticipants.length}位已报名成员发送活动提醒吗？`,
      success: (res) => {
        if (res.confirm && activity) {
          const ok = sendReminder(activity.id);
          if (ok) {
            Taro.showToast({ title: '提醒已发送', icon: 'success' });
          }
        }
      },
    });
  };

  const handleViewAbsent = () => {
    if (!currentUser.isPresident) {
      Taro.showToast({ title: '仅社长可查看缺席名单', icon: 'none' });
      return;
    }
    if (absentMembers.length === 0) {
      Taro.showToast({ title: '暂无缺席成员', icon: 'none' });
      return;
    }
  };

  if (!activity) {
    return (
      <View className="pageContainer">
        <View className="emptyState">
          <Text className="emptyIcon">❓</Text>
          <Text className="emptyText">活动不存在或已删除</Text>
        </View>
      </View>
    );
  }

  const progressPercent = Math.round((activity.signedParticipants.length / activity.maxParticipants) * 100);

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.detailCard}>
        <View className={styles.header}>
          <Text className={styles.title}>{activity.title}</Text>
          <View className={styles.statusRow}>
            <Text className={classnames(styles.statusBadge, getStatusClass())}>
              {getStatusLabel()}
            </Text>
            {activity.reminded && (
              <Text className={classnames('tag', 'tagInfo')} style={{ marginLeft: 8 }}>
                🔔 已提醒
              </Text>
            )}
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
          {activity.checkInCode && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🔐</Text>
              <Text className={styles.metaLabel}>签到方式</Text>
              <Text className={styles.metaValue}>签到码签到</Text>
            </View>
          )}
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

      {activity.checkInCode && (activity.status === 'upcoming' || activity.status === 'ongoing') && (
        <View className={styles.checkInCard}>
          {currentUser.isPresident ? (
            <>
              <Text className={styles.checkInTitle}>活动签到码</Text>
              <Text className={styles.checkInCode}>{activity.checkInCode}</Text>
              <Text className={styles.checkInTime}>
                签到开始时间：{formatDateTime(activity.checkInStartTime || activity.startTime)}
              </Text>
            </>
          ) : (
            <>
              <Text className={styles.checkInTitle}>活动签到</Text>
              {isCheckedIn ? (
                <View className={styles.checkedIn}>
                  <Text className={styles.checkedInIcon}>✅</Text>
                  <Text className={styles.checkedInText}>您已完成签到</Text>
                </View>
              ) : (
                <>
                  <View className={styles.checkInInputRow}>
                    <Input
                      className={styles.checkInInput}
                      placeholder="请输入签到码"
                      value={checkInInput}
                      onInput={(e) => setCheckInInput(e.detail.value)}
                      maxlength={20}
                    />
                    <Text className={styles.checkInBtn} onClick={handleCheckIn}>
                      签到
                    </Text>
                  </View>
                  <Text className={styles.checkInTip}>
                    请向社长获取签到码后完成签到
                  </Text>
                </>
              )}
            </>
          )}
        </View>
      )}

      {activity.positions.length > 0 && activity.status === 'upcoming' && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>志愿岗位</Text>
          {activity.positions.map((position: VolunteerPosition) => {
            const isFull = position.signedCount >= position.requiredCount;
            const posPercent = Math.round((position.signedCount / position.requiredCount) * 100);
            const userSignedThis = position.signedMembers.includes(currentUser.id);
            return (
              <View
                key={position.id}
                className={classnames(
                  styles.positionCard,
                  (selectedPosition === position.id || userSignedThis) && styles.positionActive,
                  isFull && !userSignedThis && styles.positionDisabled
                )}
                onClick={() => !isSignedUp && !isFull && setSelectedPosition(position.id)}
              >
                <View className={styles.positionHeader}>
                  <Text className={styles.positionName}>
                    {position.name}
                    {userSignedThis && <Text style={{ color: '#22c55e', marginLeft: 8 }}>（已选）</Text>}
                  </Text>
                  <Text className={styles.positionProgress}>
                    {position.signedCount}/{position.requiredCount}
                  </Text>
                </View>
                <Text className={styles.positionDesc}>{position.description}</Text>
                <View className={styles.positionProgressBar}>
                  <View
                    className={classnames(styles.positionProgressFill, isFull && styles.positionProgressFull)}
                    style={{ width: `${posPercent}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {(activity.status === 'ongoing' || activity.status === 'ended') && currentUser.isPresident && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            缺席名单
            <Text style={{ fontSize: 24, color: '#ef4444', fontWeight: 'normal', marginLeft: 8 }}>
              {absentMembers.length}人
            </Text>
          </Text>
          {absentMembers.length > 0 ? (
            <View className={styles.absentList}>
              {absentMembers.map((member) => (
                <View key={member.id} className={styles.absentItem}>
                  <Image className={styles.absentAvatar} src={member.avatar} mode="aspectFill" />
                  <View className={styles.absentInfo}>
                    <Text className={styles.absentName}>{member.name}</Text>
                    <Text className={styles.absentDept}>{member.department} · {member.position}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="emptyState" style={{ padding: '40rpx 0' }}>
              <Text className="emptyIcon">🎉</Text>
              <Text className="emptyText">全员签到，无缺席</Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.footer}>
        {activity.status === 'upcoming' && (
          <>
            {currentUser.isPresident && (
              <Text
                className={classnames(styles.footerBtn, styles.btnOutline, activity.reminded && styles.footerBtnDisabled)}
                onClick={handleRemind}
              >
                {activity.reminded ? '已发送提醒' : '发送提醒'}
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
                查看缺席（{absentMembers.length}）
              </Text>
            )}
            {activity.checkInCode && !isCheckedIn && !currentUser.isPresident ? (
              <Text className={classnames(styles.footerBtn, styles.btnPrimary)} onClick={handleCheckIn}>
                立即签到
              </Text>
            ) : isCheckedIn ? (
              <Text className={classnames(styles.footerBtn, styles.btnDisabled)}>
                ✅ 已签到
              </Text>
            ) : (
              <Text className={classnames(styles.footerBtn, styles.btnDisabled)}>
                活动进行中
              </Text>
            )}
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
