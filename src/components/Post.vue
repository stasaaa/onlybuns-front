
<template>
  <div class="post-container">
    <div class="post-card">
      <!-- Post Header -->
      <div class="header">
        <div class="user-info">
          <div class="avatar">
            <span>OB</span>
          </div>
          <div class="user-details">
            <span class="username">OnlyBuns</span>
            <p v-if="post.location" class="location">{{ post.location }}</p>
          </div>
        </div>
        <div v-if="isPostOwner" class="options">
          <button @click="showOptions = !showOptions">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          <div v-if="showOptions" class="options-menu">
            <button @click="editPost">Edit Post</button>
            <button @click="deletePost" class="delete">Delete Post</button>
          </div>
        </div>
      </div>

      <!-- Post Image -->
      <div class="image-container">
        <img :src="post.image" alt="Post image" />
      </div>

      <!-- Post Actions -->
      <div class="actions">
        <div class="buttons">
          <button @click="likePost" :class="{ 'liked': isLiked }">
            <!-- Carrot Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 3C11 3 10.5 3.5 10 4L6 12C5.5 13 5 14 5 15C5 17 6 19 8 20L12 22L16 20C18 19 19 17 19 15C19 14 18.5 13 18 12L14 4C13.5 3.5 13 3 12 3Z" />
              <path d="M12 3L10 12" />
              <path d="M12 3L14 12" />
            </svg>
          </button>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        <p class="likes">{{ post.likes }} likes</p>

        <p class="description">
          <span class="username">OnlyBuns</span>
          {{ post.description }}
        </p>

        <div class="comments">
          <div v-for="comment in post.comments" :key="comment.id" class="comment">
            <span class="username">User {{ comment.userId }}</span>
            {{ comment.content }}
          </div>
        </div>

        <div class="add-comment">
          <input
            v-model="newComment"
            type="text"
            placeholder="Add a comment..."
          />
          <button 
            @click="addComment"
            :disabled="!newComment.trim()"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #fffddb;
  min-height: 100vh;
}

.post-card {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #c9d5c8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ec5d43;
  font-weight: 600;
}

.user-details {
  margin-left: 12px;
}

.username {
  font-weight: 600;
  color: #ec5d43;
}

.location {
  font-size: 0.875rem;
  color: #f18571;
}

.image-container {
  position: relative;
  padding-bottom: 100%;
  overflow: hidden;
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actions {
  padding: 16px;
}

.buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.buttons button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.buttons svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2;
}

.liked {
  color: #ec5d43;
}

.likes {
  font-weight: 600;
  margin: 8px 0;
  color: #ec5d43;
}

.description {
  margin-bottom: 12px;
}

.comments {
  margin-bottom: 12px;
}

.comment {
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.add-comment {
  display: flex;
  gap: 8px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.add-comment input {
  flex: 1;
  padding: 8px;
  border: none;
  background-color: #e6ece5;
  border-radius: 4px;
}

.add-comment button {
  background: none;
  border: none;
  color: #ec5d43;
  font-weight: 600;
  cursor: pointer;
}

.add-comment button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.options {
  position: relative;
}

.options-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 150px;
}

.options-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
}

.options-menu button:hover {
  background-color: #fffddb;
}

.options-menu .delete {
  color: #e5371f;
}

.icon {
  width: 24px;
  height: 24px;
  color: #ec5d43;
}
</style>

<script>
import axios from 'axios';

export default {
  name: 'PostComponent',
  props: {
    post: {
      type: Object,
      required: true
    },
    currentUserId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      showOptions: false,
      showEditModal: false,
      editedDescription: '',
      newComment: '',
      isLiked: false
    }
  },
  computed: {
    isPostOwner() {
      return this.currentUserId === this.post.userId
    }
  },
methods: {
    async likePost() {
      try {
        const response = await axios.post(`${this.baseURL}/api/posts/${this.post.id}/like`);
        if (response.ok) {
          this.isLiked = !this.isLiked;
          this.$emit('post-updated');
        }
      } catch (error) {
        console.error('Error liking post:', error);
      }
    },
    async addComment() {
      if (!this.newComment.trim()) return;
      
      try {
        const response = await axios.post(`${this.baseURL}/api/comments`, {
          postId: this.post.id,
          userId: this.currentUserId,
          content: this.newComment,
          creationTime: new Date()
        });
        
        if (response.status === 201) {
          this.newComment = '';
          this.$emit('post-updated');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    },
    async deletePost() {
      if (!confirm('Are you sure you want to delete this post?')) return;
      
      try {
        const response = await axios.delete(`${this.baseURL}/api/posts/${this.post.id}`);
        if (response.status === 204) {
          this.$emit('post-deleted', this.post.id);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
},
}
</script>