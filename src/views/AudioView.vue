<!--
 * @Author: shawicx d35f3153@proton.me
 * @Description: 音频视图
-->
<script setup>
import { ref } from 'vue';
import AudioRecorder from "./components/audio/AudioRecorder.vue";

const activeTab = ref('record');
</script>

<template>
  <div>
    <v-tabs v-model="activeTab">
      <v-tab value="record">录音转文字</v-tab>
    </v-tabs>
    <v-window v-model="activeTab">
      <v-window-item value="record">
        <AudioRecorder />
      </v-window-item>
    </v-window>
  </div>
</template>
