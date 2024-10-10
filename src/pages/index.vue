<template>
  <v-container class="fill-height justify-center flex-column">
    <h1>{{ count }}</h1>
    <v-btn @click="reset">Reset</v-btn>
  </v-container>
</template>

<script>
import socket from "@/socket";

export default {
  data() {
    return {
      count: 0,
    };
  },
  mounted() {
    socket.on("counter", (data) => {
      this.count = data;
    });
  },
  methods: {
    reset() {
      socket.emit("reset");
    },
  },
};
</script>
