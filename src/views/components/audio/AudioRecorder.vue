<template>
  <div class="flex flex-col items-center">
    <div v-if="hasPermission === null">
      <!-- 初始状态：请求权限按钮 -->
      <Button label="获取录音权限" @click="handleRequestPermission" />
    </div>
    <div v-else-if="hasPermission">
      <!-- 有权限：显示录音按钮 -->
      <Button
        :label="isRecording ? '正在录音...' : '长按开始录音'"
        :severity="isRecording ? 'danger' : 'primary'"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        :class="{ 'p-button-animate-pulse': isRecording }"
      />
    </div>
    <div v-else>
      <!-- 无权限：重新请求权限按钮 -->
      <Button label="重新获取录音权限" @click="handleRequestPermission" />
    </div>

    <!-- 错误提示 -->
    <Message v-if="error" severity="error" class="mt-2" >{{ error.message }}</Message>

    <!-- 转写结果 -->
    <Card v-if="isTranscribing" class="mt-4 w-full">
      <template #content>
        <p class="text-gray-500">正在转写录音...</p>
      </template>
    </Card>

    <Card v-else-if="transcriptionText" class="mt-4 w-full">
      <template #title>转写结果:</template>
      <template #content>
        <p>{{ transcriptionText }}</p>
      </template>
    </Card>

    <!-- 语音识别不支持提示 -->
    <Message
      v-if="hasPermission && !supportsSpeechRecognition"
      severity="warn"
      class="mt-4"
    >您的浏览器不支持语音识别功能，无法将录音转为文字。</Message>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import { invoke } from '@tauri-apps/api/core';

interface Props {
  onRecordingComplete?: (blob: Blob) => void;
  onTranscriptionComplete?: (text: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onRecordingComplete: undefined,
  onTranscriptionComplete: undefined
});

// 状态管理
const hasPermission = ref<boolean | null>(null);
// 录音状态
const isRecording = ref(false);
// 错误
const error = ref<{ message: string } | null>(null);
// 转写状态
const isTranscribing = ref(false);
// 转写结果
const transcriptionText = ref<string | null>(null);
// 是否支持语音识别
const supportsSpeechRecognition = ref<boolean>(true); // 默认为true，因为我们使用Tauri的原生能力
// 录音文件路径
const recordingPath = ref<string | null>(null);

// 初始化
onMounted(async () => {
  try {
    // 检查是否支持录音和语音识别
    const isSupported = await invoke<boolean>('plugin:audio|check_capabilities');
    supportsSpeechRecognition.value = isSupported;
  } catch (err) {
    console.error('Failed to check audio capabilities:', err);
    supportsSpeechRecognition.value = false;
  }
});

// 请求录音权限
const handleRequestPermission = async () => {
  error.value = null;
  
  try {
    const permissionGranted = await invoke<boolean>('plugin:audio|request_permission');
    
    if (permissionGranted) {
      hasPermission.value = true;
    } else {
      error.value = { message: '用户拒绝了录音权限' };
      hasPermission.value = false;
    }
  } catch (err: any) {
    error.value = { message: `获取录音权限失败: ${err.message || err}` };
    hasPermission.value = false;
  }
};

// 开始录音（长按）
const handleStartRecording = async () => {
  if (!hasPermission.value) return;
  
  error.value = null;
  transcriptionText.value = null;
  
  try {
    // 开始录音，返回临时文件路径
    recordingPath.value = await invoke<string>('plugin:audio|start_recording');
    isRecording.value = true;
  } catch (err: any) {
    error.value = { message: `开始录音失败: ${err.message || err}` };
  }
};

// 停止录音（松开）
const handleStopRecording = async () => {
  if (!isRecording.value || !recordingPath.value) return;
  
  try {
    // 停止录音，返回录音文件的路径
    const filePath = await invoke<string>('plugin:audio|stop_recording', { 
      path: recordingPath.value 
    });
    
    isRecording.value = false;
    
    // 如果需要，可以将文件转换为Blob并传递给回调
    if (props.onRecordingComplete) {
      // 从文件路径读取二进制数据
      const audioData = await invoke<number[]>('plugin:fs|read_binary_file', { 
        path: filePath 
      });
      
      // 转换为Blob
      const audioBlob = new Blob([new Uint8Array(audioData)], { type: 'audio/wav' });
      props.onRecordingComplete(audioBlob);
    }
    
    // 如果支持语音识别，则自动开始转写
    if (supportsSpeechRecognition.value) {
      await handleTranscribe(filePath);
    }
  } catch (err: any) {
    isRecording.value = false;
    error.value = { message: `停止录音失败: ${err.message || err}` };
  }
};

// 转写录音为文字
const handleTranscribe = async (audioFilePath: string) => {
  isTranscribing.value = true;
  error.value = null;
  
  try {
    // 调用Tauri后端进行语音识别
    const text = await invoke<string>('plugin:audio|transcribe_audio', { 
      path: audioFilePath 
    });
    
    isTranscribing.value = false;
    
    if (text) {
      transcriptionText.value = text;
      
      if (props.onTranscriptionComplete) {
        props.onTranscriptionComplete(text);
      }
    } else {
      error.value = { message: '转写结果为空' };
    }
  } catch (err: any) {
    isTranscribing.value = false;
    error.value = { message: `转写失败: ${err.message || err}` };
  }
};

// 长按处理
const handleMouseDown = () => {
  handleStartRecording();
};

const handleMouseUp = () => {
  handleStopRecording();
};

const handleTouchStart = () => {
  handleStartRecording();
};

const handleTouchEnd = () => {
  handleStopRecording();
};
</script>

<style scoped>
.p-button-animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style> 