<template>
  <v-container fluid>
    <v-row>
      <v-col cols="8">
        <div class="mb-5 mt-2">
          <analytic_sidebar
            @resetZoom="resetZoom"
            @updateData="updateData"
            @day="selectDay"
            @updateCount="updateCount"
          />
        </div>
        <div class="chart">
          <canvas id="mychart"></canvas>
        </div>
      </v-col>
      <v-col cols="4" class="d-flex flex-column justify-start">
        <v-card style="background-color: lightblue">
          <v-card-text class="title">
            จำนวนผู้เข้าชมสูงสุด: <span class="ml-2">{{ count }}</span>
            <span class="ml-2">คน</span>
          </v-card-text>
        </v-card>
        <v-card class="mt-3" style="background-color: lightblue">
          <v-card-text class="title">
            ช่วงเวลาที่คนเข้าชมมากที่สุด: <span class="ml-2">{{ maxKey }}</span>
            <span class="ml-2">น.</span>
          </v-card-text>
          <v-card-text class="title">
            จำนวน: <span class="ml-2">{{ maxValue }}</span>
            <span class="ml-2">คน</span>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import socket from "@/socket";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import analytic_sidebar from "@/components/analytic_sidebar.vue";

export default {
  components: {
    analytic_sidebar,
  },

  data() {
    return {
      rawdata: null,
      chart: null,
      day: null,
      count: null,
      maxValue: null,
      maxKey: null,

      data: [
        {
          x: new Date("2021-09-01T00:00:00Z"),
          y: 10,
        },
      ],
    };
  },
  mounted() {
    socket.on("counter", (data) => {
      const selectday = new Date(this.day);
      const today = new Date();
      if (
        selectday.getDate() === today.getDate() &&
        selectday.getMonth() === today.getMonth() &&
        selectday.getFullYear() === today.getFullYear()
      ) {
        this.count = data;
      }
    });
  },

  methods: {
    updateCount(count) {
      this.count = count.count;
    },
    selectDay(day) {
      this.day = day;
    },
    getHourRange(time) {
      const [hour] = time.split(":");
      return `${hour}:00`;
    },
    countValuePerHour(data) {
      const counts = {};

      Object.keys(data).forEach((time) => {
        const hourRange = this.getHourRange(time);
        if (!counts[hourRange]) {
          counts[hourRange] = 0;
        }
        counts[hourRange]++;
      });

      return counts;
    },
    async updateData(data) {
      this.rawdata = data.data;
      const newData = this.countValuePerHour(data.data);
      const update = [];
      Object.keys(newData).forEach((time) => {
        update.push({
          x: new Date(`${this.day} ${time}:00`),
          y: newData[time],
        });
      });
      if (this.chart) {
        await this.chart.destroy();
      }
      this.data = update;
      const maxObj = this.data.reduce(
        (max, obj) => (obj.y > max.y ? obj : max),
        this.data[0]
      );
      const maxTime = `${maxObj.x.getHours()}:${maxObj.x.getMinutes()}0`;
      this.maxKey = maxTime;
      this.maxValue = maxObj.y;

      const ctx = document.getElementById("mychart")?.getContext("2d");
      if (ctx) {
        this.buildChart(ctx);
      } else {
        console.error("Canvas element not found");
      }
    },
    resetZoom() {
      this.chart.resetZoom();
    },
    buildChart(ctx) {
      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          datasets: [
            {
              label: "จำนวนผู้เข้าชม",
              data: this.data,
              fill: "start",
              tension: 0.1,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "time",
              time: {
                displayFormats: {
                  millisecond: "HH:mm",
                  second: "HH:mm",
                  minute: "HH:mm",
                  hour: "HH:mm",
                  day: "d MMM",
                  week: "MMM d",
                  month: "MMM yyyy",
                  quarter: "MMM yyyy",
                  year: "yyyy",
                },
                unit: "hour",
                stepSize: 1,
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 12,
              },
            },
            y: {
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 7,
              },
            },
          },
          plugins: {
            zoom: {
              zoom: {
                mode: "x",
                drag: {
                  enabled: true,
                },
              },
            },
          },
          interaction: {
            intersect: false,
            mode: "nearest",
            axis: "x",
          },
        },
      });
    },
  },
};

Chart.register(zoomPlugin);
</script>

<style scoped>
.title {
  font-size: 1.5rem;
  font-weight: 500;
}
</style>
