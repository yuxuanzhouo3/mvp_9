import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: 'encrypted' | 'decrypted';
  date: string;
  path: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    encryptedFiles: 0,
  });

  useEffect(() => {
    loadRecentFiles();
    loadStats();
  }, []);

  const loadRecentFiles = async () => {
    try {
      const files = await AsyncStorage.getItem('recentFiles');
      if (files) {
        setRecentFiles(JSON.parse(files).slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent files:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await AsyncStorage.getItem('fileStats');
      if (statsData) {
        setStats(JSON.parse(statsData));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleQuickAction = (action: 'encrypt' | 'decrypt') => {
    navigation.navigate(action === 'encrypt' ? 'Encrypt' : 'Decrypt');
  };

  const handleFilePress = (file: FileItem) => {
    navigation.navigate('FileDetail', { file });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>SecureFiles</Text>
            <Text style={styles.subtitle}>安全文件加密处理工具</Text>
          </View>
          <Icon name="security" size={40} color="#10b981" />
        </View>

        {/* 统计卡片 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="folder" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{stats.totalFiles}</Text>
            <Text style={styles.statLabel}>总文件数</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="storage" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{formatFileSize(stats.totalSize)}</Text>
            <Text style={styles.statLabel}>总大小</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="lock" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{stats.encryptedFiles}</Text>
            <Text style={styles.statLabel}>已加密</Text>
          </View>
        </View>

        {/* 快速操作 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速操作</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.encryptButton]}
              onPress={() => handleQuickAction('encrypt')}
            >
              <Icon name="lock" size={32} color="white" />
              <Text style={styles.actionText}>文件加密</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.decryptButton]}
              onPress={() => handleQuickAction('decrypt')}
            >
              <Icon name="lock-open" size={32} color="white" />
              <Text style={styles.actionText}>文件解密</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 最近文件 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近文件</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>查看全部</Text>
            </TouchableOpacity>
          </View>
          
          {recentFiles.length > 0 ? (
            <View style={styles.fileList}>
              {recentFiles.map((file) => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.fileItem}
                  onPress={() => handleFilePress(file)}
                >
                  <View style={styles.fileIcon}>
                    <Icon
                      name={file.type === 'encrypted' ? 'lock' : 'lock-open'}
                      size={24}
                      color={file.type === 'encrypted' ? '#10b981' : '#f59e0b'}
                    />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <Text style={styles.fileDetails}>
                      {formatFileSize(file.size)} • {file.date}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="folder-open" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>暂无最近文件</Text>
              <Text style={styles.emptySubtext}>开始加密或解密文件</Text>
            </View>
          )}
        </View>

        {/* 功能提示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>功能特色</Text>
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Icon name="security" size={20} color="#10b981" />
              <Text style={styles.featureText}>军用级加密算法</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="speed" size={20} color="#10b981" />
              <Text style={styles.featureText}>高速批量处理</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="cloud" size={20} color="#10b981" />
              <Text style={styles.featureText}>云端同步支持</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="fingerprint" size={20} color="#10b981" />
              <Text style={styles.featureText}>生物识别解锁</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#10b981',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encryptButton: {
    backgroundColor: '#10b981',
  },
  decryptButton: {
    backgroundColor: '#f59e0b',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  fileList: {
    gap: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  fileDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  features: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
});

export default HomeScreen; 