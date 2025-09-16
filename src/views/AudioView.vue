<!--
 * @Author: shawicx d35f3153@proton.me
 * @Description: 音频视图
-->
<script setup>
import AudioRecorder from './components/audio/AudioRecorder.vue';
</script>

<template>
  <Tabs value="0">
    <TabList>
      <Tab value="0">录音转文字</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <AudioRecorder />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style scoped>

</style>

