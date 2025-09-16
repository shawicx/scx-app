use std::path::PathBuf;
use tauri::{command, AppHandle, Manager, Runtime, State};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::cell::RefCell;

// 录音状态
struct RecordingState {
    stream: Option<cpal::Stream>,
    samples: Vec<f32>,
}

// 替换全局静态变量为线程本地存储
thread_local! {
    static RECORDING_STATE: RefCell<RecordingState> = RefCell::new(RecordingState {
        stream: None,
        samples: Vec::new(),
    });
}

// 检查录音和语音识别能力
#[command]
pub fn check_capabilities() -> bool {
    // 检查是否有录音设备
    let host = cpal::default_host();
    let input_device = host.default_input_device();
    
    // 简单检查是否有输入设备
    input_device.is_some()
}

// 请求录音权限
#[command]
pub fn request_permission() -> Result<bool, String> {
    // 在桌面应用中，通常不需要显式请求权限
    // 但我们可以检查是否能访问麦克风
    let host = cpal::default_host();
    match host.default_input_device() {
        Some(_) => Ok(true),
        None => Err("没有找到录音设备".into()),
    }
}

// 开始录音
#[command]
pub fn start_recording() -> Result<String, String> {
    RECORDING_STATE.with(|state| {
        let mut state = state.borrow_mut();
        state.samples.clear();
    });
    
    // 获取默认输入设备
    let host = cpal::default_host();
    let device = host.default_input_device()
        .ok_or_else(|| "没有找到录音设备".to_string())?;
    
    // 获取支持的配置
    let config = device.default_input_config()
        .map_err(|e| format!("获取输入配置失败: {}", e))?;
    
    // 创建录音流
    let err_fn = |err| eprintln!("录音错误: {}", err);
    
    let stream = device.build_input_stream(
        &config.into(),
        move |data: &[f32], _: &cpal::InputCallbackInfo| {
            // 将录音数据添加到samples中
            let mut state = RECORDING_STATE.with(|state| state.borrow_mut());
            state.samples.extend_from_slice(data);
        },
        err_fn,
        Some(std::time::Duration::from_secs(3000))
    ).map_err(|e| format!("创建录音流失败: {}", e))?;
    
    // 开始录音
    stream.play().map_err(|e| format!("开始录音失败: {}", e))?;
    
    // 保存流
    let mut state = RECORDING_STATE.with(|state| state.borrow_mut());
    state.stream = Some(stream);
    
    // 返回临时文件路径
    Ok("recording_in_progress".to_string())
}

// 停止录音
#[command]
pub fn stop_recording(app_handle: AppHandle, path: String) -> Result<String, String> {
    let samples = RECORDING_STATE.with(|state| {
        let mut state = state.borrow_mut();
        let samples = std::mem::take(&mut state.samples);
        state.stream = None;
        samples
    });
    
    // 获取应用临时目录
let app_dir = app_handle.path().app_data_dir()
.unwrap_or_else(|e| {
    eprintln!("获取应用数据目录失败: {}", e);
    std::env::current_dir().expect("无法获取当前工作目录")
});
    
    // 创建临时文件路径
    let file_path = app_dir.join("recording.wav");
    
    // 将录音数据写入WAV文件
    write_wav_file(&file_path, &samples)
        .map_err(|e| format!("保存录音文件失败: {}", e))?;
    
    Ok(file_path.to_string_lossy().into_owned())
}

// 转写音频 - 使用在线服务
#[command]
pub fn transcribe_audio(path: String) -> Result<String, String> {
    // 这里我们模拟一个简单的转写结果
    // 在实际应用中，你可以使用在线API服务如百度语音识别、讯飞等
    
    // 模拟延迟
    std::thread::sleep(std::time::Duration::from_secs(1));
    
    // 返回模拟结果
    Ok("这是一个语音识别的模拟结果。在实际应用中，你需要集成真实的语音识别服务。".to_string())
}

// 辅助函数：将录音数据写入WAV文件
fn write_wav_file(path: &PathBuf, samples: &[f32]) -> Result<(), String> {
    let spec = hound::WavSpec {
        channels: 1,
        sample_rate: 16000,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };
    
    let mut writer = hound::WavWriter::create(path, spec)
        .map_err(|e| format!("创建WAV文件失败: {}", e))?;
    
    for &sample in samples {
        // 将f32转换为i16
        let amplitude = (sample * i16::MAX as f32) as i16;
        writer.write_sample(amplitude)
            .map_err(|e| format!("写入WAV样本失败: {}", e))?;
    }
    
    writer.finalize().map_err(|e| format!("完成WAV文件失败: {}", e))?;
    
    Ok(())
} 