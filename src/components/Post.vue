<template>
  <div class="post-card">
    <div class="header">
      <div class="user-info">
        <div class="avatar">
          <span>{{ post.username?.[0].toUpperCase() || 'U' }}</span>
        </div>
        <div class="user-details">
          <span 
            class="username clickable" 
            @click="goToUserProfile(post.username)"
          >
            {{ post.username }}
          </span>
          <p v-if="post.address" class="location">
            <font-awesome-icon :icon="['fas', 'location-dot']" /> 
            {{ post.address.city }}, {{ post.address.street }}
          </p>
        </div>
      </div>
      <div v-if="isPostOwner" class="options">
        <button @click="showOptions = !showOptions" class="options-btn">
          <font-awesome-icon :icon="['fas', 'ellipsis-h']" />
        </button>
        <div v-if="showOptions" class="options-menu">
          <button @click="editPost">Edit Post</button>
          <button @click="deletePost" class="delete">Delete Post</button>
        </div>
      </div>
    </div>

    <div class="image-container">
  <img :src="imageUrl" alt="Post image" />

</div>


    <div class="interaction-buttons">
      <button 
        @click="toggleLike" 
        :class="{ liked: isLiked }" 
        class="interaction-btn like-btn"
      >
        <font-awesome-icon :icon="['fas', 'carrot']" class="carrot-icon" />
        <span>{{ likesCount }}</span>
      </button>

      <button class="interaction-btn" @click="focusCommentInput">
        <font-awesome-icon :icon="['fas', 'comment']" />
        <span>{{ post.comments?.length || 0 }}</span>
      </button>
    </div>

    <p class="post-description">
      <span 
        class="username clickable" 
        @click="goToUserProfile(post.username)"
      >
        {{ post.username }}
      </span> 
      {{ post.description }}
    </p>

    <div class="comments-list" v-if="post.comments?.length > 0">
      <div v-for="comment in post.comments" :key="comment.id" class="comment">
        <strong 
          class="username clickable" 
          @click="goToUserProfile(comment.username)"
        >
          {{ comment.username }}:
        </strong> 
        {{ comment.content }}
      </div>
    </div>

    <div v-if="currentUserId !== -1" class="comment-input">
      <input 
        v-model="newComment" 
        type="text" 
        placeholder="Add a comment..." 
        ref="commentInput"
      />
      <button @click="addComment" :disabled="!newComment.trim()">Post</button>
    </div>
  </div>
</template>

<script>
import apiClient from '@/axios/axios';

export default {
  name: 'PostComponent',
  props: {
    post: { type: Object, required: true },
    userId: { type: Number, required: true }
  },
  data() {
    return {
      showOptions: false,
      isLiked: false,
      likesCount: this.post.likes,
      newComment: '',
      imageUrl: '',
    };
  },
  computed: {
    isPostOwner() {
      return this.userId === this.post.userId;
    }
  },
  async created() {
    // Proveri da li je lajkovano
    try {
      const res = await apiClient.get(`/posts/${this.post.id}/liked-by/${this.userId}`);
      this.isLiked = res.data;
    } catch (e) {
      console.error('Error checking like status', e);
    }
     await this.loadImage();
  },
  beforeUnmount() {
  if (this.imageUrl) {
    URL.revokeObjectURL(this.imageUrl);
  }
},
  methods: {
    async toggleLike() {
      if (this.userId === -1) {
        this.alertUser();
        return;
      }
      try {
        const res = await apiClient.post(`/posts/${this.post.id}/toggle-like`, { userId: this.userId });
        this.isLiked = res.data.liked;
        this.likesCount = res.data.likesCount;
        this.$emit('post-updated');
      } catch (e) {
        console.error('Error toggling like', e);
      }
    },
    async addComment() {
      if (!this.newComment.trim()) return;
      try {
        const res = await apiClient.post('/comments/new', {
          postId: this.post.id,
          userId: this.userId,
          content: this.newComment,
          creationTime: new Date()
        });
        const newCommentObj = {
          id: res.data.id,
          username: this.post.username,
          content: this.newComment,
          userId: this.userId,
          creationTime: new Date()
        };
        this.newComment = '';
        this.$emit('comment-added', newCommentObj);
      } catch (e) {
        console.error('Error adding comment', e);
      }
    },
     async loadImage() {
    try {
      const response = await apiClient.get(`/posts/${this.post.id}/image`, { responseType: 'blob' });
      this.imageUrl = URL.createObjectURL(response.data);
    } catch (e) {
      console.error('Error loading image', e);
    }
  },
    getPostImageUrl(postId) {
    return apiClient.get(`/posts/${postId}/image`);
  },
    async editPost() {
      const updatedDesc = prompt('Update post description:', this.post.description);
      if (updatedDesc === null) return;
      try {
        const updatedPost = { ...this.post, description: updatedDesc };
        await apiClient.put(`/posts/${this.post.id}`, updatedPost);
        this.$emit('post-edited', updatedPost);
        this.showOptions = false;
      } catch (e) {
        console.error('Error updating post', e);
      }
    },
    async deletePost() {
      if (!confirm('Are you sure you want to delete this post?')) return;
      try {
        await apiClient.delete(`/posts/${this.post.id}`);
        this.$emit('post-deleted', this.post.id);
      } catch (e) {
        console.error('Error deleting post', e);
      }
    },
    alertUser() {
      this.$emit('alert-user');
    },
    goToUserProfile(username) {
      if (!username) return;
      this.$router.push({ name: 'UserProfile', query: { username } });
    },
    focusCommentInput() {
      this.$refs.commentInput.focus();
    }
  }
};
</script>

<style>
.post-card {
  width: 100%;
  max-width: 500px;
  margin: 1rem auto;
  background-color: #e6ece5;
  border: 2px solid #c9d6c8;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  font-family: 'Delius Swash Caps', cursive;
  color: #4a4a4a;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  background-color: #ec5d43;
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: 1.4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

.user-details .username {
  font-weight: 700;
  font-size: 1.1rem;
}

.location {
  color: #ec5d43;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.image-container img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-top: 2px solid #c9d6c8;
  border-bottom: 2px solid #c9d6c8;
}

.interaction-buttons {
  display: flex;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #c9d6c8;
}

.interaction-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #4a4a4a;
  font-size: 1.1rem;
  transition: color 0.2s ease;
}

.interaction-btn:hover {
  color: #ec5d43;
}

.liked {
  color: #ec5d43;
}

.carrot-icon {
  width: 20px;
  height: 20px;
  transform: rotate(315deg);
  fill: currentColor;
}

.post-description {
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.3;
}

.comments-list {
  padding: 0 1rem 1rem;
}

.comment {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.comment-input {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.comment-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #c9d6c8;
  border-radius: 5px;
  font-family: 'Delius Swash Caps', cursive;
}

.comment-input button {
  background-color: #ec5d43;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Delius Swash Caps', cursive;
  transition: background-color 0.2s ease;
}

.comment-input button:disabled {
  background-color: #c9d6c8;
  cursor: not-allowed;
}

.comment-input button:hover:not(:disabled) {
  background-color: #c94530;
}

.options {
  position: relative;
}

.options-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #4a4a4a;
  font-size: 1.2rem;
  padding: 0;
}

.options-menu {
  position: absolute;
  right: 0;
  top: 2rem;
  background: white;
  border: 1px solid #c9d6c8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 100;
}

.options-menu button {
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Delius Swash Caps', cursive;
  color: #4a4a4a;
  text-align: left;
  transition: background-color 0.2s ease;
}

.options-menu button.delete {
  color: #ec5d43;
}

.options-menu button:hover {
  background-color: #f5f5f5;
}

/* Dodaj klikabilan username */
.username.clickable {
  cursor: pointer;
  color: #ec5d43;
  text-decoration: underline;
}

.username.clickable:hover {
  color: #c94530;
}
.posts-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

</style>
