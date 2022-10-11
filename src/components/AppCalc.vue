<template>
  <div class="container mx-auto px-6 md:px-0">
    <div class="lg:h-screen flex my-11 lg:my-0 items-center">
      <div class="flex-1">
        <div class="lg:w-1/2">
          <h1 class="md:text-5xl text-4xl main-text">
            Рассчитайте стоимость автомобиля в лизинг
          </h1>
        </div>
        <form @submit.prevent>
          <div class="grid grid-cols-1 lg:grid-cols-3 mt-8 gap-8">
            <div class="custom-input">
              <label class="text-[#575757] font-gilroy"
                >Стоимость автомобиля</label
              >
              <div
                class="relative mt-6"
                :style="{ opacity: isRequesting ? '.5' : '1' }"
              >
                <div>
                  <currency-input
                    ref="carCostInput"
                    :disabled="isRequesting"
                    v-model="carCost"
                    class="w-full text-3xl text-[#575757] px-6 py-4"
                    type="text"
                    :options="{
                      currency: 'RUB',
                      currencyDisplay: 'hidden',
                      valueRange: { min: 1000000, max: 6000000 },
                    }"
                  />
                </div>
                <vue-slider
                  :min="carCostMinValue"
                  :max="carCostMaxValue"
                  @change="updateCarCost"
                  :disabled="isRequesting"
                  class="absolute bottom-0 left-1/2 -translate-y-1/2 -translate-x-1/2"
                  style="padding: 0"
                  v-model="carCost"
                  v-bind="carCostOptions"
                ></vue-slider>
                <div
                  class="text-3xl mr-3 text-[#575757] absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="font-gilroy-black">₽</span>
                </div>
              </div>
            </div>
            <div class="custom-input">
              <label class="text-[#575757] font-gilroy"
                >Первоначальный взнос</label
              >
              <div
                class="relative mt-6"
                :style="{ opacity: isRequesting ? '.5' : '1' }"
              >
                <div>
                  <currency-input
                    @input.prevent
                    ref="firstPayment"
                    :disabled="isRequesting"
                    :value="calcInitialPayment"
                    class="w-full text-3xl text-[#575757] px-6 py-4"
                    type="text"
                    :options="{ currency: 'RUB' }"
                    readonly
                  />
                  <div
                    class="text-3xl text-[#575757] absolute -right-6 top-1/2 -translate-y-1/2 -translate-x-1/2 custom-rightside-box flex justify-center items-center"
                  >
                    <span class="text-2xl">{{ initialPaymentPercent }}%</span>
                  </div>
                </div>
                <vue-slider
                  v-model="initialPaymentPercent"
                  :disabled="isRequesting"
                  class="absolute bottom-0 left-1/2 -translate-y-1/2 -translate-x-1/2"
                  style="padding: 0"
                  v-bind="firstPaymentOptions"
                ></vue-slider>
              </div>
            </div>
            <div class="custom-input">
              <label class="text-[#575757] font-gilroy">Срок лизинга</label>
              <div
                class="relative mt-6"
                :style="{ opacity: isRequesting ? '.5' : '1' }"
              >
                <div>
                  <currency-input
                    ref="leaseTermInput"
                    :disabled="isRequesting"
                    v-model="leaseTerm"
                    class="w-full text-3xl text-[#575757] px-6 py-4"
                    type="text"
                    :options="{
                      currency: 'RUB',
                      currencyDisplay: 'hidden',
                      valueRange: { min: 1, max: 60 },
                    }"
                  />
                </div>
                <vue-slider
                  v-model="leaseTerm"
                  :disabled="isRequesting"
                  class="absolute bottom-0 left-1/2 -translate-y-1/2 -translate-x-1/2"
                  style="padding: 0"
                  :min="leaseTermMinValue"
                  :max="leaseTermMaxValue"
                  v-bind="leaseTermOptions"
                  @change="updateLeaseTerm"
                ></vue-slider>
                <div
                  class="text-3xl mr-3 text-[#575757] absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="font-gilroy-black">мес.</span>
                </div>
              </div>
            </div>
          </div>
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-8 gap-8 items-center"
          >
            <div>
              <p class="text-[#575757] font-gilroy">Сумма договора лизинга</p>
              <h2 class="md:text-5xl text-4xl">
                {{ calcTotalSum.toLocaleString("ru-RU") }}
                <span class="font-gilroy-black">₽</span>
              </h2>
            </div>
            <div>
              <p class="text-[#575757] font-gilroy">Ежемесячный платеж от</p>
              <h2 class="md:text-5xl text-4xl">
                {{ calcMonthlyPayment.toLocaleString("ru-RU") }}
                <span class="font-gilroy-black">₽</span>
              </h2>
            </div>
            <div>
              <button
                :disabled="isRequesting"
                :style="{
                  background: isRequesting ? 'rgba(255, 149, 20, 0.4)' : '',
                }"
                class="w-full bg-[#FF9514] rounded-full text-2xl md:text-[30px] text-white py-5 hover:bg-[#111111] transition-all duration-500 active:bg-[#575757]"
                @click="sendRequest"
              >
                <div v-if="!isRequesting">Оставить заявку</div>
                <i v-else class="fa-solid fa-circle-notch fa-spin"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script>
import { sendFormRequest } from "@/components/api";
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";
import CurrencyInput from "@/components/CurrencyInput.vue";
export default {
  components: {
    VueSlider,
    CurrencyInput,
  },
  data() {
    return {
      carCost: 3300000,
      leaseTerm: 60,
      initialPayment: null,
      initialPaymentPercent: 13,
      totalSum: 0,
      monthlyPayment: 0,
      isRequesting: false,
      carCostMinValue: 1000000,
      carCostMaxValue: 6000000,
      leaseTermMinValue: 1,
      leaseTermMaxValue: 60,
      carCostOptions: {
        dotSize: 24,
        width: "90%",
        height: 2,
        interval: 50000,
        duration: 0.5,
        tooltip: "none",
        useKeyboard: false,
        dotOptions: {
          style: {
            background: "#FF9514",
          },
        },
        processStyle: {
          background: "#FF9514",
        },
        silent: true,
      },
      firstPaymentOptions: {
        value: this.initialPaymentPercent,
        dotSize: 24,
        width: "90%",
        height: 2,
        min: 10,
        max: 60,
        interval: 1,
        duration: 0.5,

        tooltip: "none",
        useKeyboard: false,
        dotOptions: {
          style: {
            background: "#FF9514",
          },
        },
        processStyle: {
          background: "#FF9514",
        },
        silent: true,
      },
      leaseTermOptions: {
        dotSize: 24,
        width: "90%",
        height: 2,
        interval: 1,
        duration: 0.5,
        tooltip: "none",
        useKeyboard: false,
        dotOptions: {
          style: {
            background: "#FF9514",
          },
        },
        processStyle: {
          background: "#FF9514",
        },
        silent: true,
      },
    };
  },
  computed: {
    calcMonthlyPayment() {
      this.monthlyPayment = Math.floor(
        (this.carCost - this.initialPayment) *
          ((0.035 * Math.pow(1 + 0.035, this.leaseTerm)) /
            (Math.pow(1 + 0.035, this.leaseTerm) - 1))
      );
      return this.monthlyPayment;
    },

    calcTotalSum() {
      this.totalSum =
        this.initialPayment + this.leaseTerm * this.calcMonthlyPayment;
      return this.totalSum;
    },
    calcInitialPayment() {
      this.initialPayment = Math.floor(
        (this.carCost * this.initialPaymentPercent) / 100
      );
      return `${this.initialPayment.toLocaleString("ru-RU")} ₽`;
    },
  },

  methods: {
    updateCarCost(value) {
      this.$refs.carCostInput.inputRef.value = value.toLocaleString("ru-RU");
    },
    updateLeaseTerm(value) {
      this.$refs.leaseTermInput.inputRef.value = value.toLocaleString("ru-RU");
    },
    async sendRequest() {
      this.isRequesting = true;
      let response = sendFormRequest({
        carCost: this.carCost,
        initialPayment: this.initialPayment,
        initialPaymentPercent: this.initialPaymentPercent,
        leaseTerm: this.leaseTerm,
        totalSum: this.totalSum,
        monthlyPayment: this.monthlyPayment,
      });
      response.then((data) => {
        this.isRequesting = false;
        console.log(data);
      });
    },
  },
};
</script>
<style lang="scss">
.main-text {
  line-height: 90%;
}

.custom-rightside-box {
  width: 69px;
  height: 54px;
  background: #ebebec;
  border-radius: 16px;
}

.font-nekst-black {
  font-family: Nekst-black;
}

.custom-input input {
  background: #f3f3f4;
  border-radius: 16px;
  height: 68px;
  font-family: Gilroy-black;

  &:focus {
    outline: none;
  }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
