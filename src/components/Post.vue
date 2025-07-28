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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
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
        <img :src="post.imageUrl" alt="Post image" />
      </div>

      <!-- Post Actions -->
      <div class="actions">
        <div class="buttons">
          <button
            @click="likePost"
            :class="{ liked: isLiked }"
            class="like-btn"
          >
            <!-- Carrot Icon -->
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              class="carrot-icon"
            >
              <path
                d="M12 3C11 3 10.5 3.5 10 4L6 12C5.5 13 5 14 5 15C5 17 6 19 8 20L12 22L16 20C18 19 19 17 19 15C19 14 18.5 13 18 12L14 4C13.5 3.5 13 3 12 3Z"
              />
              <path d="M12 3L10 12" />
              <path d="M12 3L14 12" />
            </svg>
            <span>{{ likesCount }}</span>
          </button>

          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        </div>

        <p class="likes">{{ likesCount }} likes</p>

        <p class="description">
          <span class="username">OnlyBuns</span>
          {{ post.description }}
        </p>

        <div class="comments">
          <div
            v-for="comment in post.comments"
            :key="comment.id"
            class="comment"
          >
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
          <button @click="addComment" :disabled="!newComment.trim()">
            Post
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "PostComponent",
  props: {
    post: {
      type: Object,
      required: true,
    },
    currentUserId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      showOptions: false,
      showEditModal: false,
      editedDescription: "",
      newComment: "",
      isLiked: false,
      likesCount: this.post.likes,
    };
  },
  async created() {
    // Kada se komponenta učita, pitaj backend da li je lajkovano
    try {
      const res = await axios.get(
        `${this.baseURL}/posts/${this.post.id}/liked-by/${this.currentUserId}`
      );
      this.isLiked = res.data;
      this.likesCount = this.post.likes;
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  },
  computed: {
    isPostOwner() {
      return this.currentUserId === this.post.userId;
    },
  },
  methods: {
    async likePost() {
      try {
        const res = await axios.post(
          `${this.baseURL}/posts/${this.post.id}/toggle-like`,
          {
            userId: this.currentUserId,
          }
        );
        if (res.status === 200) {
          // pretpostavimo da backend vraća JSON sa { liked: true/false, likesCount: broj }
          this.isLiked = res.data.liked;
          this.likesCount = res.data.likesCount;
          this.$emit("post-updated");
        }
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },
    async addComment() {
      if (!this.newComment.trim()) return;

      try {
        const response = await axios.post(`${this.baseURL}/api/comments`, {
          postId: this.post.id,
          userId: this.currentUserId,
          content: this.newComment,
          creationTime: new Date(),
        });

        if (response.status === 201) {
          this.newComment = "";
          this.$emit("post-updated");
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },
    async deletePost() {
      if (!confirm("Are you sure you want to delete this post?")) return;

      try {
        const response = await axios.delete(
          `${this.baseURL}/api/posts/${this.post.id}`
        );
        if (response.status === 204) {
          this.$emit("post-deleted", this.post.id);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    },
  },
};
</script>