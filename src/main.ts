import {createApp, ref, onMounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';

const baseUrl = 'https://ec-course-api.hexschool.io/v2';

createApp({
  setup() {
    const userData = ref({
      username: '',
      password: '',
    });
    const productData = ref({
      success: false,
      products: [],
    });
    const showMessage = ref(false);
    const message = ref('');
    const isLoading = ref(false);
    const isLoggedIn = ref(false);
    const temp = ref({});
    const token = ref('');

    const cookieToken = Cookies.get('token');

    const config = {
      headers: {
        Authorization: `${token.value || cookieToken || ''}`,
      },
    };


    async function handleLogin()
    {
      try {
        isLoading.value = true;
        if (userData.value.username === '' || userData.value.password === '') {
          message.value = '請輸入帳號和密碼';
          handleShowMessage(true);
          return isLoading.value = false;
        }
        const res = await axios.post(
          `${baseUrl}/admin/signin`,
          {...userData.value}
        );
        res.data.token && (token.value = res.data.token);
        Cookies.set('token', res.data.token);
        isLoggedIn.value = true;
        isLoading.value = false;
        message.value = '登入成功';
        handleShowMessage(true);
        userData.value = {
          username: '',
          password: '',
        };
      } catch (error) {
        console.log(error);
        isLoading.value = false;
      }
    }

    function handleShowMessage(bool: boolean)
    {
      showMessage.value = bool;
    };

      async function handleCheck()
      {
        try {
          const res = await axios.post(`${baseUrl}/api/user/check`, {}, config);
          if (res.data.success) {
            isLoggedIn.value = true;
            message.value = '登入成功';
            handleShowMessage(true);
          }
        } catch (error: unknown) {
          if ((error as any)?.response?.data?.success === false) {
            message.value = (error as any).response?.data?.message;
            handleShowMessage(true);
            isLoggedIn.value = false;
          }
        }
    }

    async function adminGetAllProducts() {
      const res = await axios.get(`${baseUrl}/api/synthwave/admin/products/all`, config);
      productData.value = res.data;
      console.log(productData.value);
    }

    onMounted(() => {
      handleCheck();
      adminGetAllProducts();
    });

    return {
      userData,
      productData,
      message,
      showMessage,
      isLoading,
      isLoggedIn,
      temp,
      token,
      handleLogin,
      handleCheck,
      handleShowMessage,
      adminGetAllProducts,
    };
  },
}).mount('#app');