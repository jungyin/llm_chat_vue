<template>
  <div class="sidebar">
    <div class="main-menu" :style="{ width: isCollapsed ? '8%' : '24%' }">
      <!-- 主菜单 -->
      <div v-for="(item, index) in mainMenuItems" :key="index" @click="toggleSubMenu(index)">
        {{ item.title }}
        <span v-if="item.children">{{ isCollapsed ? '' : (isSubMenuOpen[index] ? '▲' : '▼') }}</span>
      </div>
      
      <!-- 收起/展开按钮 -->
      <button @click="isCollapsed = !isCollapsed">{{ isCollapsed ? '展开' : '收起' }}</button>
    </div>

    <div class="sub-menu" v-if="!isCollapsed && currentSubMenuIndex !== null" :style="{ width: '16.666%' }">
      <!-- 二级菜单 -->
      <ul v-if="currentSubMenuIndex === 0">
        <li v-for="(chat, idx) in chatRecords" :key="idx" 
            :class="{'selected': selectedChatId === chat.id}" 
            @click="selectChat(chat.id)">
          <p>{{ truncateText(chat.title) }}</p>
        </li>
      </ul>
      <!-- 设置页面占位符 -->
      <div v-else-if="currentSubMenuIndex === 1" style="background-color: #f3f3f3; height: 100%;">
        设置页面
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {

  name: 'sidebar',
  setup() {
    const isCollapsed = ref(false);
    const isSubMenuOpen = ref([true, false]);
    const currentSubMenuIndex = ref(null);
    const selectedChatId = ref(null);
    const chatRecords = ref([
      { id: 1, title: '这是一条很长的历史聊天记录标题一' },
      { id: 2, title: '历史聊天记录标题二' },
      { id: 3, title: '这是另一条更长的历史聊天记录标题三，需要截断显示...' },
    ]);

    const mainMenuItems = [
      { title: '历史聊天记录', children: true },
      { title: '设置', children: false },
    ];

    function toggleSubMenu(index) {
      if (index === currentSubMenuIndex.value) {
        currentSubMenuIndex.value = null;
      } else {
        currentSubMenuIndex.value = index;
        isSubMenuOpen.value.fill(false);
        isSubMenuOpen.value[index] = true;
      }
    }

    function truncateText(text) {
      if (text.split(' ').length > 3) {
        return text.split(' ').slice(0, 3).join(' ') + '...';
      }
      return text;
    }

    function selectChat(id) {
      selectedChatId.value = id;
      console.log(`Selected Chat ID: ${id}`); // 自定义方法
    }

    return {
      isCollapsed,
      isSubMenuOpen,
      currentSubMenuIndex,
      mainMenuItems,
      chatRecords,
      selectedChatId,
      toggleSubMenu,
      truncateText,
      selectChat,
    };
  },
};
</script>

<style scoped>
.sidebar {
  display: flex;
  height: 100vh;
}

.main-menu, .sub-menu {
  transition: width 0.3s ease;
  background-color: #f3f3f3;
  overflow: hidden;
  box-sizing: border-box;
}

.main-menu div, .main-menu button {
  padding: 10px;
  cursor: pointer;
}

.sub-menu ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sub-menu li {
  padding: 10px;
  cursor: pointer;
}

.selected {
  background-color: #8469FF;
  color: white;
}
</style>