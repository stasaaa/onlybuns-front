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
        <span>{{ localComments.length }}</span>
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

    <div class="comments-list" v-if="localComments.length > 0">
      <div v-for="comment in localComments" :key="comment.id" class="comment">
        <strong 
          class="username clickable" 
          @click="goToUserProfile(comment.username)"
        >
          {{ comment.username }}:
        </strong> 
        {{ comment.content }}
      </div>
    </div>

    <div v-if="canComment" class="comment-input">
      <input 
        v-model="newComment" 
        type="text" 
        placeholder="Add a comment..." 
        ref="commentInput"
        @keyup.enter="addComment"
      />
      <small :class="{ danger: newComment.length > commentLimit }">
        {{ newComment.length }}/{{ commentLimit }}
      </small>
      <button @click="addComment" :disabled="!newComment.trim() || newComment.length > commentLimit">Post</button>
    </div>
    <div v-if="isEditing" class="modal-overlay">
      <div class="modal">
        <h3 class="modal-title">Edit Post Caption</h3>
        <textarea v-model="editDescription" class="modal-textarea"></textarea>
        <div class="modal-footer">
          <small :class="{ danger: editDescription.length > descLimit }">
            {{ editDescription.length }}/{{ descLimit }}
          </small>
          <div class="modal-actions">
            <button @click="saveEdit" class="btn-primary">Save</button>
            <button @click="closeModal" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/axios/axios';

export default {
  name: 'PostComponent',
  props: {
    post: { type: Object, required: true },
    userId: { type: Number, required: true },
    followedUsersIds: { type: Array, default: () => [] }
  },
  data() {
    return {
      showOptions: false,
      isLiked: false,
      likesCount: this.post.likes,
      newComment: '',
      imageUrl: '',
      localComments: [], // Lokalna kopija komentara
      currentUsername: '', // Čuvamo username trenutnog korisnika
      isEditing: false,
      editDescription: '',
      descLimit: 250,
      commentLimit: 250
    };
  },
  computed: {
    isPostOwner() {
      return this.userId === this.post.userId;
    },
    currentUserId() {
      return this.userId;
    },
    canComment() {
      return (
        this.userId !== -1 &&
        (this.followedUsersIds.includes(this.post.userId) || this.userId === this.post.userId)
      );
    }
  },
  watch: {
    // Kada se post.comments promeni (nakon refresh-a), ažuriraj lokalnu kopiju
    'post.comments': {
      handler(newComments) {
        this.localComments = [...(newComments || [])];
      },
      deep: true
    }
  },
  async created() {
    try {
      const res = await apiClient.get(`/posts/${this.post.id}/liked-by/${this.userId}`);
      this.isLiked = res.data;
    } catch (e) {
      console.error('Error checking like status', e);
    }
    
    // Učitaj username trenutnog korisnika
    if (this.userId !== -1) {
      try {
        const userRes = await apiClient.get(`users/findUsername/${this.userId}`);
        this.currentUsername = userRes.data;
      } catch (e) {
        console.error('Error fetching current username', e);
        this.currentUsername = 'Unknown User';
      }
    }
    
    // Kopiraj postojeće komentare iz post-a
    this.localComments = [...(this.post.comments || [])];
    
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
    closeModal() {
      this.isEditing = false;
      this.showOptions = false;
    },
async addComment() {
  const text = (this.newComment ?? '').trim();
  const limit = this.commentLimit;

  if (text.length === 0) return;
  if (text.length > limit) {
    alert(`Comment cannot exceed ${limit} characters.`);
    return;
  }

  // ne dodaje se odmah u listu - cekanje potvrde
  const originalComment = this.newComment;
  this.newComment = ''; // cisti input

  try {
    const res = await apiClient.post('/comments/new', {
      postId: this.post.id,
      userId: this.userId,
      content: text,
      creationTime: new Date()
    });

    // tek se sada doda u listu kada backend potvrdi uspeh
    const newCommentObj = {
      id: res.data.id,
      username: this.currentUsername,
      content: text,
      userId: this.userId,
      creationTime: new Date()
    };

    this.localComments.unshift(newCommentObj);

  } catch (e) {
    console.error('Error adding comment', e);
    
    // vrati text u input ako se desi greska
    this.newComment = originalComment;
    
    if (e.response && e.response.status === 429) {
      const errorData = e.response.data;
      if (errorData.error === "General rate limit exceeded") {
        alert(`Rate limit exceeded: ${errorData.message}`);
      } else if (errorData.error === "Comment rate limit exceeded") {
        alert(`Comment limit exceeded: ${errorData.message}`);
      }
    } else {
      alert('An error occurred while adding the comment. Please try again.');
    }
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

async editPost() {
  this.isEditing = true;
  this.editDescription = this.post.description || '';
}
,
async saveEdit() {
  const text = (this.editDescription ?? '').trim();
  const limit = Number(this.descLimit) || 250;

  if (text.length === 0) {
    alert('Description cannot be empty.');
    return;
  }
  if (text.length > limit) {
    alert(`Description cannot exceed ${limit} characters.`);
    return;
  }

  try {
    const updatedPost = { ...this.post, description: text };
    await apiClient.put(`/posts/${this.post.id}`, updatedPost);
    this.$emit('post-edited', updatedPost);
    this.closeModal();
  } catch (e) {
    if (e.response && e.response.status === 500) {
      alert(`Description cannot exceed ${limit} characters.`);
    } else if (e.response?.data?.message) {
      alert(e.response.data.message);
    } else {
      alert('Failed to update post. Please try again.');
    }
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
      if (this.userId === -1) {
        this.alertUser();
        return;
      }
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
  word-wrap: break-word;
  overflow-wrap: anywhere;
  white-space: normal;  
}

.comments-list {
  padding: 0 1rem 1rem;
}

.comment {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  display: block;
}

.comment strong {
  display: inline;
  margin-right: 0.3rem;
  white-space: nowrap;
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

.comment-input small { 
  opacity: .7; 
}

.comment-input small.danger { 
  color: #ce361f; opacity: 1; font-weight: bold; 
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(230, 236, 229, 0.7) !important; 
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  width: 400px; 
  max-height: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,.2);
  font-family: 'Delius Swash Caps', cursive;
  color: #4a4a4a;
}
.modal-title { 
  margin: 0 0 .5rem; 
}

.modal-textarea {
  width: 100%;
  min-height: 140px;
  border: 1px solid #c9d6c8;
  border-radius: 6px;
  padding: .6rem .7rem;
  resize: vertical;
  font-family: 'Delius Swash Caps', cursive;
}

.modal-footer {
  margin-top: .6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-actions {
  display: flex;
  gap: .5rem;
}

.btn-primary,
.btn-secondary {
  border: none;
  padding: .45rem .9rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Delius Swash Caps', cursive;
}
.btn-primary { background: #ec5d43; color: #fff; }
.btn-primary:hover { background: #c94530; }
.btn-secondary { background: #e6ece5; color: #4a4a4a; }

.danger {
  color: #ce361f;
  font-weight: bold;
}

</style>