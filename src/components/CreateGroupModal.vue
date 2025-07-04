<!-- CreateGroupModal.vue -->
<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Create New Group</h3>
          <button @click="$emit('close')" class="close-btn">&times;</button>
        </div>
  
        <div class="modal-body">
          <div class="form-group">
            <label for="groupName">Group Name</label>
            <input
              id="groupName"
              v-model="localGroupName"
              type="text"
              placeholder="Enter group name"
              class="form-input"
              @keyup.enter="create"
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
                    v-model="localSelectedUserIds"
                  />
                  <span>{{ user.username }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
  
        <div class="modal-footer">
          <button @click="$emit('close')" class="btn btn-secondary">Cancel</button>
          <button
            @click="create"
            :disabled="!canCreate"
            class="btn btn-primary"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      availableUsers: Array,
      selectedUserIds: Array,
      newGroupName: String,
    },
    emits: ['close', 'create', 'update:selectedUserIds', 'update:newGroupName'],
    data() {
      return {
        localSelectedUserIds: this.selectedUserIds || [],
        localGroupName: this.newGroupName || '',
      };
    },
    watch: {
      selectedUserIds(val) {
        this.localSelectedUserIds = val;
      },
      newGroupName(val) {
        this.localGroupName = val;
      },
      localSelectedUserIds(val) {
        this.$emit('update:selectedUserIds', val);
      },
      localGroupName(val) {
        this.$emit('update:newGroupName', val);
      },
    },
    computed: {
      canCreate() {
        return this.localGroupName.trim() && this.localSelectedUserIds.length > 0;
      },
    },
    methods: {
      create() {
        if (this.canCreate) this.$emit('create');
      },
    },
  };
  </script>
  
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(30, 30, 30, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
  }
  
  .modal {
    background: #fffbe6;
    width: 380px;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgb(236 93 67 / 0.3);
    padding: 24px 28px;
    max-height: 90vh;
    overflow-y: auto;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    color: #ec5d43;
    font-weight: 700;
    font-size: 1.25rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    line-height: 1;
    cursor: pointer;
    color: #ec5d43;
    font-weight: 700;
  }
  
  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .label {
    font-weight: 600;
    color: #c94f3b;
    margin-bottom: 0.3rem;
  }
  
  .input {
    padding: 10px 12px;
    font-size: 1rem;
    border: 1.5px solid #f18571;
    border-radius: 8px;
    outline-offset: 2px;
    transition: border-color 0.3s ease;
  }
  
  .input:focus {
    border-color: #ec5d43;
  }
  
  .users-list {
    max-height: 160px;
    overflow-y: auto;
    border: 1.5px solid #f18571;
    border-radius: 8px;
    padding: 8px;
    background: #fff8d6;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    cursor: pointer;
    user-select: none;
    color: #b0452a;
    font-weight: 500;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  .no-users {
    color: #b66f61;
    text-align: center;
    font-style: italic;
    padding: 1rem 0;
  }
  
  .modal-footer {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
  
  .btn-primary {
    background-color: #ec5d43;
    color: white;
    padding: 0.6rem 1.3rem;
    border-radius: 8px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .btn-primary:disabled {
    background-color: #f9b3a0;
    cursor: not-allowed;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: #c8442d;
  }
  
  .btn-secondary {
    background-color: #f18571;
    color: white;
    padding: 0.6rem 1.3rem;
    border-radius: 8px;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .btn-secondary:hover {
    background-color: #b45443;
  }
  </style>
  