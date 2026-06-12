import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { MutualAid } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/format';
import { useAppStore } from '@/store/useAppStore';

const AidDetailPage: React.FC = () => {
  const router = useRouter();
  const aidId = router.params.id;
  const currentUser = useAppStore(s => s.currentUser);
  const mutualAidList = useAppStore(s => s.mutualAidList);
  const claimAid = useAppStore(s => s.claimAid);
  const completeAid = useAppStore(s => s.completeAid);
  const addComment = useAppStore(s => s.addComment);
  const toggleLike = useAppStore(s => s.toggleLike);
  const toggleCollect = useAppStore(s => s.toggleCollect);

  const [commentText, setCommentText] = useState('');

  const aid = useMemo<MutualAid | undefined>(() => {
    return mutualAidList.find(a => a.id === aidId);
  }, [mutualAidList, aidId]);

  useDidShow(() => {
    console.log('[AidDetail] Page did show, aidId:', aidId);
  });

  const getTagClass = () => {
    switch (aid?.type) {
      case 'borrow': return 'tagBorrow';
      case 'carpool': return 'tagCarpool';
      case 'material': return 'tagMaterial';
      case 'skill': return 'tagSkill';
      default: return 'tagBorrow';
    }
  };

  const getStatusClass = () => {
    switch (aid?.status) {
      case 'open': return styles.statusOpen;
      case 'claimed': return styles.statusClaimed;
      case 'completed': return styles.statusCompleted;
      default: return styles.statusOpen;
    }
  };

  const getStatusLabel = () => {
    switch (aid?.status) {
      case 'open': return '待认领';
      case 'claimed': return '已认领';
      case 'completed': return '已完成';
      default: return '待认领';
    }
  };

  const getTypeLabel = () => {
    switch (aid?.type) {
      case 'borrow': return '借物';
      case 'carpool': return '拼车';
      case 'material': return '资料';
      case 'skill': return '技能';
      default: return '借物';
    }
  };

  const handleClaim = () => {
    if (!aid) return;
    if (aid.publisherId === currentUser.id) {
      Taro.showToast({ title: '不能认领自己发布的求助', icon: 'none' });
      return;
    }
    if (aid.status !== 'open') {
      Taro.showToast({ title: '该求助已被认领', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认认领',
      content: '确定要认领这条求助吗？认领后请及时联系发布者完成互助。',
      success: (res) => {
        if (res.confirm && aid) {
          const ok = claimAid(aid.id, currentUser.id, currentUser.name);
          if (ok) {
            Taro.showToast({ title: '认领成功', icon: 'success' });
          } else {
            Taro.showToast({ title: '认领失败', icon: 'none' });
          }
        }
      },
    });
  };

  const handleComplete = () => {
    if (!aid) return;
    Taro.showModal({
      title: '确认完成',
      content: '确定要将这条互助标记为已完成吗？',
      success: (res) => {
        if (res.confirm && aid) {
          const ok = completeAid(aid.id);
          if (ok) {
            Taro.showToast({ title: '已确认完成', icon: 'success' });
          }
        }
      },
    });
  };

  const handleLike = () => {
    if (!aid) return;
    toggleLike(aid.id, currentUser.id);
  };

  const handleCollect = () => {
    if (!aid) return;
    const isCollected = toggleCollect(aid.id, currentUser.id);
    Taro.showToast({
      title: isCollected ? '收藏成功' : '已取消收藏',
      icon: 'success',
    });
  };

  const handleSendComment = () => {
    if (!aid) return;
    if (!commentText.trim()) {
      Taro.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }
    const ok = addComment(aid.id, {
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentText.trim(),
    });
    if (ok) {
      setCommentText('');
      Taro.showToast({ title: '评论成功', icon: 'success' });
    }
  };

  const handleContact = () => {
    if (aid?.contact) {
      Taro.setClipboardData({
        data: aid.contact,
        success: () => {
          Taro.showToast({ title: '联系方式已复制', icon: 'success' });
        },
      });
    }
  };

  if (!aid) {
    return (
      <View className="pageContainer">
        <View className="emptyState">
          <Text className="emptyIcon">❓</Text>
          <Text className="emptyText">求助不存在或已删除</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.detailCard}>
        <View className={styles.header}>
          <View style={{ flex: 1 }}>
            <View className={styles.titleRow}>
              <Text className={classnames('tag', getTagClass(), styles.typeTag)}>
                {getTypeLabel()}
              </Text>
              <Text className={styles.title}>{aid.title}</Text>
            </View>
          </View>
          <Text className={classnames(styles.statusBadge, getStatusClass())}>
            {getStatusLabel()}
          </Text>
        </View>

        <View className={styles.metaList}>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📍</Text>
            <Text className={styles.metaLabel}>地点</Text>
            <Text className={styles.metaValue}>{aid.location}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>⏰</Text>
            <Text className={styles.metaLabel}>有效期至</Text>
            <Text className={styles.metaValue}>{formatDateTime(aid.validUntil)}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📞</Text>
            <Text className={styles.metaLabel}>联系方式</Text>
            <Text
              className={classnames(styles.metaValue, { [styles.interactionActive]: true })}
              onClick={handleContact}
            >
              {aid.contact}（点击复制）
            </Text>
          </View>
          {aid.claimantName && (
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🤝</Text>
              <Text className={styles.metaLabel}>认领人</Text>
              <Text className={styles.metaValue}>{aid.claimantName}</Text>
            </View>
          )}
        </View>

        <Text className={styles.description}>{aid.description}</Text>

        <View className={styles.interactionBar}>
          <View
            className={classnames(styles.interactionItem, aid.isLiked && styles.interactionActive)}
            onClick={handleLike}
          >
            <Text className={styles.interactionIcon}>{aid.isLiked ? '❤️' : '🤍'}</Text>
            <Text className={styles.interactionText}>{aid.likes} 点赞</Text>
          </View>
          <View className={styles.interactionItem}>
            <Text className={styles.interactionIcon}>💬</Text>
            <Text className={styles.interactionText}>{aid.comments.length} 评论</Text>
          </View>
          <View
            className={classnames(styles.interactionItem, aid.isCollected && styles.interactionActive)}
            onClick={handleCollect}
          >
            <Text className={styles.interactionIcon}>{aid.isCollected ? '⭐' : '☆'}</Text>
            <Text className={styles.interactionText}>收藏</Text>
          </View>
        </View>

        <View className={styles.actionRow}>
          {aid.status === 'open' && aid.publisherId !== currentUser.id && (
            <Text className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleClaim}>
              我来帮忙
            </Text>
          )}
          {aid.status === 'claimed' && aid.claimantId === currentUser.id && (
            <Text className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleComplete}>
              确认完成
            </Text>
          )}
          {aid.publisherId === currentUser.id && (
            <Text className={classnames(styles.actionBtn, styles.btnOutline)}>
              编辑求助
            </Text>
          )}
          <Text className={classnames(styles.actionBtn, styles.btnSecondary)} onClick={handleContact}>
            复制联系方式
          </Text>
        </View>

        <View className={styles.publisher}>
          <Image className={styles.avatar} src={aid.publisherAvatar} mode="aspectFill" />
          <View className={styles.publisherInfo}>
            <Text className={styles.publisherName}>{aid.publisherName}</Text>
            <Text className={styles.publishTime}>发布于 {formatRelativeTime(aid.createdAt)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.commentsSection}>
        <Text className={styles.sectionTitle}>
          评论 ({aid.comments.length})
        </Text>
        {aid.comments.length > 0 ? (
          aid.comments.map((comment) => (
            <View key={comment.id} className={styles.commentItem}>
              <Image
                className={styles.commentAvatar}
                src={comment.userAvatar}
                mode="aspectFill"
              />
              <View className={styles.commentContent}>
                <View className={styles.commentHeader}>
                  <Text className={styles.commentName}>{comment.userName}</Text>
                  <Text className={styles.commentTime}>{formatRelativeTime(comment.createdAt)}</Text>
                </View>
                <Text className={styles.commentText}>{comment.content}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="emptyState" style={{ padding: '60rpx 0' }}>
            <Text className="emptyIcon">💬</Text>
            <Text className="emptyText">暂无评论，快来抢沙发吧</Text>
          </View>
        )}

        <View className={styles.commentInputRow}>
          <Input
            className={styles.commentInput}
            placeholder="发表评论..."
            value={commentText}
            onInput={(e) => setCommentText(e.detail.value)}
            confirmType="send"
            onConfirm={handleSendComment}
          />
          <Text className={styles.sendBtn} onClick={handleSendComment}>
            发送
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AidDetailPage;
