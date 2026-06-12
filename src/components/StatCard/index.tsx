import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  value: number | string;
  label: string;
  variant?: 'default' | 'warm' | 'success';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, variant = 'default', onClick }) => {
  return (
    <View
      className={classnames(
        styles.container,
        variant === 'warm' && styles.warm,
        variant === 'success' && styles.success
      )}
      onClick={onClick}
    >
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatCard;
