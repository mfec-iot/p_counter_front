<template>
  <div>
    <v-row>
      <v-select
        class="ml-3 mt-1"
        style="max-width: 300px"
        density="compact"
        label="Select"
        :items="items"
        v-model="selectedItem"
        @update:model-value="selected"
      ></v-select>

      <v-spacer></v-spacer>

      <!-- refresh graph -->
      <v-btn
        class="btn-size mr-3 mt-1"
        elevation="0"
        color="primary"
        @click="$emit('resetZoom')"
      >
        <v-icon small>mdi-refresh</v-icon>
      </v-btn>
    </v-row>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "analytic_sidebar",

  created() {
    axios.post("https://p-count-back.onrender.com/firebase").then((response) => {
      const data = response.data;
      this.items = [...data];
      this.$nextTick(() => {
        this.selectLastItem();
      });
    });

    setInterval(() => {
      axios
          .post(`https://p-count-back.onrender.com/firebase/${this.selectedItem}`)
          .then((response) => {
            const data = response.data;
            this.$emit("updateData", data);
          });
        axios
          .post(`https://p-count-back.onrender.com/firebasecount/${this.selectedItem}`)
          .then((response) => {
            const data = response.data;
            this.$emit("updateCount", data);
          });
    }, 1000 * 60);
  },

  data() {
    return {
      items: [],
      selectedItem: null,
    };
  },

  methods: {
    selectLastItem() {
      if (this.items.length > 0) {
        this.selectedItem = this.items[this.items.length - 1];
        this.selected();
      }
    },
    selected() {
      const [day, month, year] = this.selectedItem.split("_").map(Number);
      const valueDate = new Date(year, month - 1, day);

      const chartDay = `${valueDate.getFullYear()}-${
        valueDate.getMonth() + 1
      }-${valueDate.getDate()}`;

      this.$emit("day", chartDay);

      try {
        axios
          .post(`https://p-count-back.onrender.com/firebase/${this.selectedItem}`)
          .then((response) => {
            const data = response.data;
            this.$emit("updateData", data);
          });
        axios
          .post(`https://p-count-back.onrender.com/firebasecount/${this.selectedItem}`)
          .then((response) => {
            const data = response.data;
            this.$emit("updateCount", data);
          });
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
.btn-size {
  max-height: 30px;
}
</style>
