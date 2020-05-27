<template>
    <contactForm mode="update" :contact="contact" />
</template>

<script type="text/javascript">
import ContactForm from './ContactForm.vue';

export default {
    name : "updateContact",
    components : { ContactForm },
    props : [ 'contact' ]
}
</script>