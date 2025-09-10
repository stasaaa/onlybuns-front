
<template>
  <div class="chat-page">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Your Groups</h2>
        <button
          @click="openCreateGroupModal"
          class="btn btn-primary new-group-btn"
        >
          + New Group
        </button>
      </div>

      <div class="groups-list">
        <div
          v-for="group in userGroups"
          :key="group.id"
          @click="selectGroup(group)"
          :class="['group-item', { active: selectedGroup?.id === group.id }]"
        >
          <div class="group-info">
            <h3>{{ group.name }}</h3>
            <p>
              {{
                group.lastMessage
                  ? `"${group.lastMessage.content}"`
                  : "No messages yet"
              }}
            </p>
            <span v-if="group.admin?.id === currentUserId" class="admin-badge"
              >Admin</span
            >
          </div>
        </div>

        <div v-if="userGroups.length === 0" class="no-groups">
          <p>No groups yet. Create your first group!</p>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="chat-area">
      <div v-if="!selectedGroup" class="empty-state">
        <h2>Welcome to Group Chat</h2>
        <p>Select a group from the sidebar to start chatting</p>
      </div>

      <div v-else class="chat-container">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-info">
            <h2>{{ selectedGroup.name }}</h2>
           <p>{{ selectedGroup.members?.length || 0 }} members</p>

          </div>
          <div class="chat-actions">
            <button 
              @click="openManageMembersModal" 
              class="btn btn-secondary"
            >
              Manage Members
            </button>
            <button 
              @click="openAddMembersModal" 
              class="btn btn-success"
            >
              Add Members
            </button>
          </div>
        </div>

      <!-- Messages Container -->
<div ref="messagesContainer" class="messages-container">
  <div
    v-for="message in formattedMessages"
    :key="message.timestamp"
    :class="['message', message.messageType]"
  >
    <div class="message-bubble">
      <div class="message-header" v-if="message.messageType !== 'system'">
        <span class="sender">{{ message.senderUsername }}</span>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
      </div>
      <div class="message-content">{{ message.content }}</div>
    </div>
  </div>
</div>

        <!-- Message Input -->
        <div class="message-input-area">
          <div class="input-container">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="Type your message..."
              class="message-input"
              :disabled="!isConnected"
            />
            <button
              @click="sendMessage"
              :disabled="!newMessage.trim() || !isConnected"
              class="btn btn-primary send-btn"
            >
              Send
            </button>
          </div>
          <div v-if="!isConnected" class="connection-status">
            Connecting to chat...
          </div>
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
    <div
      v-if="showCreateGroupModal"
      class="modal-overlay"
      @click="closeCreateGroupModal"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Create New Group</h3>
          <button @click="closeCreateGroupModal" class="close-btn">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="groupName">Group Name</label>
            <input
              id="groupName"
              v-model="newGroupName"
              type="text"
              placeholder="Enter group name"
              class="form-input"
              @keyup.enter="createGroup"
            />
          </div>

          <div class="form-group">
            <label>Select Members to Add</label>
            <div v-if="availableUsers.length === 0" class="no-users">
              Loading users...
            </div>
            <div v-else class="users-list">
              <div
                v-for="user in availableUsers"
                :key="user.id"
                class="user-option"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="user.id"
                    v-model="selectedUserIds"
                  />
                  <span>{{ user.username }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeCreateGroupModal" class="btn btn-secondary">
            Cancel
          </button>
          <button
            @click="createGroup"
            :disabled="!canCreateGroup"
            class="btn btn-primary"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>

    <!-- Add Members Modal -->
    <div
      v-if="showAddMembersModal"
      class="modal-overlay"
      @click="closeAddMembersModal"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Add Members - {{ selectedGroup?.name }}</h3>
          <button @click="closeAddMembersModal" class="close-btn">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <div v-if="nonGroupMembers.length === 0" class="no-users">
            All users are already members of this group.
          </div>
          <div v-else class="users-list">
            <div
              v-for="user in nonGroupMembers"
              :key="user.id"
              class="user-option"
            >
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  :value="user.id"
                  v-model="selectedUsersToAdd"
                />
                <span>{{ user.username }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeAddMembersModal" class="btn btn-secondary">
            Cancel
          </button>
          <button
            @click="addSelectedMembers"
            :disabled="selectedUsersToAdd.length === 0"
            class="btn btn-primary"
          >
            Add Selected ({{ selectedUsersToAdd.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Manage Members Modal -->
    <div
      v-if="showManageMembersModal"
      class="modal-overlay"
      @click="closeManageMembersModal"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Manage Members - {{ selectedGroup?.name }}</h3>
          <button @click="closeManageMembersModal" class="close-btn">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <!-- Current Members -->
          <div class="section">
            <h4>Current Members ({{ selectedGroup?.members?.length || 0 }})</h4>
            <div class="members-list">
              <div
                v-for="member in selectedGroup?.members"
                :key="member.id"
                class="member-item"
              >
                <span class="member-info">
                  {{ member.username }}
                  <span
                    v-if="member.id === selectedGroup?.admin?.id"
                    class="admin-badge"
                    >Admin</span
                  >
                </span>
                <button
                  v-if="
                    member.id !== currentUserId &&
                    member.id !== selectedGroup?.admin?.id
                  "
                  @click="removeMember(member.id)"
                  class="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeManageMembersModal" class="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default {
  name: "ChatPage",

  data() {
    return {
      userGroups: [],
      selectedGroup: null,
      messages: [],

      stompClient: null,
      subscription: null,
      isConnected: false,

      newMessage: "",

      allUsers: [],

      showCreateGroupModal: false,
      showManageMembersModal: false,
      showAddMembersModal: false,

      newGroupName: "",
      selectedUserIds: [],
      selectedUsersToAdd: [],

      apiBaseUrl: "http://localhost:8080",
    };
  },

  computed: {
    currentUser() {
      return this.$store.getters.getUser;
    },

    currentUserId() {
      return this.currentUser?.id || null;
    },

    currentUsername() {
      return this.currentUser?.username || "";
    },

    formattedMessages() {
      return this.messages.map(message => {
        const messageType = this.getMessageType(message);
        return { ...message, messageType };
      });
    },

    availableUsers() {
      if (!Array.isArray(this.allUsers)) return [];
      return this.allUsers.filter((u) => u.id !== this.currentUserId);
    },

    nonGroupMembers() {
      if (!this.selectedGroup || !Array.isArray(this.allUsers)) return [];
      const memberIds = this.selectedGroup.members?.map(m => m.id) || [];
      return this.allUsers.filter(u => u.id !== this.currentUserId && !memberIds.includes(u.id));
    },

    canCreateGroup() {
      return this.newGroupName.trim() && this.selectedUserIds.length > 0;
    },

    isCurrentUserAdmin() {
      if (!this.selectedGroup || !this.currentUserId) return false;
      return this.selectedGroup.admin?.id === this.currentUserId;
    }
  },

  watch: {
    currentUserId: {
      immediate: true,
      handler(newVal) {
        if (newVal && this.allUsers.length === 0) this.fetchAllUsers();
      }
    },

    userGroups(newGroups, oldGroups) {
      const newGroup = newGroups.find(
        g => !oldGroups.some(og => og.id === g.id)
      );

      if (newGroup) {
        this.selectGroup(newGroup);
      }
    }
  },

  async mounted() {
    await this.loadInitialData();
    this.connectUserGroupsWebSocket();
  },

  beforeUnmount() {
    this.disconnectWebSocket();
    if (this.userGroupsClient) this.userGroupsClient.deactivate();
  },

  methods: {
    async loadInitialData() {
      try {
        if (!this.currentUserId) {
          setTimeout(() => this.loadInitialData(), 100);
          return;
        }
        await Promise.all([this.fetchUserGroups(), this.fetchAllUsers()]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    },

    async fetchUserGroups() {
      try {
        const res = await fetch(`${this.apiBaseUrl}/group-chat/user/${this.currentUserId}`);
        if (res.ok) this.userGroups = await res.json();
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    },

    async fetchAllUsers() {
      try {
        const res = await fetch(`${this.apiBaseUrl}/users/all?currentUserId=${this.currentUserId}`);
        if (res.ok) {
          const users = await res.json();
          this.allUsers = Array.isArray(users) ? users : [];
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        this.allUsers = [];
      }
    },

    async fetchMessagesForUser(groupId, userId) {
      try {
        const res = await fetch(`${this.apiBaseUrl}/group-chat/${groupId}/messages/user/${userId}`);
        if (res.ok) {
          this.messages = await res.json();
          this.$nextTick(() => this.scrollToBottom());
        }
      } catch (error) {
        console.error("Error fetching messages for user:", error);
      }
    },

    async fetchGroupMembers(groupId) {
      try {
        const res = await fetch(`${this.apiBaseUrl}/group-chat/${groupId}/members`);
        if (res.ok) {
          const members = await res.json();
          this.selectedGroup = { ...this.selectedGroup, members };
        } else {
          this.selectedGroup = { ...this.selectedGroup, members: [] };
        }
      } catch (error) {
        console.error("Error fetching group members:", error);
        this.selectedGroup = { ...this.selectedGroup, members: [] };
      }
    },

    selectGroup(group) {
      if (this.selectedGroup?.id === group.id) return;

      this.selectedGroup = group;
      this.messages = [];
      if (!this.currentUserId) return;

      this.fetchMessagesForUser(group.id, this.currentUserId);
      this.connectToGroup(group.id);
      this.fetchGroupMembers(group.id);
    },

    getMessageType(message) {
      if (message.senderUsername === 'SYSTEM') return 'system';
      if (message.senderUsername === this.currentUsername) return 'current-user';
      return 'other-user';
    },

    connectToGroup(groupId) {
      this.disconnectWebSocket();

      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(`${this.apiBaseUrl}/ws`),
        onConnect: () => {
          this.isConnected = true;
          this.subscription = this.stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
            const receivedMessage = JSON.parse(message.body);
            if (receivedMessage.senderUsername === this.currentUsername) return;
            receivedMessage.timestamp = new Date();
            this.messages.push(receivedMessage);
            this.$nextTick(() => this.scrollToBottom());
          });
        },
        onStompError: (frame) => {
          console.error("WebSocket error:", frame);
          this.isConnected = false;
        },
        onDisconnect: () => {
          this.isConnected = false;
        },
      });

      this.stompClient.activate();
    },

    connectUserGroupsWebSocket() {
      this.userGroupsClient = new Client({
        webSocketFactory: () => new SockJS(`${this.apiBaseUrl}/ws`),
        onConnect: () => {
          this.userGroupsClient.subscribe(`/user/${this.currentUserId}/queue/groups`, (message) => {
            const newGroup = JSON.parse(message.body);
            if (!this.userGroups.find(g => g.id === newGroup.id)) {
              this.userGroups.push(newGroup);
            }
          });
        }
      });
      this.userGroupsClient.activate();
    },

    unsubscribe() {
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    },

    disconnectWebSocket() {
      this.unsubscribe();
      if (this.stompClient) {
        this.stompClient.deactivate();
        this.stompClient = null;
      }
      this.isConnected = false;
    },

    sendMessage() {
      if (!this.newMessage.trim() || !this.isConnected || !this.selectedGroup) return;

      const messageData = { content: this.newMessage.trim(), senderUsername: this.currentUsername };
      this.stompClient.publish({ destination: `/app/chat/${this.selectedGroup.id}`, body: JSON.stringify(messageData) });

      this.messages.push({ ...messageData, timestamp: new Date().toISOString() });
      this.$nextTick(() => this.scrollToBottom());
      this.newMessage = "";
    },

    async createGroup() {
      if (!this.canCreateGroup) return;

      try {
        const groupData = { groupName: this.newGroupName.trim(), adminId: this.currentUserId, memberIds: this.selectedUserIds };
        const res = await fetch(`${this.apiBaseUrl}/group-chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(groupData) });

        if (res.ok) {
          await this.fetchUserGroups();
          const createdGroup = this.userGroups.find(g => g.name === groupData.groupName);
          if (createdGroup) this.selectGroup(createdGroup);
          this.closeCreateGroupModal();
        }
      } catch (error) {
        console.error("Error creating group:", error);
        alert("Failed to create group. Please try again.");
      }
    },

    // --- REFRAKTOROVANO ZA REAL-TIME ---
    async addMember(userId) {
      if (!this.selectedGroup) return;
      try {
        const res = await fetch(`${this.apiBaseUrl}/group-chat/${this.selectedGroup.id}/add-member?userId=${userId}&adminUsername=${this.currentUsername}`, { method: "PUT" });
        if (res.ok) {
          const addedUser = this.allUsers.find(u => u.id === userId);
          if (addedUser) this.selectedGroup.members.push(addedUser);
          this.selectedUsersToAdd = this.selectedUsersToAdd.filter(id => id !== userId);
        }
      } catch (error) {
        console.error("Error adding member:", error);
      }
    },

    async addSelectedMembers() {
      if (!this.selectedGroup || this.selectedUsersToAdd.length === 0) return;
      try {
        for (const userId of [...this.selectedUsersToAdd]) {
          await this.addMember(userId);
        }
        this.closeAddMembersModal();
      } catch (error) {
        console.error("Error adding selected members:", error);
      }
    },

    async removeMember(userId) {
      if (!this.selectedGroup) return;
      try {
        const res = await fetch(`${this.apiBaseUrl}/group-chat/${this.selectedGroup.id}/remove-member?userId=${userId}&adminUsername=${this.currentUsername}`, { method: "PUT" });
        if (res.ok) {
          this.selectedGroup.members = this.selectedGroup.members.filter(m => m.id !== userId);
        }
      } catch (error) {
        console.error("Error removing member:", error);
      }
    },

    openCreateGroupModal() { this.showCreateGroupModal = true; },
    closeCreateGroupModal() { this.showCreateGroupModal = false; this.newGroupName = ""; this.selectedUserIds = []; },
    openManageMembersModal() { this.showManageMembersModal = true; },
    closeManageMembersModal() { this.showManageMembersModal = false; },
    openAddMembersModal() { this.selectedUsersToAdd = []; this.showAddMembersModal = true; },
    closeAddMembersModal() { this.showAddMembersModal = false; this.selectedUsersToAdd = []; },

    formatTime(timestamp) { return timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""; },
    scrollToBottom() { if (this.$refs.messagesContainer) this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight; },
  },
};
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');

.chat-page {
  display: flex;
  height: 100vh;
  font-family: 'Delius Swash Caps', cursive;
  background-color: #fafafa;
  color: #4A4A4A;
}

.chat-wrapper {
  background: linear-gradient(to top, rgba(230, 236, 229, 0), rgba(230, 236, 229, 1)),
              url('@/assets/bunnyTile.png');
  background-size: 100% auto;
  background-position: center;
  background-repeat: repeat;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 80px; /* prostor za typing area */
}

.typing-area {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #e6ece5;
  padding: 1rem;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 10;
}

/* Sidebar */
.sidebar {
  width: 300px;
  background-color: #F5F5F0;
  border-right: 1px solid #ddd;
  padding: 1rem;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: 1rem;
}

.sidebar-header h2 {
  margin: 0 0 1rem 0;
  color: #ec5d43;
  font-weight: 700;
  font-size: 1.8rem;
}

.new-group-btn {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-weight: 500;
  font-family: 'Delius Swash Caps', cursive;
  border: 2px solid #ec5d43;
  background-color: transparent;
  color: #ec5d43;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.new-group-btn:hover {
  background-color: #ec5d43;
  color: white;
}

/* Groups List */
.groups-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.group-item {
  padding: 1rem;
  border-radius: 15px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #ddd;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  font-weight: 600;
}

.group-item:hover {
  background-color: #f18571;
  color: white;
  box-shadow: 0 4px 12px rgba(236, 93, 67, 0.6);
}

.group-item.active {
  background-color: #ec5d43;
  color: white;
  border-color: #ec5d43;
  box-shadow: 0 4px 12px rgba(236, 93, 67, 0.8);
}

.group-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.group-info p {
  margin: 0;
  font-size: 1rem;
  color: #777;
}

.group-item.active .group-info p {
  color: #f5f5f0;
}

.admin-badge {
  background-color: #ec5d43;
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-left: 0.5rem;
  font-weight: 600;
}

/* No groups */
.no-groups {
  text-align: center;
  color: #999;
  padding: 2rem;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Chat area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

/* Empty state */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Chat container */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Chat header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #ddd;
  background-color: #F5F5F0;
}

.chat-info h2 {
  margin: 0;
  color: #ec5d43;
  font-weight: 700;
  font-size: 1.8rem;
}

.chat-info p {
  margin: 0.3rem 0 0 0;
  color: #777;
  font-size: 1rem;
  font-weight: 600;
}

.chat-actions {
  display: flex;
  gap: 0.7rem;
}

.chat-actions .btn {
  font-family: 'Delius Swash Caps', cursive;
  font-weight: 600;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

/* Buttons */
.btn-primary {
  background-color: #ec5d43;
  color: white;
  border: 2px solid #ec5d43;
}

.btn-primary:hover:not(:disabled) {
  background-color: #b33a2f;
  border-color: #b33a2f;
}

.btn-secondary {
  background-color: transparent;
  border: 2px solid #ec5d43;
  color: #ec5d43;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #ec5d43;
  color: white;
}

.btn-success {
  background-color: #4caf50;
  border: 2px solid #4caf50;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #357a38;
  border-color: #357a38;
}

.btn-danger {
  background-color: #dc3545;
  border: 2px solid #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #a52a37;
  border-color: #a52a37;
}

/* Messages container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
  border-radius: 0;
  margin: 0;
  position: relative;
}

.messages-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 80% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 20%);
  pointer-events: none;
}

/* Message styles for different types */
.message {
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

/* Current user messages - right side */
.message.current-user {
  justify-content: flex-end;
}

.message.current-user .message-bubble {
  background: linear-gradient(135deg, #ec5d43 0%, #f18571 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
  max-width: 70%;
  padding: 0.8rem 1.2rem;
  box-shadow: 0 2px 8px rgba(236, 93, 67, 0.3);
  position: relative;
  margin-left: auto;
}

.message.current-user .message-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-left-color: #ec5d43;
  border-bottom: 0;
}

/* Other users messages - left side */
.message.other-user {
  justify-content: flex-start;
}

.message.other-user .message-bubble {
  background: white;
  color: #4A4A4A;
  border-radius: 18px 18px 18px 4px;
  max-width: 70%;
  padding: 0.8rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-right: auto;
}

.message.other-user .message-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-right-color: white;
  border-bottom: 0;
}

/* System messages - center */
.message.system {
  justify-content: center;
}

.message.system .message-bubble {
  background: rgba(255, 255, 255, 0.9);
  color: #777;
  border-radius: 20px;
  max-width: 80%;
  padding: 0.6rem 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-style: italic;
  font-size: 0.9rem;
  border: 1px solid rgba(236, 93, 67, 0.2);
}

/* Message header styling */
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
  font-size: 0.8rem;
}

.message.current-user .message-header {
  flex-direction: row-reverse;
}

.message.current-user .sender {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.message.current-user .timestamp {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 0.5rem;
}

.message.other-user .sender {
  font-weight: 700;
  color: #ec5d43;
  font-size: 0.9rem;
}

.message.other-user .timestamp {
  color: #999;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.message.system .message-header {
  display: none;
}

/* Message content */
.message-content {
  font-size: 1rem;
  line-height: 1.4;
  word-wrap: break-word;
}

/* Message input */
.message-input-area {
  padding: 1rem;
  border-top: 1px solid #ddd;
  background-color: #fff;
  box-shadow: 0 -2px 6px rgba(236, 93, 67, 0.1);
}

.input-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 0.85rem 1rem;
  border: 2px solid #ec5d43;
  border-radius: 12px;
  font-size: 1.1rem;
  font-family: 'Delius Swash Caps', cursive;
  transition: border-color 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: #b33a2f;
}

.send-btn {
  padding: 0.85rem 1.8rem;
  background-color: #ec5d43;
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Delius Swash Caps', cursive;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
  background-color: #b33a2f;
}

/* Connection status */
.connection-status {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #999;
  text-align: center;
  font-style: italic;
}

/* Modal styles - keeping them exactly as they were */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(236, 93, 67, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal {
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(236, 93, 67, 0.3);
  padding: 2rem 2.5rem;
  width: 500px;
  max-width: 90%;
  position: relative;
  font-family: 'Delius Swash Caps', cursive;
  color: #4A4A4A;
  z-index: 10001;
  display: block;
  opacity: 1;
  visibility: visible;
}

/* Modal header/footer */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.5rem;
  color: #ec5d43;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

/* Close button */
.close-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  position: absolute;
  top: 15px;
  right: 18px;
  color: #ec5d43;
  font-weight: 700;
}

/* Forms */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4A4A4A;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-family: 'Delius Swash Caps', cursive;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #ec5d43;
}

/* Users and members list */
.users-list, .members-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  font-family: 'Delius Swash Caps', cursive;
}

.user-option, .member-item {
  margin-bottom: 0.6rem;
  font-weight: 500;
  font-size: 1rem;
  color: #4A4A4A;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: 'Delius Swash Caps', cursive;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;

  /* Pozadina ista kao landing page */
  background-color: #e6ece5;
  background-image: linear-gradient(to bottom, rgba(230, 236, 229, 1), rgba(230, 236, 229, 0));
  background-repeat: no-repeat;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 250px;
  }

  .sidebar-header h2 {
    font-size: 1.5rem;
  }

  .group-item {
    font-size: 1rem;
    padding: 0.8rem;
  }

  .chat-header {
    padding: 1rem;
  }

  .chat-info h2 {
    font-size: 1.3rem;
  }

  .message-input {
    font-size: 1rem;
  }

  .send-btn {
    font-size: 1rem;
    padding: 0.7rem 1.2rem;
  }

  .message.current-user .message-bubble,
  .message.other-user .message-bubble {
    max-width: 85%;
  }
}
</style>
