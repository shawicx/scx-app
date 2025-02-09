<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';

// 数据源URL
const SourceUrl = 'https://geo.datav.aliyun.com/areas_v3/bound';

// 各级别的映射
const LevelMap = {
  Province: 'province',
  City: 'city',
  County: 'county',
}

const toast = useToast();
const activeTab = ref(LevelMap.Province); // 当前激活的标签
const provinces = ref([]); // 省份数据
const cities = ref([]); // 城市数据
const counties = ref([]); // 区县数据
const selectedProvince = ref({ code: null, name: null }); // 选中的省份
const selectedCity = ref({ code: null, name: null }); // 选中的城市
const loading = ref(true); // 加载状态

// 下载所有当前等级数据
const downloadAllCurrentLevelData = async () => {
  let url, filename;
  try {
    if (activeTab.value === LevelMap.City) {
      const response = await axios.get(`${SourceUrl}/${selectedProvince.value.code}_full.json`);
      url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data)], { type: 'application/json' }));
      filename = `${selectedProvince.value.name}_所有城市边界数据.json`;
    } else if (activeTab.value === LevelMap.County) {
      const response = await axios.get(`${SourceUrl}/${selectedCity.value.code}_full.json`);
      url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data)], { type: 'application/json' }));
      filename = `${selectedCity.value.name}_所有区县边界数据.json`;
    } else if (activeTab.value === LevelMap.Province) {
      const response = await axios.get(`${SourceUrl}/100000_full.json`);
      url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data)], { type: 'application/json' }));
      filename = `中国_所有省份边界数据.json`;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.add({ severity: 'success', summary: '成功', detail: `${filename}下载成功`, life: 3000 });
  } catch (error) {
    console.error('Download all current level data error:', error);
    toast.add({ severity: 'error', summary: '错误', detail: '下载数据失败', life: 3000 });
  }
};

// 加载省份数据
const loadProvinces = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${SourceUrl}/100000_full.json`);
    if (!response.data || !response.data.features) {
      throw new Error('Invalid data structure');
    }
    provinces.value = response.data.features
      .filter(feature => {
        if (!feature || !feature.properties || !feature.properties.adcode) return false;
        const adcode = String(feature.properties.adcode);
        return !adcode.includes('_JD');
      })
      .map(feature => ({
        name: feature.properties.name || `区域${feature.properties.adcode}`,
        code: feature.properties.adcode,
        level: LevelMap.Province
      }));
  } catch (error) {
    console.error('Load provinces error:', error);
    toast.add({ severity: 'error', summary: '错误', detail: '加载省份数据失败', life: 3000 });
  } finally {
    loading.value = false;
  }
};

/**
 * @description 选择省份并加载对应的城市数据
 * @param {Object} province - 省份对象
 */
const selectProvince = async (province) => {
  selectedProvince.value = { code: province.code, name: province.name }; // 存储省份的code和name
  cities.value = [];
  counties.value = [];
  await handleProvinceChange();
  activeTab.value = LevelMap.City; // 切换到城市标签
};

/**
 * @description 选择城市并加载对应的区县数据
 * @param {Object} city - 城市对象
 */
const selectCity = async (city) => {
  selectedCity.value = { code: city.code, name: city.name }; // 存储城市的code和name
  counties.value = [];
  await handleCityChange();
  activeTab.value = LevelMap.County; // 切换到区县标签
};

// 加载城市数据
const handleProvinceChange = async () => {
  selectedCity.value = null;
  counties.value = [];
  if (!selectedProvince.value.code) return;

  try {
    const response = await axios.get(`${SourceUrl}/${selectedProvince.value.code}_full.json`);
    if (!response.data || !response.data.features) {
      throw new Error('Invalid data structure');
    }
    cities.value = response.data.features
      .filter(feature => {
        if (!feature.properties || !feature.properties.adcode) return false;
        const adcode = String(feature.properties.adcode);
        return !adcode.includes('_JD');
      })
      .map(feature => ({
        name: feature.properties.name || `区域${feature.properties.adcode}`,
        code: feature.properties.adcode,
        level: LevelMap.City
      }));
  } catch (error) {
    console.error('Load cities error:', error);
    toast.add({ severity: 'error', summary: '错误', detail: '加载城市数据失败', life: 3000 });
  }
};

// 加载区县数据
const handleCityChange = async () => {
  if (!selectedCity.value.code) return;

  try {
    const response = await axios.get(`${SourceUrl}/${selectedCity.value.code}_full.json`);
    if (!response.data || !response.data.features) {
      throw new Error('Invalid data structure');
    }
    counties.value = response.data.features
      .filter(feature => {
        if (!feature.properties || !feature.properties.adcode) return false;
        const adcode = String(feature.properties.adcode);
        return !adcode.includes('_JD');
      })
      .map(feature => ({
        name: feature.properties.name || `区域${feature.properties.adcode}`,
        code: feature.properties.adcode,
        level: LevelMap.County
      }));
  } catch (error) {
    console.error('Load counties error:', error);
    toast.add({ severity: 'error', summary: '错误', detail: '加载区县数据失败', life: 3000 });
  }
};

// 下载区域数据
const downloadRegionData = async (region) => {
  try {
    const response = await axios.get(`${SourceUrl}/${region.code}.json`);
    const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${region.name}_boundary.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.add({ severity: 'success', summary: '成功', detail: `${region.name}边界数据下载成功`, life: 3000 });
  } catch (error) {
    console.error('Download region data error:', error);
    toast.add({ severity: 'error', summary: '错误', detail: '下载边界数据失败', life: 3000 });
  }
};

// 面包屑返回
const onBreadClick = (level) => {
  if (level === LevelMap.Province) {
    selectedCity.value = null;
    selectedProvince.value = null;
    activeTab.value = LevelMap.Province;
  }
  if (level === LevelMap.City) {
    selectedCity.value = null;
    activeTab.value = LevelMap.City;
  }
}

// 组件挂载时加载省份数据
onMounted(() => {
  loadProvinces();
});
</script>

<template>
  <div class="china-regions">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span @click="onBreadClick(LevelMap.Province)">中国</span>
      <span @click="onBreadClick(LevelMap.City)" v-if="!!selectedProvince?.code"> > {{ selectedProvince.name }}</span>
      <span v-if="!!selectedCity?.code"> > {{ selectedCity.name }}</span>
    </div>
    <!-- 全局下载按钮 -->
    <Button @click="downloadAllCurrentLevelData">下载所有数据</Button>
    <div v-if="activeTab === LevelMap.Province" class="region-list">
      <div v-for="province in provinces" :key="province.code" class="region-card" @click="selectProvince(province)">
        <div class="region-name">{{ province.name }}</div>
        <Button @click.stop="downloadRegionData(province)">下载数据</Button>
      </div>
    </div>
    <div v-if="activeTab === LevelMap.City" class="region-list">
      <div v-for="city in cities" :key="city.code" class="region-card" @click="selectCity(city)">
        <div class="region-name">{{ city.name }}</div>
        <Button @click.stop="downloadRegionData(city)">下载数据</Button>
      </div>
    </div>
    <div v-if="activeTab === LevelMap.County" class="region-list">
      <div v-for="county in counties" :key="county.code" class="region-card">
        <div class="region-name">{{ county.name }}</div>
        <Button @click.stop="downloadRegionData(county)">下载数据</Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.china-regions {
  width: 100%;

  .region-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  // 区域卡片样式
  .region-card {
    display: grid;
    grid-template-columns: 12rem 1fr;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 0.5rem;
    background: #fff;
    border: 1px solid #ebeef5;
    padding: 1rem;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #409eff;
    }
  }

  // 区域名称样式
  .region-name {
    text-align: left;
    font-size: 1rem;
    color: #303133;
  }

  // PrimeVue组件样式覆盖
  :deep {
    .p-dataview-grid {
      margin: 0 -0.5rem;
    }

    .p-card-content {
      padding: 0;
    }
  }

  // 加载状态样式
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;

    .loading-text {
      margin-top: 1rem;
      color: #606266;
      font-size: 0.9rem;
    }
  }
}

// 面包屑导航样式优化
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #606266;

  span {
    cursor: pointer;
    transition: color 0.3s ease;
    margin-left: 0.5rem;

    &:hover {
      color: #409eff;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .china-regions {
    .region-name {
      font-size: 0.9rem;
    }
  }
}
</style>
