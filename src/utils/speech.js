/*
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-02 09:44:10
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-03-02 13:27:32
 * @Description: 语音识别
 */

// 录音状态类型
// export type RecordingStatus = 'inactive' | 'recording' | 'paused' | 'transcribing';

// 录音错误类型
// export type RecordingError = {
//   type: 'permission_denied' | 'not_supported' | 'initialization_error' | 'recording_error' | 'transcription_error' | 'timeout_error';
//   message: string;
// };

// 为SpeechRecognition添加类型声明
// interface SpeechRecognitionStatic {
//   new(): SpeechRecognition;
//   prototype: SpeechRecognition;
// }

// interface SpeechRecognition extends EventTarget {
//   lang: string;
//   interimResults: boolean;
//   maxAlternatives: number;
//   start(): void;
//   stop(): void;
//   onresult: (event: SpeechRecognitionEvent) => void;
//   onerror: (event: SpeechRecognitionErrorEvent) => void;
// }

// declare global {
//   interface Window {
//     SpeechRecognition?: SpeechRecognitionStatic;
//     webkitSpeechRecognition?: SpeechRecognitionStatic;
//   }
// }

// 配置类型
export const RecorderConfig = {
  maxRecordingDuration: 30, // 最大录音时长（秒）
  maxTranscriptionTime: 60, // 最大转换时间（秒）
  maxRetries: 3, // 最大重试次数
};

// 默认配置
export const DEFAULT_RECORDER_CONFIG = {
  maxRecordingDuration: 30, // 默认最大录音时长为30秒
  maxTranscriptionTime: 60, // 默认最大转换时间为60秒
  maxRetries: 3, // 默认最大重试次数为3次
};

// 请求录音权限
export const requestRecordingPermission = async () => {
  try {
    // 检查浏览器是否支持MediaRecorder API
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      return {
        success: false,
        error: {
          type: 'not_supported',
          message: '您的浏览器不支持录音功能'
        }
      };
    }

    // 请求麦克风权限
    await navigator.mediaDevices.getUserMedia({ audio: true });
    
    return { success: true };
  } catch (error) {
    console.error('录音权限请求失败:', error);
    
    // 处理不同类型的错误
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        return {
          success: false,
          error: {
            type: 'permission_denied',
            message: '麦克风访问权限被拒绝'
          }
        };
      }
    }
    
    return {
      success: false,
      error: {
        type: 'initialization_error',
        message: '初始化录音设备时出错'
      }
    };
  }
};

// 检查浏览器是否支持语音识别
export const isSpeechRecognitionSupported = () => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// 语音识别结果类型
// export type TranscriptionResult = {
//   success: boolean;
//   text?: string;
//   error?: RecordingError;
// };

// 语音识别事件类型
// interface SpeechRecognitionEvent {
//   results: {
//     [index: number]: {
//       [index: number]: {
//         transcript: string;
//         confidence: number;
//       };
//     };
//   };
// }

// 语音识别错误事件类型
// interface SpeechRecognitionErrorEvent {
//   error: string;
// }

// 将音频转换为文字
export const transcribeAudio = async (
  audioBlob, 
  config = DEFAULT_RECORDER_CONFIG,
  retryCount = 0
) => {
  console.log('transcribeAudio', isSpeechRecognitionSupported());
  // 检查浏览器是否支持语音识别
  if (!isSpeechRecognitionSupported()) {
    return {
      success: false,
      error: {
        type: 'not_supported',
        message: '您的浏览器不支持语音识别功能'
      }
    };
  }

  try {
    // 使用服务器端语音识别API（这里使用模拟实现）
    // 在实际应用中，您可能需要将音频发送到服务器进行处理
    // 或使用第三方API如Google Speech-to-Text或Azure Speech Services
    
    // 这里我们使用浏览器内置的语音识别API
    return new Promise((resolve) => {
      // 创建一个临时的audio元素来播放录音
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      // 创建语音识别对象
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        resolve({
          success: false,
          error: {
            type: 'not_supported',
            message: '您的浏览器不支持语音识别功能'
          }
        });
        return;
      }
      
      const recognition = new SpeechRecognition();
      
      // 配置语音识别
      recognition.lang = 'zh-CN'; // 设置语言为中文
      recognition.interimResults = false; // 只返回最终结果
      recognition.maxAlternatives = 1; // 返回最可能的识别结果
      
      // 结果处理
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve({
          success: true,
          text: transcript
        });
      };
      
      // 错误处理
      recognition.onerror = (event) => {
        console.log('recognition.onerror', event);
        resolve({
          success: false,
          error: {
            type: 'transcription_error',
            message: `语音识别错误: ${event.error}`
          }
        });
      };
      
      // 开始识别
      recognition.start();
      
      // 播放录音
      audio.play();
      
      // 设置转换超时
      const maxTranscriptionTime = (config?.maxTranscriptionTime ?? DEFAULT_RECORDER_CONFIG.maxTranscriptionTime) * 1000;
      const timeoutId = setTimeout(() => {
        recognition.stop();
        
        // 如果还有重试次数，则重试
        const maxRetries = config?.maxRetries ?? DEFAULT_RECORDER_CONFIG.maxRetries;
        if (retryCount < maxRetries) {
          console.log(`语音识别超时，正在重试 (${retryCount + 1}/${maxRetries})...`);
          resolve(transcribeAudio(audioBlob, config, retryCount + 1));
        } else {
          resolve({
            success: false,
            error: {
              type: 'timeout_error',
              message: `语音识别超时，已重试${maxRetries}次`
            }
          });
        }
      }, maxTranscriptionTime);
      
      // 录音播放结束后停止识别
      audio.onended = () => {
        clearTimeout(timeoutId);
        recognition.stop();
        // 如果没有识别结果，返回错误
        setTimeout(() => {
          resolve({
            success: false,
            error: {
              type: 'transcription_error',
              message: '无法识别语音内容'
            }
          });
        }, 1000);
      };
    });
  } catch (error) {
    console.error('语音识别失败:', error);
    return {
      success: false,
      error: {
        type: 'transcription_error',
        message: '语音识别过程中出错'
      }
    };
  }
};

// 录音类，用于管理录音状态和操作
export class AudioRecorder {
  mediaRecorder = null;
  audioChunks = [];
  stream = null;
  status = 'inactive';
  recordingTimer = null;
  config = DEFAULT_RECORDER_CONFIG;
  
  constructor(config = DEFAULT_RECORDER_CONFIG) {
    this.config = { ...DEFAULT_RECORDER_CONFIG, ...config };
  }
  
  // 获取当前录音状态
  getStatus() {
    return this.status;
  }
  
  // 初始化录音器
  async initialize() {
    try {
      // 检查浏览器是否支持MediaRecorder API
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        return {
          success: false,
          error: {
            type: 'not_supported',
            message: '您的浏览器不支持录音功能'
          }
        };
      }
      
      // 获取麦克风流
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      // 设置数据可用时的处理函数
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      return { success: true };
    } catch (error) {
      console.error('初始化录音器失败:', error);
      
      // 处理不同类型的错误
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          return {
            success: false,
            error: {
              type: 'permission_denied',
              message: '麦克风访问权限被拒绝'
            }
          };
        }
      }
      
      return {
        success: false,
        error: {
          type: 'initialization_error',
          message: '初始化录音设备时出错'
        }
      };
    }
  }
  
  // 开始录音
  startRecording() {
    try {
      if (!this.mediaRecorder) {
        return {
          success: false,
          error: {
            type: 'initialization_error',
            message: '录音器未初始化'
          }
        };
      }
      
      this.audioChunks = [];
      this.mediaRecorder.start();
      this.status = 'recording';
      
      // 设置最大录音时长
      const maxDuration = this.config.maxRecordingDuration || DEFAULT_RECORDER_CONFIG.maxRecordingDuration;
      if (maxDuration) {
        this.recordingTimer = window.setTimeout(() => {
          if (this.status === 'recording') {
            this.stopRecording();
          }
        }, maxDuration * 1000);
      }
      
      return { success: true };
    } catch (error) {
      console.error('开始录音失败:', error);
      return {
        success: false,
        error: {
          type: 'recording_error',
          message: '开始录音时出错'
        }
      };
    }
  }
  
  // 停止录音并获取录音数据
  stopRecording() {
    return new Promise((resolve) => {
      try {
        // 清除录音计时器
        if (this.recordingTimer) {
          clearTimeout(this.recordingTimer);
          this.recordingTimer = null;
        }
        
        if (!this.mediaRecorder || this.status !== 'recording') {
          resolve({
            success: false,
            error: {
              type: 'recording_error',
              message: '没有正在进行的录音'
            }
          });
          return;
        }
        
        // 设置录音停止时的处理函数
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.status = 'inactive';
          resolve({ success: true, audioBlob });
        };
        
        this.mediaRecorder.stop();
      } catch (error) {
        console.error('停止录音失败:', error);
        this.status = 'inactive';
        resolve({
          success: false,
          error: {
            type: 'recording_error',
            message: '停止录音时出错'
          }
        });
      }
    });
  }
  
  // 转换录音为文字
  async transcribeRecording(audioBlob) {
    try {
      // 设置状态为转换中
      this.status = 'transcribing';
      
      // 调用转换函数
      const result = await transcribeAudio(audioBlob, this.config);
      
      // 转换完成后恢复状态
      this.status = 'inactive';
      
      return result;
    } catch (error) {
      console.error('转换录音失败:', error);
      this.status = 'inactive';
      return {
        success: false,
        error: {
          type: 'transcription_error',
          message: '转换录音时出错'
        }
      };
    }
  }
  
  // 清理资源
  cleanup() {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.status = 'inactive';
  }
} 