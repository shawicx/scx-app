<script setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

const results = ref({
  chineseName: "",
  englishName: "",
  phone: "",
  idCard: "",
  randomString: "",
  password: "",
  date: "",
});

const stringLength = ref("8");

async function generateChineseName() {
  results.value.chineseName = await invoke("generate_chinese_name");
}

async function generateEnglishName() {
  results.value.englishName = await invoke("generate_english_name");
}

async function generatePhone() {
  results.value.phone = await invoke("generate_phone_number");
}

async function generateIdCard() {
  const result = await invoke("generate_id_card");
  console.log(result, "generateIdCard result");
  results.value.idCard = result;
}

async function generateRandomString() {
  results.value.randomString = await invoke("generate_string", {
    length: parseInt(stringLength.value),
  });
}

async function generateStrongPassword() {
  results.value.password = await invoke("generate_strong_password");
}

async function generateDate(withTime) {
  const format = withTime ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD";
  results.value.date = await invoke("generate_date", { format });
}
</script>

<template>
  <div class="random-data">
    <div class="generator-group">
      <h3>姓名生成</h3>
      <div class="generator-item">
        <span class="label">中文姓名：</span>
        <v-text-field v-model="results.chineseName" readonly variant="outlined" density="compact" hide-details />
        <v-btn @click="generateChineseName">生成</v-btn>
      </div>
      <div class="generator-item">
        <span class="label">英文姓名：</span>
        <v-text-field v-model="results.englishName" readonly variant="outlined" density="compact" hide-details />
        <v-btn @click="generateEnglishName">生成</v-btn>
      </div>
    </div>

    <div class="generator-group">
      <h3>证件号码</h3>
      <div class="generator-item">
        <span class="label">手机号：</span>
        <v-text-field v-model="results.phone" readonly variant="outlined" density="compact" hide-details />
        <v-btn @click="generatePhone">生成</v-btn>
      </div>
      <div class="generator-item">
        <span class="label">身份证：</span>
        <v-text-field v-model="results.idCard" readonly variant="outlined" density="compact" hide-details />
        <v-btn @click="generateIdCard">生成</v-btn>
      </div>
    </div>

    <div class="generator-group">
      <h3>随机字符串</h3>
      <div class="generator-item">
        <span class="label">长度：</span>
        <v-select
          v-model="stringLength"
          :items="['8', '16', '32']"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 8rem"
        />
        <v-text-field v-model="results.randomString" readonly variant="outlined" density="compact" hide-details />
        <v-btn @click="generateRandomString">生成</v-btn>
      </div>
      <div class="generator-item">
        <span class="label">强密码：</span>
        <v-text-field v-model="results.password" readonly variant="outlined" density="compact" hide-details />
        <v-btn @click="generateStrongPassword">生成</v-btn>
      </div>
    </div>

    <div class="generator-group">
      <h3>日期时间</h3>
      <div class="generator-item">
        <span class="label">日期：</span>
        <v-text-field v-model="results.date" readonly variant="outlined" density="compact" hide-details />
        <v-btn class="mr-2" @click="generateDate(false)">生成日期</v-btn>
        <v-btn @click="generateDate(true)">生成日期时间</v-btn>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.random-data {
  .generator-group {
    margin-bottom: 2rem;

    h3 {
      margin-bottom: 1rem;
      color: #333;
      font-size: 1.1rem;
    }
  }

  .generator-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    gap: 0.5rem;

    .label {
      min-width: 5rem;
    }
  }
}
</style>
