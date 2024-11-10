<template>
    <div class="container">
        <CFormTextarea
            id="description"
            label="Post description"
            rows="3">
        </CFormTextarea>
    </div>
</template>

<script setup>
import { CFormTextarea } from '@coreui/vue';
// import { useStore } from 'vuex';

// const store = useStore();

</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
}
</style>