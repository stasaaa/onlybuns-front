<template>
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal" @click.stop>
        <header class="modal-header">
          <h3>Add Members - {{ groupName }}</h3>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </header>
  
        <section class="modal-body">
          <div v-if="usersToAdd.length === 0" class="no-users">
            All users are already members of this group.
          </div>
          <div v-else class="users-list">
            <label
              v-for="user in usersToAdd"
              :key="user.id"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="user.id"
                v-model="selectedUserIds"
              />
              <span>{{ user.username }}</span>
            </label>
          </div>
        </section>
  
        <footer class="modal-footer">
          <button class="btn-secondary" @click="$emit('close')">Cancel</button>
          <button
            class="btn-primary"
            :disabled="selectedUserIds.length === 0"
            @click="$emit('add', selectedUserIds)"
          >
            Add Selected ({{ selectedUserIds.length }})
          </button>
        </footer>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "AddMembersModal",
    props: {
      groupName: { type: String, required: true },
      usersToAdd: { type: Array, required: true },
    },
    data() {
      return {
        selectedUserIds: [],
      };
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
    width: 360px;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgb(236 93 67 / 0.3);
    padding: 24px 28px;
    max-height: 80vh;
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
    gap: 0.7rem;
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
  