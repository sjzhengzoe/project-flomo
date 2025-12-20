<template>
  <div class="auto-publish-page">
    <div class="container">
      <h1>自动化发布工具</h1>
      
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>平台配置</span>
          </div>
        </template>
        
        <el-form :model="formData" label-width="100px">
          <el-form-item label="选择平台">
            <el-radio-group v-model="formData.platform">
              <el-radio label="xiaohongshu">小红书</el-radio>
              <el-radio label="douyin">抖音</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="登录状态">
            <el-tag :type="loginStatus === 'logged_in' ? 'success' : 'info'">
              {{ loginStatusText }}
            </el-tag>
            <el-button 
              type="primary" 
              size="small" 
              style="margin-left: 10px"
              @click="handleLogin"
              :loading="loginLoading"
            >
              {{ loginStatus === 'logged_in' ? '重新登录' : '登录' }}
            </el-button>
            <el-button 
              type="info" 
              size="small" 
              style="margin-left: 10px"
              @click="checkLoginStatus"
              :loading="checkLoading"
            >
              检查状态
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="content-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>发布内容</span>
          </div>
        </template>
        
        <el-form :model="formData" label-width="100px">
          <el-form-item label="标题" required>
            <el-input 
              v-model="formData.title" 
              placeholder="请输入标题"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="内容" required>
            <el-input 
              v-model="formData.content" 
              type="textarea" 
              :rows="6"
              placeholder="请输入内容"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="图片/视频">
            <el-upload
              v-model:file-list="fileList"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              multiple
              :limit="9"
              list-type="picture-card"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">
              支持图片和视频，最多9个文件
            </div>
          </el-form-item>
          
          <el-form-item label="发布设置">
            <el-checkbox v-model="formData.autoDelay">启用随机延迟（降低风险）</el-checkbox>
            <el-checkbox v-model="formData.saveDraft">保存为草稿</el-checkbox>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="action-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>操作</span>
          </div>
        </template>
        
        <div class="action-buttons">
          <el-button 
            type="primary" 
            size="large"
            @click="handlePublish"
            :loading="publishLoading"
            :disabled="loginStatus !== 'logged_in'"
          >
            {{ formData.saveDraft ? '保存草稿' : '立即发布' }}
          </el-button>
          
          <el-button 
            type="info" 
            size="large"
            @click="handleTest"
            :loading="testLoading"
          >
            测试连接
          </el-button>
        </div>
      </el-card>

      <el-card class="log-card" shadow="hover" v-if="logs.length > 0">
        <template #header>
          <div class="card-header">
            <span>操作日志</span>
            <el-button type="text" @click="logs = []">清空</el-button>
          </div>
        </template>
        
        <div class="log-content">
          <div 
            v-for="(log, index) in logs" 
            :key="index"
            :class="['log-item', `log-${log.type}`]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';

interface LogItem {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const formData = ref({
  platform: 'xiaohongshu',
  title: '',
  content: '',
  autoDelay: true,
  saveDraft: false,
});

const fileList = ref<UploadFile[]>([]);
const loginStatus = ref<'not_logged_in' | 'logged_in' | 'checking'>('not_logged_in');
const loginLoading = ref(false);
const checkLoading = ref(false);
const publishLoading = ref(false);
const testLoading = ref(false);
const logs = ref<LogItem[]>([]);

const loginStatusText = computed(() => {
  switch (loginStatus.value) {
    case 'logged_in':
      return '已登录';
    case 'checking':
      return '检查中...';
    default:
      return '未登录';
  }
});

const addLog = (message: string, type: LogItem['type'] = 'info') => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type,
  });
};

const handleFileChange = (file: UploadFile) => {
  addLog(`添加文件: ${file.name}`, 'info');
};

const handleFileRemove = (file: UploadFile) => {
  addLog(`移除文件: ${file.name}`, 'info');
};

const checkLoginStatus = async () => {
  checkLoading.value = true;
  addLog('检查登录状态...', 'info');
  
  try {
    const response = await fetch('http://localhost:3000/api/check-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: formData.value.platform,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      loginStatus.value = data.loggedIn ? 'logged_in' : 'not_logged_in';
      addLog(data.loggedIn ? '已登录' : '未登录', data.loggedIn ? 'success' : 'warning');
    } else {
      addLog(`检查失败: ${data.message}`, 'error');
    }
  } catch (error: any) {
    addLog(`检查失败: ${error.message}`, 'error');
    ElMessage.error('检查登录状态失败');
  } finally {
    checkLoading.value = false;
  }
};

const handleLogin = async () => {
  loginLoading.value = true;
  addLog('开始登录流程...', 'info');
  
  try {
    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分钟超时
    
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: formData.value.platform,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      addLog('登录成功，Cookie已保存', 'success');
      loginStatus.value = 'logged_in';
      ElMessage.success('登录成功');
    } else {
      addLog(`登录失败: ${data.message}`, 'error');
      ElMessage.error(data.message || '登录失败');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      addLog('登录超时（5分钟），请重试', 'error');
      ElMessage.error('登录超时，请重试');
    } else if (error.message.includes('fetch')) {
      addLog('无法连接到后端服务', 'error');
      ElMessage.error('无法连接到后端服务，请确保后端服务已启动（cd server && npm start）');
    } else {
      addLog(`登录失败: ${error.message}`, 'error');
      ElMessage.error(error.message || '登录失败，请重试');
    }
  } finally {
    loginLoading.value = false;
  }
};

const handleTest = async () => {
  testLoading.value = true;
  addLog('测试后端连接...', 'info');
  
  try {
    const response = await fetch('http://localhost:3000/api/test', {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (data.success) {
      addLog('后端服务连接正常', 'success');
      ElMessage.success('连接成功');
    } else {
      addLog('后端服务异常', 'error');
      ElMessage.error('连接失败');
    }
  } catch (error: any) {
    addLog(`连接失败: ${error.message}`, 'error');
    ElMessage.error('无法连接到后端服务，请确保服务已启动');
  } finally {
    testLoading.value = false;
  }
};

const handlePublish = async () => {
  if (!formData.value.title || !formData.value.content) {
    ElMessage.warning('请填写标题和内容');
    return;
  }
  
  if (loginStatus.value !== 'logged_in') {
    ElMessage.warning('请先登录');
    return;
  }
  
  publishLoading.value = true;
  addLog('开始发布流程...', 'info');
  
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('platform', formData.value.platform);
    formDataToSend.append('title', formData.value.title);
    formDataToSend.append('content', formData.value.content);
    formDataToSend.append('autoDelay', String(formData.value.autoDelay));
    formDataToSend.append('saveDraft', String(formData.value.saveDraft));
    
    fileList.value.forEach((file) => {
      if (file.raw) {
        formDataToSend.append('files', file.raw);
      }
    });
    
    const response = await fetch('http://localhost:3000/api/publish', {
      method: 'POST',
      body: formDataToSend,
    });
    
    const data = await response.json();
    
    if (data.success) {
      addLog('发布成功！', 'success');
      ElMessage.success('发布成功');
      
      // 清空表单
      formData.value.title = '';
      formData.value.content = '';
      fileList.value = [];
    } else {
      addLog(`发布失败: ${data.message}`, 'error');
      ElMessage.error(data.message || '发布失败');
    }
  } catch (error: any) {
    addLog(`发布失败: ${error.message}`, 'error');
    ElMessage.error('发布失败，请检查网络连接');
  } finally {
    publishLoading.value = false;
  }
};
</script>

<style lang="less" scoped>
.auto-publish-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  
  .container {
    max-width: 900px;
    margin: 0 auto;
    
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 30px;
      font-size: 32px;
      font-weight: bold;
    }
    
    .config-card,
    .content-card,
    .action-card,
    .log-card {
      margin-bottom: 20px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
      }
    }
    
    .upload-tip {
      font-size: 12px;
      color: #999;
      margin-top: 10px;
    }
    
    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    
    .log-content {
      max-height: 300px;
      overflow-y: auto;
      
      .log-item {
        padding: 8px 0;
        border-bottom: 1px solid #eee;
        display: flex;
        gap: 15px;
        
        .log-time {
          color: #999;
          font-size: 12px;
          min-width: 80px;
        }
        
        .log-message {
          flex: 1;
        }
        
        &.log-success .log-message {
          color: #67c23a;
        }
        
        &.log-error .log-message {
          color: #f56c6c;
        }
        
        &.log-warning .log-message {
          color: #e6a23c;
        }
        
        &.log-info .log-message {
          color: #409eff;
        }
      }
    }
  }
}
</style>

