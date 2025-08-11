<template>
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal" @click.stop>
        <header class="modal-header">
          <h3>Manage Members - {{ groupName }}</h3>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </header>
  
        <section class="modal-body">
          <h4 class="section-title">Current Members ({{ members.length }})</h4>
  
          <div class="members-list" v-if="members.length > 0">
            <div v-for="member in members" :key="member.id" class="member-item">
              <span class="member-info">
                {{ member.username }}
                <span v-if="member.id === adminId" class="admin-badge">Admin</span>
              </span>
  
              <button
                v-if="canRemove(member.id)"
                class="btn-remove"
                @click="$emit('remove', member.id)"
                title="Remove member"
              >
                &times;
              </button>
            </div>
          </div>
          <div v-else class="no-users">No members in this group.</div>
        </section>
  
        <footer class="modal-footer">
          <button class="btn-primary" @click="$emit('close')">Done</button>
        </footer>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ManageMembersModal",
    props: {
      groupName: { type: String, required: true },
      members: { type: Array, required: true },
      adminId: { type: Number, required: true },
      currentUserId: { type: Number, required: true },
    },
    methods: {
      canRemove(memberId) {
        return memberId !== this.adminId && memberId !== this.currentUserId;
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
    width: 400px;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgb(236 93 67 / 0.3);
    padding: 24px 28px;
    max-height: 85vh;
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
    gap: 1rem;
  }
  
  .section-title {
    font-weight: 600;
    color: #c94f3b;
    margin-bottom: 0.5rem;
    border-bottom: 1.5px solid #f18571;
    padding-bottom: 4px;
  }
  
  .members-list {
    border: 1.5px solid #f18571;
    border-radius: 8px;
    max-height: 240px;
    overflow-y: auto;
    background: #fff8d6;
    padding: 8px;
  }
  
  .member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #f0e6cc;
    color: #9b3a23;
    font-weight: 600;
  }
  
  .member-item:last-child {
    border-bottom: none;
  }
  
  .member-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .admin-badge {
    background-color: #ec5d43;
    color: white;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
  }
  
  .btn-remove {
    background-color: transparent;
    border: none;
    font-size: 1.6rem;
    color: #e5371f;
    cursor: pointer;
    font-weight: 900;
    line-height: 1;
    padding: 0 4px;
    transition: color 0.3s ease;
  }
  
  .btn-remove:hover {
    color: #b42a17;
  }
  
  .no-users {
    color: #b66f61;
    text-align: center;
    font-style: italic;
    padding: 1rem 0;
  }
  
  .modal-footer {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
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
  
  .btn-primary:hover {
    background-color: #c8442d;
  }
  </style>
  