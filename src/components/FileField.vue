<template>
    <div class="FileField_wrapper">
        <input type="file" name="image" id="file-field" v-on:change="updatePreview" style="display: none;"/>

        <img v-bind:src="imagePreview" class="preview-image" v-on:click.prevent="openUpload"/>
    </div>
</template>

<script>
    import missingImage from '@/assets/missing-image.png';

    export default {
        data () {
            return {
                imagePreview: missingImage,
            }
        },

        methods: {
            openUpload() {
                document.getElementById('file-field').click();
            },
            updatePreview(e) {
                var reader, files = e.target.files;

                if(files.length === 0) {
                    console.log('empty');
                    return;
                }

                reader = new FileReader();
                reader.onload = (e) => {
                    this.imagePreview = e.target.result;
                }

                this.$emit('file-selected', files[0])
                reader.readAsDataURL(files[0]);
            }
        }
    }
</script>

<style>
.preview-image {
    width: 30vw;
    height: 40vh;
}
</style>