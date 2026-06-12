import React, { useState } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { AidType } from '@/types';
import { useUserStore } from '@/store/useUserStore';

const TYPE_OPTIONS = [
  { value: 'borrow' as AidType, label: '借物', icon: '📦' },
  { value: 'carpool' as AidType, label: '拼车', icon: '🚗' },
  { value: 'material' as AidType, label: '资料', icon: '📚' },
  { value: 'skill' as AidType, label: '技能', icon: '💡' },
];

const PublishAidPage: React.FC = () => {
  const [formData, setFormData] = useState({
    type: 'borrow' as AidType,
    title: '',
    description: '',
    location: '',
    contact: '',
    validDays: '7',
  });

  useDidShow(() => {
    console.log('[PublishAid] Page did show');
  });

  const handleTypeChange = (type: AidType) => {
    setFormData({ ...formData, type });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!formData.description.trim()) {
      Taro.showToast({ title: '请输入详细描述', icon: 'none' });
      return;
    }
    if (!formData.location.trim()) {
      Taro.showToast({ title: '请输入地点', icon: 'none' });
      return;
    }
    if (!formData.contact.trim()) {
      Taro.showToast({ title: '请输入联系方式', icon: 'none' });
      return;
    }

    console.log('[PublishAid] Submit form:', formData);
    Taro.showModal({
      title: '发布成功',
      content: '您的求助信息已发布，等待其他同学认领',
      showCancel: false,
      success: () => {
        Taro.navigateBack();
      },
    });
  };

  const isFormValid = formData.title.trim() && formData.description.trim() &&
    formData.location.trim() && formData.contact.trim();

  return (
    <ScrollView scrollY className={`pageContainer ${styles.page}`}>
      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>选择求助类型</Text>
        <View className={styles.typeGrid}>
          {TYPE_OPTIONS.map((option) => (
            <View
              key={option.value}
              className={classnames(
                styles.typeItem,
                formData.type === option.value && styles.typeItemActive
              )}
              onClick={() => handleTypeChange(option.value)}
            >
              <Text className={styles.typeIcon}>{option.icon}</Text>
              <Text className={styles.typeLabel}>{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>填写求助信息</Text>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>标题
          </Text>
          <Input
            className={styles.input}
            placeholder="请简要描述您的求助..."
            value={formData.title}
            onInput={(e) => handleInputChange('title', e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>详细描述
          </Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述您的需求，包括物品规格、时间要求等..."
            value={formData.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className={styles.inputRow}>
          <View className={classnames(styles.formItem, styles.inputGroup)}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>地点
            </Text>
            <Input
              className={styles.input}
              placeholder="如：图书馆门口"
              value={formData.location}
              onInput={(e) => handleInputChange('location', e.detail.value)}
            />
          </View>

          <View className={classnames(styles.formItem, styles.inputGroup)}>
            <Text className={styles.label}>
              <Text className={styles.required}>*</Text>有效期（天）
            </Text>
            <Input
              className={styles.input}
              type="number"
              placeholder="7"
              value={formData.validDays}
              onInput={(e) => handleInputChange('validDays', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>联系方式
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入手机号或微信号"
            value={formData.contact}
            onInput={(e) => handleInputChange('contact', e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.footer}>
        <Text
          className={classnames(
            styles.submitBtn,
            !isFormValid && styles.submitBtnDisabled
          )}
          onClick={isFormValid ? handleSubmit : undefined}
        >
          发布求助
        </Text>
      </View>
    </ScrollView>
  );
};

export default PublishAidPage;
